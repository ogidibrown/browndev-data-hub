import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { CUSTOMER_PRICING } from "@/lib/config";
import { ArrowRight, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Data Bundle Prices — BrownDev Data Hub",
  description: "View all MTN, Telecel, and AirtelTigo data bundle prices in Ghana. Transparent, fixed pricing with instant delivery.",
};

const NETWORK_META = {
  mtn: {
    label: "MTN",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
    headerClass: "bg-amber-500",
    emoji: "🟡",
  },
  telecel: {
    label: "Telecel",
    badgeClass: "bg-red-100 text-red-700 border-red-200",
    headerClass: "bg-red-500",
    emoji: "🔴",
  },
  airteltigo: {
    label: "AirtelTigo",
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
    headerClass: "bg-blue-600",
    emoji: "🔵",
  },
} as const;

const INCLUDED = [
  "Instant automatic delivery",
  "Delivered to any valid number",
  "Paystack-secured payment",
  "24/7 availability",
];

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#EEF2FF]">
      <SiteHeader />

      <main className="flex-1">

        {/* Hero */}
        <section className="bg-[#2B4EC8] py-14 sm:py-18 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/15 text-white/90 text-xs font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wide">
              Transparent Pricing
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight mb-4">
              Simple, fixed prices.<br />No hidden fees.
            </h1>
            <p className="text-blue-200 text-base leading-relaxed max-w-xl mx-auto mb-8">
              The price you see is the price you pay. All amounts are in Ghana Cedis (GHS) and include instant delivery.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-[#FFBB00] text-[#1E293B] font-black text-sm px-6 py-3.5 rounded-xl hover:bg-yellow-300 transition-colors shadow-lg"
            >
              Buy a Bundle Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* What's included */}
        <section className="bg-white border-b border-slate-100 py-6 px-4">
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {INCLUDED.map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-slate-600 font-semibold">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* Pricing grids */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14 space-y-14">
          {(["mtn", "telecel", "airteltigo"] as const).map((network) => {
            const meta = NETWORK_META[network];
            const tiers = Object.entries(CUSTOMER_PRICING[network]).map(
              ([gb, price]) => ({ gb: Number(gb), price })
            );

            return (
              <div key={network}>
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-2xl">{meta.emoji}</span>
                  <div>
                    <h2 className="text-xl font-black text-[#1E293B] tracking-tight">{meta.label} Data Bundles</h2>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                      {tiers.length} bundle{tiers.length !== 1 ? "s" : ""} available — instant delivery
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {tiers.map(({ gb, price }) => (
                    <Link
                      key={gb}
                      href="/"
                      className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-[#2B4EC8]/30 transition-all p-4 flex flex-col items-center text-center"
                    >
                      <span className="text-lg font-black text-[#1E293B] group-hover:text-[#2B4EC8] transition-colors">
                        {gb}GB
                      </span>
                      <span className="text-xs text-slate-400 font-semibold mt-0.5 mb-3">Bundle</span>
                      <span className="text-xl font-black text-[#2B4EC8]">
                        GHS {price.toFixed(2)}
                      </span>
                      <span className="mt-3 text-[10px] font-black text-[#2B4EC8] uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">
                        Buy Now →
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        {/* CTA */}
        <section className="bg-[#2B4EC8] py-12 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-black text-white mb-3 tracking-tight">Ready to buy?</h2>
            <p className="text-blue-200 text-sm mb-6">Pick a network, choose a bundle, and your data arrives in seconds.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-[#FFBB00] text-[#1E293B] font-black px-8 py-4 rounded-xl hover:bg-yellow-300 transition-colors shadow-lg"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

      </main>

      <SiteFooter />
    </div>
  );
}
