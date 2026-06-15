import { NextRequest, NextResponse } from "next/server";
import { findOrderByRef, updateOrderById } from "@/lib/firebase";
import { placeOrder } from "@/lib/idata";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=no_reference`);
  }

  try {
    // Verify with Paystack
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });
    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data.status !== "success") {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}?error=payment_failed&ref=${reference}`
      );
    }

    const meta = verifyData.data.metadata;

    // Find Firestore doc
    const order = await findOrderByRef(reference);
    if (!order || !order.id) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=order_not_found`);
    }

    // Place order with iDATA
    const idataResult = await placeOrder({
      network: meta.network,
      beneficiary: meta.beneficiary,
      "pa_data-bundle-packages": meta.packageId,
    });

    if (idataResult.status === "success") {
      await updateOrderById(order.id, {
        orderId: idataResult.order_id,
        status: "Completed",
        updatedAt: new Date().toISOString(),
      });
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/order-status?ref=${reference}&status=success&order_id=${idataResult.order_id}`
      );
    } else {
      await updateOrderById(order.id, { status: "Failed", updatedAt: new Date().toISOString() });
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/order-status?ref=${reference}&status=failed`
      );
    }
  } catch (err) {
    console.error("Verify error:", err);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/order-status?ref=${reference}&status=error`
    );
  }
}

// Also support POST for inline Paystack callback
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { reference } = body;
  if (!reference) return NextResponse.json({ error: "No reference" }, { status: 400 });

  try {
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });
    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data.status !== "success") {
      return NextResponse.json({ error: "Payment not successful" }, { status: 400 });
    }

    const meta = verifyData.data.metadata;
    const order = await findOrderByRef(reference);
    if (!order || !order.id) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const idataResult = await placeOrder({
      network: meta.network,
      beneficiary: meta.beneficiary,
      "pa_data-bundle-packages": meta.packageId,
    });

    if (idataResult.status === "success") {
      await updateOrderById(order.id, {
        orderId: idataResult.order_id,
        status: "Completed",
        updatedAt: new Date().toISOString(),
      });
      return NextResponse.json({ status: "success", order_id: idataResult.order_id });
    } else {
      await updateOrderById(order.id, { status: "Failed" });
      return NextResponse.json({ error: "iDATA failed" }, { status: 500 });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
