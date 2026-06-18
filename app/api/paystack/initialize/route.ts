import { NextRequest, NextResponse } from "next/server";
import { getBundleById, createOrder } from "@/lib/firebase";
import { log } from "@/lib/logger";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";

const ROUTE = "paystack/initialize";

// Accepts: 0XXXXXXXXX (local, 10 digits) or 233XXXXXXXXX (intl, 12 digits)
const GH_PHONE_RE = /^(0\d{9}|233\d{9})$/;

// Network-to-valid-prefix map — validated server-side to prevent cross-network abuse
const NETWORK_PREFIXES: Record<string, string[]> = {
  mtn: ["024", "054", "055", "059", "025"],
  telecel: ["020", "050"],
  airteltigo: ["027", "057", "026", "056"],
};

export async function POST(req: NextRequest) {
  // Rate limiting — max 5 payment initializations per IP per minute
  const ip = getClientIp(req);
  const { allowed, remaining, resetAt } = checkRateLimit(ip);
  if (!allowed) {
    log.warn(ROUTE, "Rate limit exceeded", { ip });
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute and try again." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  try {
    const body = await req.json();

    // Frontend sends only these three fields — everything else is backend-controlled
    const { bundleId, phoneNumber, email } = body as {
      bundleId?: string;
      phoneNumber?: string;
      email?: string;
    };

    if (!bundleId || !phoneNumber || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Validate phone format
    const phone = String(phoneNumber).replace(/\s/g, "");
    if (!GH_PHONE_RE.test(phone)) {
      return NextResponse.json({ error: "Invalid Ghana phone number" }, { status: 400 });
    }

    // Load bundle from Firestore — backend is the single source of truth for price and idataPackageId
    const bundle = await getBundleById(bundleId);
    if (!bundle || !bundle.id) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
    }
    if (!bundle.active) {
      return NextResponse.json({ error: "This bundle is no longer available" }, { status: 410 });
    }

    // Validate phone prefix matches bundle network (prevent e.g. MTN bundle on Telecel number)
    const prefixes = NETWORK_PREFIXES[bundle.network] ?? [];
    const localPhone = phone.startsWith("233") ? "0" + phone.slice(3) : phone;
    if (prefixes.length > 0 && !prefixes.some((p) => localPhone.startsWith(p))) {
      return NextResponse.json(
        { error: `Phone number does not match ${bundle.network.toUpperCase()} network` },
        { status: 400 }
      );
    }

    log.info(ROUTE, "Initializing payment", {
      bundleId: bundle.id,
      network: bundle.network,
      dataSize: bundle.dataSize,
      sellingPrice: bundle.sellingPrice,
      beneficiary: phone,
      ip,
      remaining,
    });

    // Initialize Paystack using the backend-controlled selling price — never the frontend value
    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim(),
        amount: Math.round(bundle.sellingPrice * 100), // pesewas
        currency: "GHS",
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/paystack/verify`,
        metadata: {
          // Only what we need to cross-validate on the other side
          bundleId: bundle.id,
          beneficiary: phone,
          email: email.trim(),
        },
      }),
    });

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
      log.warn(ROUTE, "Paystack init failed", { message: paystackData.message });
      return NextResponse.json(
        { error: paystackData.message || "Payment initialization failed" },
        { status: 400 }
      );
    }

    const { reference, access_code, authorization_url } = paystackData.data;

    // Save pending order — amount and idataPackageId come from Firestore, never the client
    const docId = await createOrder({
      bundleId: bundle.id,
      network: bundle.network,
      beneficiary: phone,
      idataPackageId: bundle.idataPackageId,
      packageLabel: bundle.label,
      dataSize: bundle.dataSize,
      amount: bundle.sellingPrice,
      status: "Pending",
      paystackRef: reference,
      email: email.trim(),
      createdAt: new Date().toISOString(),
    });

    log.info(ROUTE, "Order created", { reference, docId, bundleId: bundle.id });

    return NextResponse.json({ status: "success", reference, access_code, authorization_url, docId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    log.error(ROUTE, "Unhandled error", { err: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
