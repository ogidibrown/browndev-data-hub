import { IDATA_MAX_RETRIES, IDATA_RETRY_DELAY_MS, IDATA_TIMEOUT_MS } from "./config";

const BASE = process.env.IDATA_API_URL || "https://idatagh.com/wp-json/custom/v1";
const KEY = process.env.IDATA_API_KEY || "";

function authHeaders() {
  return {
    Authorization: `Bearer ${KEY}`,
    "Content-Type": "application/json",
  };
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = IDATA_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function withRetry<T>(fn: () => Promise<T>, retries = IDATA_MAX_RETRIES): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, IDATA_RETRY_DELAY_MS));
      }
    }
  }
  throw lastErr;
}

export async function fetchPackages(network: string) {
  const res = await fetchWithTimeout(
    `${BASE}/packages?network=${network}`,
    { headers: authHeaders(), next: { revalidate: 300 } } as RequestInit
  );
  if (!res.ok) throw new Error(`Failed to fetch packages: ${res.status}`);
  return res.json();
}

export async function placeOrder(payload: {
  network: string;
  beneficiary: string;
  "pa_data-bundle-packages": string;
}) {
  return withRetry(async () => {
    const res = await fetchWithTimeout(`${BASE}/place-order`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Order failed: ${res.status}`);
    return res.json();
  });
}

export async function getWalletBalance() {
  const res = await fetchWithTimeout(`${BASE}/wallet-balance`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Wallet check failed: ${res.status}`);
  return res.json();
}

export async function getOrderStatus(orderId: number) {
  const res = await fetchWithTimeout(
    `${BASE}/order-status?order_id=${orderId}`,
    { headers: authHeaders() }
  );
  if (!res.ok) throw new Error(`Status check failed: ${res.status}`);
  return res.json();
}
