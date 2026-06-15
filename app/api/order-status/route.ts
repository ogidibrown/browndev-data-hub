import { NextRequest, NextResponse } from "next/server";
import { getOrderStatus } from "@/lib/idata";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("order_id");
  if (!orderId) return NextResponse.json({ error: "order_id is required" }, { status: 400 });

  try {
    const data = await getOrderStatus(Number(orderId));
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
