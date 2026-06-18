export type Network = "mtn" | "telecel" | "airteltigo";

// Full bundle record — only ever used server-side (API routes, seed script)
export interface Bundle {
  id?: string;
  network: Network;
  dataSize: number;          // GB
  label: string;             // display label e.g. "1GB"
  idataPackageId: number;    // iDATA package_id — NEVER sent to client
  idataCostPrice: number;    // iDATA wholesale price — NEVER sent to client
  sellingPrice: number;      // customer-facing price in GHS
  active: boolean;
}

// Frontend-safe view — no cost price, no iDATA package ID
export interface DataPackage {
  id: string;                // Firestore bundle document ID → sent as bundleId on checkout
  network: Network;
  dataSize: number;
  label: string;
  sellingPrice: number;
}

export interface OrderRecord {
  id?: string;
  bundleId: string;          // Firestore bundle document ID
  network: string;
  beneficiary: string;
  idataPackageId: number;    // snapshotted from bundle at order creation time
  packageLabel: string;      // snapshotted for display
  dataSize: number;          // snapshotted for display
  amount: number;            // selling price paid — always sourced from Firestore, never frontend
  status: "Pending" | "Completed" | "Failed";
  paystackRef: string;
  orderId?: number;          // iDATA order_id set after successful fulfillment
  email: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface PlaceOrderResponse {
  status: "success" | "error";
  order_id?: number;
  amount?: number;
  network?: string;
  beneficiary?: string;
  message?: string;
}

export interface WalletBalanceResponse {
  status: "success" | "error";
  balance?: number;
}

export interface OrderStatusResponse {
  status: "success" | "error";
  order_id?: number;
  order_status?: string;
  amount?: number;
}
