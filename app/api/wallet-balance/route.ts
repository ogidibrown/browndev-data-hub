import { NextResponse } from "next/server";
import { getWalletBalance } from "@/lib/idata";
import { log } from "@/lib/logger";
import { WALLET_LOW_BALANCE_THRESHOLD_GHS } from "@/lib/config";
import { sendAdminAlert } from "@/lib/notify";

const ROUTE = "wallet-balance";

export async function GET() {
  try {
    const data = await getWalletBalance();

    if (data.balance !== undefined) {
      if (data.balance < WALLET_LOW_BALANCE_THRESHOLD_GHS) {
        log.warn(ROUTE, "Wallet balance below threshold", {
          balance: data.balance,
          threshold: WALLET_LOW_BALANCE_THRESHOLD_GHS,
        });
        await sendAdminAlert(
          `iDATA wallet balance is low: GHS ${data.balance} (threshold: GHS ${WALLET_LOW_BALANCE_THRESHOLD_GHS}). Top up to avoid failed orders.`,
          { balance: data.balance, threshold: WALLET_LOW_BALANCE_THRESHOLD_GHS }
        );
      } else {
        log.info(ROUTE, "Wallet balance checked", {
          balance: data.balance,
          threshold: WALLET_LOW_BALANCE_THRESHOLD_GHS,
        });
      }
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    log.error(ROUTE, "Failed to fetch wallet balance", { err: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
