import { NextRequest, NextResponse } from "next/server";
import { getBundlesByNetwork } from "@/lib/firebase";
import { ALLOWED_NETWORKS, AllowedNetwork } from "@/lib/config";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const network = searchParams.get("network");

  if (!network) return NextResponse.json({ error: "network is required" }, { status: 400 });
  if (!ALLOWED_NETWORKS.includes(network as AllowedNetwork)) {
    return NextResponse.json({ error: "Invalid network" }, { status: 400 });
  }

  try {
    const bundles = await getBundlesByNetwork(network);

    // Strip all sensitive fields — client receives only what it needs to display
    const packages = bundles.map(({ id, network, dataSize, label, sellingPrice }) => ({
      id,
      network,
      dataSize,
      label,
      sellingPrice,
    }));

    return NextResponse.json({ network: network.toUpperCase(), packages });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
