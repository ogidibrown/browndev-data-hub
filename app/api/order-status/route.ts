import { NextRequest, NextResponse } from "next/server";
import { getOrderStatus } from "@/lib/idata";
import { log } from "@/lib/logger";

const ROUTE = "order-status";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("order_id");

  if (!raw) return NextResponse.json({ error: "order_id is required" }, { status: 400 });

  const orderId = parseInt(raw, 10);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return NextResponse.json({ error: "order_id must be a positive integer" }, { status: 400 });
  }

  try {
    const data = await getOrderStatus(orderId);
    log.info(ROUTE, "Order status fetched", { orderId, status: data.order_status });
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    log.error(ROUTE, "Failed to fetch order status", { orderId, err: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
