import { NextRequest, NextResponse } from "next/server";
import { getOrderStats } from "@/lib/firebase";
import { getWalletBalance } from "@/lib/idata";
import { PROFIT_MARGIN } from "@/lib/config";
import { log } from "@/lib/logger";

const ROUTE = "analytics";

/**
 * Admin-only analytics endpoint.
 * Protect with ADMIN_API_KEY env var — set it in Vercel environment variables,
 * then call:  GET /api/analytics  with  Authorization: Bearer <key>
 */
export async function GET(req: NextRequest) {
  // Auth check
  const adminKey = process.env.ADMIN_API_KEY;
  if (adminKey) {
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (token !== adminKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    // Fetch Firestore stats and wallet balance in parallel
    const [stats, walletData] = await Promise.all([
      getOrderStats(),
      getWalletBalance().catch(() => ({ balance: null })),
    ]);

    const successRate =
      stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : "0.0";
    const failureRate =
      stats.total > 0 ? ((stats.failed / stats.total) * 100).toFixed(1) : "0.0";

    const estimatedProfit = (amount: number) =>
      parseFloat((amount * PROFIT_MARGIN).toFixed(2));

    const response = {
      generatedAt: new Date().toISOString(),
      orders: {
        total: stats.total,
        completed: stats.completed,
        failed: stats.failed,
        pending: stats.pending,
        successRate: `${successRate}%`,
        failureRate: `${failureRate}%`,
      },
      revenue: {
        allTime: {
          gross: parseFloat(stats.revenue.toFixed(2)),
          estimatedProfit: estimatedProfit(stats.revenue),
          currency: "GHS",
        },
        today: {
          orders: stats.todayCompleted,
          gross: parseFloat(stats.todayRevenue.toFixed(2)),
          estimatedProfit: estimatedProfit(stats.todayRevenue),
          currency: "GHS",
        },
        thisMonth: {
          orders: stats.monthCompleted,
          gross: parseFloat(stats.monthRevenue.toFixed(2)),
          estimatedProfit: estimatedProfit(stats.monthRevenue),
          currency: "GHS",
        },
      },
      wallet: {
        balance: walletData.balance ?? "unavailable",
        currency: "GHS",
      },
      config: {
        profitMarginPercent: PROFIT_MARGIN * 100,
      },
    };

    log.info(ROUTE, "Analytics fetched", {
      total: stats.total,
      revenue: stats.revenue,
      wallet: walletData.balance,
    });

    return NextResponse.json(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    log.error(ROUTE, "Analytics query failed", { err: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
