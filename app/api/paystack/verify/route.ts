import { NextRequest, NextResponse } from "next/server";
import { findOrderByRef, getBundleById, updateOrderById } from "@/lib/firebase";
import { placeOrder } from "@/lib/idata";
import { log } from "@/lib/logger";

const ROUTE = "paystack/verify";
const APP = process.env.NEXT_PUBLIC_APP_URL ?? "";

function redirect(path: string) {
  return NextResponse.redirect(`${APP}${path}`);
}

async function fulfillOrder(reference: string) {
  // 1. Verify payment status directly with Paystack
  const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  });
  const verifyData = await verifyRes.json();

  if (!verifyData.status || verifyData.data?.status !== "success") {
    log.warn(ROUTE, "Payment not successful", { reference, paystackStatus: verifyData.data?.status });
    return { outcome: "payment_failed" as const };
  }

  const meta = verifyData.data.metadata as Record<string, unknown>;

  // 2. Load order from Firestore — this is our source of truth, not the Paystack response
  const order = await findOrderByRef(reference);
  if (!order || !order.id) {
    log.error(ROUTE, "Order not found in Firestore", { reference });
    return { outcome: "order_not_found" as const };
  }

  // 3. Idempotency — skip iDATA if already fulfilled
  if (order.status === "Completed") {
    log.info(ROUTE, "Order already completed, skipping iDATA", { reference, orderId: order.orderId });
    return { outcome: "already_completed" as const, orderId: order.orderId };
  }

  // 4. Cross-validate Paystack metadata against our stored order to detect tampering
  if (meta.bundleId !== order.bundleId || meta.beneficiary !== order.beneficiary) {
    log.error(ROUTE, "Metadata mismatch — possible tampering", {
      reference,
      metaBundleId: meta.bundleId,
      storedBundleId: order.bundleId,
    });
    await updateOrderById(order.id, { status: "Failed", updatedAt: new Date().toISOString() });
    return { outcome: "metadata_mismatch" as const };
  }

  // 5. Load bundle from Firestore to get the iDATA package ID — never trust a client-supplied value
  const bundle = await getBundleById(order.bundleId);
  if (!bundle) {
    log.error(ROUTE, "Bundle not found in Firestore", { reference, bundleId: order.bundleId });
    await updateOrderById(order.id, { status: "Failed", updatedAt: new Date().toISOString() });
    return { outcome: "bundle_not_found" as const };
  }

  // 6. Place order with iDATA using backend-controlled values only
  let idataResult;
  try {
    idataResult = await placeOrder({
      network: order.network,
      beneficiary: order.beneficiary,
      "pa_data-bundle-packages": bundle.idataPackageId,
    });
  } catch (err) {
    log.error(ROUTE, "iDATA placeOrder threw exception", { reference, err: String(err) });
    await updateOrderById(order.id, { status: "Failed", updatedAt: new Date().toISOString() });
    return { outcome: "idata_error" as const };
  }

  // 7. Save result to Firestore
  if (idataResult.status === "success") {
    await updateOrderById(order.id, {
      orderId: idataResult.order_id,
      status: "Completed",
      updatedAt: new Date().toISOString(),
    });
    log.info(ROUTE, "Order fulfilled", { reference, idataOrderId: idataResult.order_id });
    return { outcome: "success" as const, orderId: idataResult.order_id };
  } else {
    await updateOrderById(order.id, { status: "Failed", updatedAt: new Date().toISOString() });
    log.warn(ROUTE, "iDATA returned error status", { reference, idataResult });
    return { outcome: "idata_error" as const };
  }
}

// GET — Paystack redirect callback after customer pays
export async function GET(req: NextRequest) {
  const reference = new URL(req.url).searchParams.get("reference");
  if (!reference) return redirect("/?error=no_reference");

  log.info(ROUTE, "GET verify called", { reference });

  try {
    const result = await fulfillOrder(reference);

    switch (result.outcome) {
      case "success":
      case "already_completed":
        return redirect(`/order-status?ref=${reference}&status=success&order_id=${result.orderId}`);
      case "payment_failed":
        return redirect(`/?error=payment_failed&ref=${reference}`);
      case "metadata_mismatch":
      case "idata_error":
      case "bundle_not_found":
        return redirect(`/order-status?ref=${reference}&status=failed`);
      case "order_not_found":
        return redirect("/?error=order_not_found");
    }
  } catch (err) {
    log.error(ROUTE, "Unhandled error in GET verify", { reference, err: String(err) });
    return redirect(`/order-status?ref=${reference}&status=error`);
  }
}

// POST — inline client-side verification (called after Paystack inline popup)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { reference } = body;
  if (!reference) return NextResponse.json({ error: "No reference" }, { status: 400 });

  log.info(ROUTE, "POST verify called", { reference });

  try {
    const result = await fulfillOrder(reference);

    switch (result.outcome) {
      case "success":
      case "already_completed":
        return NextResponse.json({ status: "success", order_id: result.orderId });
      case "payment_failed":
        return NextResponse.json({ error: "Payment not successful" }, { status: 400 });
      case "metadata_mismatch":
        return NextResponse.json({ error: "Order metadata mismatch" }, { status: 400 });
      case "bundle_not_found":
        return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
      case "idata_error":
        return NextResponse.json({ error: "iDATA order failed" }, { status: 500 });
      case "order_not_found":
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    log.error(ROUTE, "Unhandled error in POST verify", { reference, err: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
