import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/firebase";

export async function POST(req: NextRequest) {
  try {
    const {
      email,
      amount,
      network,
      beneficiary,
      packageId,
      packageLabel,
      dataSize,
    } = await req.json();

    if (!email || !amount || !network || !beneficiary || !packageId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Initialize Paystack payment
    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100), // Paystack uses pesewas (GHS kobo)
        currency: "GHS",
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/paystack/verify`,
        metadata: {
          network,
          beneficiary,
          packageId,
          packageLabel,
          dataSize,
          email,
        },
      }),
    });

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
      return NextResponse.json({ error: paystackData.message || "Paystack init failed" }, { status: 400 });
    }

    const { reference, access_code, authorization_url } = paystackData.data;

    // Save pending order to Firestore
    const docId = await createOrder({
      orderId: 0,
      network,
      beneficiary,
      packageId,
      packageLabel,
      dataSize,
      amount,
      status: "Pending",
      paystackRef: reference,
      email,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      status: "success",
      reference,
      access_code,
      authorization_url,
      docId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
