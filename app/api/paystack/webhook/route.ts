import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { findOrderByRef, getBundleById, updateOrderById } from "@/lib/firebase";
import { placeOrder } from "@/lib/idata";
import { log } from "@/lib/logger";

const ROUTE = "paystack/webhook";

function verifySignature(rawBody: string, signature: string): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY ?? "";
  const expected = createHmac("sha512", secret).update(rawBody).digest("hex");
  return expected === signature;
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-paystack-signature") ?? "";
  const rawBody = await req.text();

  // Verify HMAC-SHA512 signature — reject anything not from Paystack
  if (!verifySignature(rawBody, signature)) {
    log.warn(ROUTE, "Invalid webhook signature — rejected");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event: string; data: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Only handle successful charge events
  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const data = event.data;
  const reference = data.reference as string;
  const paystackStatus = data.status as string;

  log.info(ROUTE, "charge.success received", { reference, paystackStatus });

  if (paystackStatus !== "success") {
    return NextResponse.json({ received: true });
  }

  const meta = (data.metadata ?? {}) as Record<string, unknown>;

  // Load order from Firestore — source of truth
  const order = await findOrderByRef(reference);
  if (!order || !order.id) {
    log.error(ROUTE, "Order not found for webhook", { reference });
    return NextResponse.json({ received: true });
  }

  // Idempotency — skip if already completed
  if (order.status === "Completed") {
    log.info(ROUTE, "Webhook: order already completed", { reference });
    return NextResponse.json({ received: true });
  }

  // Cross-validate metadata against stored order
  if (meta.bundleId !== order.bundleId || meta.beneficiary !== order.beneficiary) {
    log.error(ROUTE, "Webhook: metadata mismatch", { reference });
    await updateOrderById(order.id, { status: "Failed", updatedAt: new Date().toISOString() });
    return NextResponse.json({ received: true });
  }

  // Load bundle from Firestore to get idataPackageId — never trust any client-supplied value
  const bundle = await getBundleById(order.bundleId);
  if (!bundle) {
    log.error(ROUTE, "Webhook: bundle not found", { reference, bundleId: order.bundleId });
    await updateOrderById(order.id, { status: "Failed", updatedAt: new Date().toISOString() });
    return NextResponse.json({ received: true });
  }

  // Place order with iDATA using backend-controlled values only
  // iDATA expects the label string ("1", "2", "3"…) not the numeric package_id
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
      log.info(ROUTE, "Webhook fulfilled order via iDATA", { reference, idataOrderId: idataResult.order_id });
    } else {
      await updateOrderById(order.id, { status: "Failed", updatedAt: new Date().toISOString() });
      log.warn(ROUTE, "Webhook: iDATA returned error", { reference, idataResult });
    }
  } catch (err) {
    log.error(ROUTE, "Webhook: iDATA threw exception", { reference, err: String(err) });
    await updateOrderById(order.id, { status: "Failed", updatedAt: new Date().toISOString() });
  }

  // Always return 200 to Paystack — otherwise it will retry
  return NextResponse.json({ received: true });
}
