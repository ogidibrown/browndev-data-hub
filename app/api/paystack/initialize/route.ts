import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/firebase";
import { ALLOWED_NETWORKS } from "@/lib/config";
import { log } from "@/lib/logger";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";

const ROUTE = "paystack/initialize";

// Accepts: 0XXXXXXXXX (local) or 233XXXXXXXXX (intl) — 10 or 12 digits
const GH_PHONE_RE = /^(0\d{9}|233\d{9})$/;

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
    const { email, amount, network, beneficiary, packageId, packageLabel, dataSize } = body;

    // Required field check
    if (!email || !amount || !network || !beneficiary || !packageId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate network
    if (!ALLOWED_NETWORKS.includes(network)) {
      return NextResponse.json({ error: "Invalid network" }, { status: 400 });
    }

    // Validate phone number
    const phone = String(beneficiary).replace(/\s/g, "");
    if (!GH_PHONE_RE.test(phone)) {
      return NextResponse.json({ error: "Invalid Ghana phone number" }, { status: 400 });
    }

    // Validate amount is a positive number
    const amountNum = Number(amount);
    if (!isFinite(amountNum) || amountNum <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Validate packageId is a positive integer
    const packageIdNum = Number(packageId);
    if (!Number.isInteger(packageIdNum) || packageIdNum <= 0) {
      return NextResponse.json({ error: "Invalid packageId" }, { status: 400 });
    }

    log.info(ROUTE, "Initializing payment", {
      email,
      network,
      beneficiary: phone,
      packageId: packageIdNum,
      amount: amountNum,
      ip,
      remaining,
    });

    // Initialize Paystack payment
    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amountNum * 100), // pesewas
        currency: "GHS",
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/paystack/verify`,
        metadata: {
          network,
          beneficiary: phone,
          packageId: packageIdNum,
          packageLabel,
          dataSize,
          email,
        },
      }),
    });

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
      log.warn(ROUTE, "Paystack init failed", { message: paystackData.message });
      return NextResponse.json({ error: paystackData.message || "Paystack init failed" }, { status: 400 });
    }

    const { reference, access_code, authorization_url } = paystackData.data;

    // Save pending order to Firestore
    const docId = await createOrder({
      orderId: 0,
      network,
      beneficiary: phone,
      packageId: packageIdNum,
      packageLabel: packageLabel ?? "",
      dataSize: dataSize ?? 0,
      amount: amountNum,
      status: "Pending",
      paystackRef: reference,
      email,
      createdAt: new Date().toISOString(),
    });

    log.info(ROUTE, "Order created", { reference, docId });

    return NextResponse.json({ status: "success", reference, access_code, authorization_url, docId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    log.error(ROUTE, "Unhandled error", { err: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
