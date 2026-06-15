export type Network = "mtn" | "telecel" | "airteltigo";

export interface DataPackage {
  package_id: number;
  label: string;
  price: number;
  data_size: number;
}

export interface OrderRecord {
  id?: string;
  orderId: number;
  network: string;
  beneficiary: string;
  packageId: number;
  packageLabel: string;
  dataSize: number;
  amount: number;
  status: "Pending" | "Completed" | "Failed";
  paystackRef: string;
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
