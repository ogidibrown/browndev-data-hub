import { NextRequest, NextResponse } from "next/server";
import { fetchPackages } from "@/lib/idata";
import { ALLOWED_NETWORKS, CUSTOMER_PRICING, AllowedNetwork } from "@/lib/config";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const network = searchParams.get("network");
  if (!network) return NextResponse.json({ error: "network is required" }, { status: 400 });
  if (!ALLOWED_NETWORKS.includes(network as AllowedNetwork)) {
    return NextResponse.json({ error: "Invalid network" }, { status: 400 });
  }

  try {
    const data = await fetchPackages(network);
    const pricing = CUSTOMER_PRICING[network as AllowedNetwork];

    const packages = ((data.packages ?? []) as Array<{
      package_id: number;
      label: string;
      price: number;
      data_size: number;
    }>)
      .filter((pkg) => pricing[pkg.data_size] !== undefined)
      .map((pkg) => ({ ...pkg, price: pricing[pkg.data_size] }))
      .sort((a, b) => a.data_size - b.data_size);

    return NextResponse.json({ ...data, packages });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
