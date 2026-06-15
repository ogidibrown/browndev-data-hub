const BASE = process.env.IDATA_API_URL || "https://idatagh.com/wp-json/custom/v1";
const KEY = process.env.IDATA_API_KEY || "";

const headers = {
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
};

export async function fetchPackages(network: string) {
  const res = await fetch(`${BASE}/packages?network=${network}`, { headers, next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Failed to fetch packages: ${res.status}`);
  return res.json();
}

export async function placeOrder(payload: {
  network: string;
  beneficiary: string;
  "pa_data-bundle-packages": number;
}) {
  const res = await fetch(`${BASE}/place-order`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Order failed: ${res.status}`);
  return res.json();
}

export async function getWalletBalance() {
  const res = await fetch(`${BASE}/wallet-balance`, { headers });
  if (!res.ok) throw new Error(`Wallet check failed: ${res.status}`);
  return res.json();
}

export async function getOrderStatus(orderId: number) {
  const res = await fetch(`${BASE}/order-status?order_id=${orderId}`, { headers });
  if (!res.ok) throw new Error(`Status check failed: ${res.status}`);
  return res.json();
}
