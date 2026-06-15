import { NextRequest, NextResponse } from "next/server";
import { fetchPackages } from "@/lib/idata";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const network = searchParams.get("network");
  if (!network) return NextResponse.json({ error: "network is required" }, { status: 400 });

  try {
    const data = await fetchPackages(network);
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
