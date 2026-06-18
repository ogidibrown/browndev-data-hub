/**
 * Run with: node scripts/seed.mjs
 * Seeds all bundles from iDATA into Firestore directly — no HTTP timeout.
 */

import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ── Load .env.local manually ──────────────────────────────────────────────────
const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dir, "../.env.local");
const envLines = readFileSync(envPath, "utf8").split("\n");
for (const line of envLines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const idx = trimmed.indexOf("=");
  if (idx === -1) continue;
  process.env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
}

// ── Config ────────────────────────────────────────────────────────────────────
const IDATA_BASE = process.env.IDATA_API_URL || "https://idatagh.com/wp-json/custom/v1";
const IDATA_KEY  = process.env.IDATA_API_KEY  || "";

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const CUSTOMER_PRICING = {
  mtn: {
    1: 5, 2: 9, 3: 14, 4: 18, 5: 22, 6: 27, 8: 35,
    10: 44, 15: 60, 20: 80, 25: 100, 30: 120, 40: 158, 50: 199,
  },
  telecel: {
    10: 42, 15: 60, 20: 78, 25: 98, 30: 117, 40: 149, 50: 188, 100: 360,
  },
  airteltigo: {
    1: 5, 2: 9, 3: 13, 4: 17, 5: 21, 6: 25, 7: 32, 8: 35,
    10: 43, 15: 64, 20: 68, 30: 82, 40: 88, 50: 100, 60: 134, 80: 167, 100: 187,
  },
};

const NETWORKS = ["mtn", "telecel", "airteltigo"];

// ── Init Firebase ─────────────────────────────────────────────────────────────
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ── Helpers ───────────────────────────────────────────────────────────────────
async function fetchWithTimeout(url, options = {}, ms = 15000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
console.log("=== BrownDev Data Hub — Bundle Seed Script ===\n");

let totalSeeded = 0;
let totalSkipped = 0;

for (const network of NETWORKS) {
  console.log(`\n── ${network.toUpperCase()} ──`);

  let raw;
  try {
    const res = await fetchWithTimeout(
      `${IDATA_BASE}/packages?network=${network}`,
      { headers: { Authorization: `Bearer ${IDATA_KEY}`, "Content-Type": "application/json" } }
    );
    if (!res.ok) {
      console.error(`  ✗ iDATA returned ${res.status} — skipping network`);
      continue;
    }
    raw = await res.json();
  } catch (err) {
    console.error(`  ✗ iDATA fetch failed: ${err.message}`);
    continue;
  }

  const packages = raw.packages ?? raw.data ?? raw ?? [];
  console.log(`  iDATA returned ${packages.length} package(s). Raw sample:`,
    JSON.stringify(packages[0] ?? "none"));

  const pricing = CUSTOMER_PRICING[network];
  let networkSeeded = 0;
  let networkSkipped = 0;

  for (const pkg of packages) {
    // Try common field names for data size
    const dataSize = pkg.data_size ?? pkg.dataSize ?? pkg.size ?? pkg.volume ?? null;
    const packageId = pkg.package_id ?? pkg.packageId ?? pkg.id ?? null;
    const costPrice = pkg.price ?? pkg.cost ?? pkg.amount ?? 0;
    const label = pkg.label ?? pkg.name ?? `${dataSize}GB`;

    if (dataSize === null || packageId === null) {
      console.warn(`  ⚠ Unrecognised package shape — skipping:`, JSON.stringify(pkg));
      networkSkipped++;
      continue;
    }

    const sellingPrice = pricing[dataSize];
    if (sellingPrice === undefined) {
      console.log(`  · Skipping ${dataSize}GB (not in our pricing table)`);
      networkSkipped++;
      continue;
    }

    const docId = `${network}_${dataSize}gb`;
    try {
      await setDoc(doc(db, "bundles", docId), {
        network,
        dataSize,
        label: `${dataSize}GB`,
        idataPackageId: packageId,
        idataCostPrice: costPrice,
        sellingPrice,
        active: true,
      });
      console.log(`  ✓ Seeded ${docId} — GHS ${sellingPrice} (iDATA id: ${packageId})`);
      networkSeeded++;
      totalSeeded++;
    } catch (err) {
      console.error(`  ✗ Firestore write failed for ${docId}: ${err.message}`);
    }
  }

  console.log(`  → ${networkSeeded} seeded, ${networkSkipped} skipped`);
  totalSkipped += networkSkipped;
}

console.log(`\n=== Done: ${totalSeeded} seeded, ${totalSkipped} skipped ===`);
process.exit(0);
