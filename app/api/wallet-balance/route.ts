import { NextResponse } from "next/server";
import { getWalletBalance } from "@/lib/idata";

export async function GET() {
  try {
    const data = await getWalletBalance();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
