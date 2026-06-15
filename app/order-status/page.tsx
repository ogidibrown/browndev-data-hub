"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, XCircle, Clock, ArrowLeft, RefreshCw } from "lucide-react";

function OrderStatusContent() {
  const params = useSearchParams();
  const status = params.get("status");
  const orderId = params.get("order_id");
  const ref = params.get("ref");

  const [checkStatus, setCheckStatus] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const checkOrder = async () => {
    if (!orderId) return;
    setChecking(true);
    try {
      const res = await fetch(`/api/order-status?order_id=${orderId}`);
      const data = await res.json();
      if (data.order_status) setCheckStatus(data.order_status);
    } catch {
      setCheckStatus("Unknown");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (status === "success" && orderId) {
      checkOrder();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const isSuccess = status === "success";
  const isFailed = status === "failed" || status === "error";

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white/[0.04] border border-white/10 p-8 text-center space-y-6">

        {isSuccess ? (
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />
        ) : isFailed ? (
          <XCircle className="h-16 w-16 text-red-400 mx-auto" />
        ) : (
          <Clock className="h-16 w-16 text-amber-400 mx-auto" />
        )}

        <div>
          <h1 className="text-2xl font-extrabold mb-1">
            {isSuccess ? "Order Placed!" : isFailed ? "Order Failed" : "Processing..."}
          </h1>
          <p className="text-slate-400 text-sm">
            {isSuccess
              ? "Your data bundle is on its way. It may take a minute to activate."
              : isFailed
              ? "Something went wrong with your order. Your payment will be refunded if charged."
              : "We're processing your request."}
          </p>
        </div>

        {orderId && (
          <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 space-y-2 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Order ID</span>
              <span className="font-mono font-bold">{orderId}</span>
            </div>
            {ref && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Ref</span>
                <span className="font-mono text-xs text-slate-300 truncate max-w-[160px]">{ref}</span>
              </div>
            )}
            {checkStatus && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Status</span>
                <span className={checkStatus === "Completed" ? "text-green-400 font-semibold" : "text-amber-400 font-semibold"}>
                  {checkStatus}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {isSuccess && orderId && (
            <button
              onClick={checkOrder}
              disabled={checking}
              className="flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm py-2.5 transition-colors disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${checking ? "animate-spin" : ""}`} />
              Check Status
            </button>
          )}
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 py-3 font-bold transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Buy Another Bundle
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderStatusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center text-white">
        Loading...
      </div>
    }>
      <OrderStatusContent />
    </Suspense>
  );
}
