import { NextRequest, NextResponse } from "next/server";
import { placeOrder } from "@/lib/idata";
import { updateOrderById, findOrderByRef } from "@/lib/firebase";

export async function POST(req: NextRequest) {
  try {
    const { paystackRef, network, beneficiary, packageId } = await req.json();

    // Find the order in Firestore
    const order = await findOrderByRef(paystackRef);
    if (!order || !order.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Place order with iDATA
    const result = await placeOrder({
      network,
      beneficiary,
      "pa_data-bundle-packages": packageId,
    });

    if (result.status === "success") {
      await updateOrderById(order.id, {
        orderId: result.order_id,
        status: "Completed",
      });
      return NextResponse.json({ status: "success", ...result });
    } else {
      await updateOrderById(order.id, { status: "Failed" });
      return NextResponse.json({ error: "iDATA order failed", details: result }, { status: 400 });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
