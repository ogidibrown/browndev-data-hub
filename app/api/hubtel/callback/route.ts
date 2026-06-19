import { NextRequest, NextResponse } from "next/server";
import { findOrderByRef, getBundleById, updateOrderById } from "@/lib/firebase";
import { placeOrder } from "@/lib/idata";
import { log } from "@/lib/logger";

const ROUTE = "hubtel/callback";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Hubtel may send PascalCase or camelCase depending on account/API version
  const responseCode = (body.ResponseCode ?? body.responseCode) as string | undefined;
  const status = (body.Status ?? body.status) as string | undefined;
  const data = (body.Data ?? body.data) as Record<string, unknown> | undefined;
  const paymentRef = (data?.ClientReference ?? data?.clientReference) as string | undefined;

  log.info(ROUTE, "Hubtel callback received", { responseCode, status, paymentRef });

  // Only process confirmed successful payments
  if (responseCode !== "0000" || status?.toLowerCase() !== "success") {
    log.warn(ROUTE, "Non-success callback — ignoring", { responseCode, status, paymentRef });
    return NextResponse.json({ received: true });
  }

  if (!paymentRef) {
    log.error(ROUTE, "No clientReference in callback body", { body });
    return NextResponse.json({ received: true });
  }

  // Load order from Firestore — source of truth
  const order = await findOrderByRef(paymentRef);
  if (!order || !order.id) {
    log.error(ROUTE, "Order not found for callback", { paymentRef });
    return NextResponse.json({ received: true });
  }

  // Idempotency — skip if already fulfilled
  if (order.status === "Completed") {
    log.info(ROUTE, "Order already completed — skipping iDATA", { paymentRef });
    return NextResponse.json({ received: true });
  }

  // Load bundle to get idataPackageId — never trust any client-supplied value
  const bundle = await getBundleById(order.bundleId);
  if (!bundle) {
    log.error(ROUTE, "Bundle not found", { paymentRef, bundleId: order.bundleId });
    await updateOrderById(order.id, { status: "Failed", updatedAt: new Date().toISOString() });
    return NextResponse.json({ received: true });
  }

  // Place order with iDATA using backend-controlled values only
  try {
    const idataResult = await placeOrder({
      network: order.network,
      beneficiary: order.beneficiary,
      "pa_data-bundle-packages": String(bundle.dataSize),
    });

    if (idataResult.status === "success") {
      await updateOrderById(order.id, {
        orderId: idataResult.order_id,
        status: "Completed",
        updatedAt: new Date().toISOString(),
      });
      log.info(ROUTE, "Order fulfilled via iDATA", { paymentRef, idataOrderId: idataResult.order_id });
    } else {
      await updateOrderById(order.id, { status: "Failed", updatedAt: new Date().toISOString() });
      log.warn(ROUTE, "iDATA returned error status", { paymentRef, idataResult });
    }
  } catch (err) {
    log.error(ROUTE, "iDATA threw exception", { paymentRef, err: String(err) });
    await updateOrderById(order.id, { status: "Failed", updatedAt: new Date().toISOString() });
  }

  // Always return 200 to Hubtel — otherwise it will retry
  return NextResponse.json({ received: true });
}
