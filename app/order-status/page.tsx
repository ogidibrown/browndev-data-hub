"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, XCircle, Clock, ArrowLeft, RefreshCw, Wifi, Shield } from "lucide-react";

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
    <div className="min-h-screen bg-[#EEF2FF] flex flex-col">

      {/* Header */}
      <header className="bg-[#2B4EC8] px-4 py-4 sm:px-6 flex items-center justify-between shadow-lg">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Wifi className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-black text-white text-lg leading-none tracking-tight">BrownDev</span>
            <span className="block text-[10px] text-blue-200 font-semibold tracking-[0.2em] uppercase">Data Hub</span>
          </div>
        </Link>
        <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
          <Shield className="h-3.5 w-3.5 text-green-300" />
          <span className="text-xs text-white/80 font-semibold">Secured</span>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center space-y-6">

          {isSuccess ? (
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          ) : isFailed ? (
            <XCircle className="h-16 w-16 text-red-500 mx-auto" />
          ) : (
            <Clock className="h-16 w-16 text-amber-500 mx-auto" />
          )}

          <div>
            <h1 className="text-2xl font-black text-[#1E293B] mb-1">
              {isSuccess ? "Order Placed!" : isFailed ? "Order Failed" : "Processing..."}
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              {isSuccess
                ? "Your data bundle is on its way. It may take a minute to activate."
                : isFailed
                ? "Something went wrong with your order. Your payment will be refunded if charged."
                : "We’re processing your request."}
            </p>
          </div>

          {orderId && (
            <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 space-y-2 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-medium">Order ID</span>
                <span className="font-mono font-bold text-[#1E293B]">{orderId}</span>
              </div>
              {ref && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-medium">Ref</span>
                  <span className="font-mono text-xs text-slate-500 truncate max-w-[160px]">{ref}</span>
                </div>
              )}
              {checkStatus && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-medium">Status</span>
                  <span className={checkStatus === "Completed" ? "text-green-600 font-bold" : "text-amber-600 font-bold"}>
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
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1E293B] font-bold text-sm py-2.5 transition-colors disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${checking ? "animate-spin" : ""}`} />
                Check Status
              </button>
            )}
            <Link
              href="/"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#2B4EC8] hover:bg-[#1D40B0] text-white font-black py-3 transition-colors text-sm shadow-lg shadow-blue-500/20"
            >
              <ArrowLeft className="h-4 w-4" />
              Buy Another Bundle
            </Link>
          </div>
        </div>
      </div>

      <footer className="text-center py-6 text-xs text-slate-400 font-medium border-t border-slate-200">
        © {new Date().getFullYear()} BrownDev Data Hub · All rights reserved
      </footer>
    </div>
  );
}

export default function OrderStatusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#EEF2FF] flex items-center justify-center text-slate-500 font-semibold">
        Loading...
      </div>
    }>
      <OrderStatusContent />
    </Suspense>
  );
}
