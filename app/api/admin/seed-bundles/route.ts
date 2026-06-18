import { NextRequest, NextResponse } from "next/server";
import { upsertBundle } from "@/lib/firebase";
import { fetchPackages } from "@/lib/idata";
import { ALLOWED_NETWORKS, CUSTOMER_PRICING, AllowedNetwork } from "@/lib/config";
import { log } from "@/lib/logger";

const ROUTE = "admin/seed-bundles";

/**
 * POST /api/admin/seed-bundles
 * Authorization: Bearer <ADMIN_SEED_SECRET>
 *
 * Fetches live packages from the iDATA API for every network, matches each
 * iDATA package to your customer pricing table by dataSize, then writes the
 * full bundle document (including idataPackageId and idataCostPrice) into the
 * Firestore `bundles` collection.
 *
 * Run this once to populate the catalog, and again whenever iDATA changes
 * their package IDs or you update CUSTOMER_PRICING. No code changes needed
 * on the frontend — it always reads from Firestore.
 */
export async function POST(req: NextRequest) {
  // Guard — require ADMIN_SEED_SECRET to prevent unauthorised catalog writes
  const secret = process.env.ADMIN_SEED_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "ADMIN_SEED_SECRET is not configured on the server" },
      { status: 500 }
    );
  }
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Record<string, { seeded: number; skipped: number; errors: string[] }> = {};

  for (const network of ALLOWED_NETWORKS) {
    const networkResults = { seeded: 0, skipped: 0, errors: [] as string[] };
    results[network] = networkResults;

    try {
      const data = await fetchPackages(network);
      const idataPackages = (data.packages ?? []) as Array<{
        package_id: number;
        label: string;
        price: number;
        data_size: number;
      }>;

      const pricing = CUSTOMER_PRICING[network as AllowedNetwork];

      for (const pkg of idataPackages) {
        const sellingPrice = pricing[pkg.data_size];

        // Skip bundles we don't sell (not in our pricing table)
        if (sellingPrice === undefined) {
          networkResults.skipped++;
          continue;
        }

        try {
          // Use a deterministic document ID so re-runs are idempotent
          const docId = `${network}_${pkg.data_size}gb`;

          await upsertBundle(docId, {
            network: network as AllowedNetwork,
            dataSize: pkg.data_size,
            label: `${pkg.data_size}GB`,
            idataPackageId: pkg.package_id,
            idataCostPrice: pkg.price,
            sellingPrice,
            active: true,
          });

          networkResults.seeded++;
          log.info(ROUTE, "Bundle seeded", {
            docId,
            network,
            dataSize: pkg.data_size,
            idataPackageId: pkg.package_id,
            sellingPrice,
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          networkResults.errors.push(`${pkg.data_size}GB: ${msg}`);
          log.error(ROUTE, "Failed to seed bundle", { network, dataSize: pkg.data_size, err: msg });
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      networkResults.errors.push(`fetch failed: ${msg}`);
      log.error(ROUTE, "Failed to fetch iDATA packages", { network, err: msg });
    }
  }

  const totalSeeded = Object.values(results).reduce((s, r) => s + r.seeded, 0);
  const totalSkipped = Object.values(results).reduce((s, r) => s + r.skipped, 0);
  const hasErrors = Object.values(results).some((r) => r.errors.length > 0);

  log.info(ROUTE, "Seed complete", { totalSeeded, totalSkipped, hasErrors });

  return NextResponse.json({
    status: hasErrors ? "partial" : "ok",
    totalSeeded,
    totalSkipped,
    networks: results,
  });
}
