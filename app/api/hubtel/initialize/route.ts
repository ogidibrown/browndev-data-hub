import { NextRequest, NextResponse } from "next/server";
import { getBundleById, createOrder } from "@/lib/firebase";
import { log } from "@/lib/logger";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";

const ROUTE = "hubtel/initialize";

const GH_PHONE_RE = /^(0\d{9}|233\d{9})$/;
const NETWORK_PREFIXES: Record<string, string[]> = {
  mtn: ["024", "054", "055", "059", "025"],
  telecel: ["020", "050"],
  airteltigo: ["027", "057", "026", "056"],
};

export async function POST(req: NextRequest) {
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
    const { bundleId, phoneNumber, email } = body as {
      bundleId?: string;
      phoneNumber?: string;
      email?: string;
    };

    if (!bundleId || !phoneNumber || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const phone = String(phoneNumber).replace(/\s/g, "");
    if (!GH_PHONE_RE.test(phone)) {
      return NextResponse.json({ error: "Invalid Ghana phone number" }, { status: 400 });
    }

    const bundle = await getBundleById(bundleId);
    if (!bundle || !bundle.id) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
    }
    if (!bundle.active) {
      return NextResponse.json({ error: "This bundle is no longer available" }, { status: 410 });
    }

    const prefixes = NETWORK_PREFIXES[bundle.network] ?? [];
    const localPhone = phone.startsWith("233") ? "0" + phone.slice(3) : phone;
    if (prefixes.length > 0 && !prefixes.some((p) => localPhone.startsWith(p))) {
      return NextResponse.json(
        { error: `Phone number does not match ${bundle.network.toUpperCase()} network` },
        { status: 400 }
      );
    }

    const clientId = process.env.HUBTEL_CLIENT_ID ?? "";
    const clientSecret = process.env.HUBTEL_CLIENT_SECRET ?? "";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    // Unique reference — BD prefix so it's identifiable in Hubtel dashboard
    const paymentRef = `BD-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    log.info(ROUTE, "Initializing Hubtel payment", {
      bundleId: bundle.id,
      network: bundle.network,
      dataSize: bundle.dataSize,
      sellingPrice: bundle.sellingPrice,
      beneficiary: phone,
      paymentRef,
      ip,
      remaining,
    });

    // NOTE: verify this endpoint against your Hubtel merchant dashboard / API docs
    const hubtelRes = await fetch(
      `https://api.hubtel.com/v1/merchantaccount/merchants/${clientId}/sales/initiate`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          totalAmount: bundle.sellingPrice,
          description: `${bundle.label} ${bundle.network.toUpperCase()} Data Bundle`,
          callbackUrl: `${appUrl}/api/hubtel/callback`,
          returnUrl: `${appUrl}/order-status?ref=${paymentRef}&status=success`,
          cancellationUrl: `${appUrl}/?error=payment_cancelled`,
          merchantAccountNumber: clientId,
          clientReference: paymentRef,
        }),
      }
    );

    const hubtelData = await hubtelRes.json();

    // Hubtel uses responseCode "0000" for success (may be PascalCase or camelCase)
    const responseCode = hubtelData.responseCode ?? hubtelData.ResponseCode;
    if (responseCode !== "0000") {
      log.warn(ROUTE, "Hubtel init failed", { responseCode, hubtelData });
      return NextResponse.json(
        { error: hubtelData.message ?? hubtelData.Message ?? "Payment initialization failed" },
        { status: 400 }
      );
    }

    // Field name may vary by Hubtel account type — handle both casings
    const data = hubtelData.data ?? hubtelData.Data ?? {};
    const checkoutUrl =
      data.checkoutDirectUrl ??
      data.CheckoutDirectUrl ??
      data.checkoutUrl ??
      data.CheckoutUrl;

    if (!checkoutUrl) {
      log.error(ROUTE, "Hubtel did not return a checkout URL", { hubtelData });
      return NextResponse.json({ error: "Could not get payment URL from Hubtel" }, { status: 500 });
    }

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
      paystackRef: paymentRef,
      email: email.trim(),
      createdAt: new Date().toISOString(),
    });

    log.info(ROUTE, "Order created", { paymentRef, docId, bundleId: bundle.id });

    return NextResponse.json({ status: "success", reference: paymentRef, checkoutUrl, docId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    log.error(ROUTE, "Unhandled error", { err: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
