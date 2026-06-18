import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Zap, Shield, Clock, Users, Star, Wifi } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us — BrownDev Data Hub",
  description: "Learn about BrownDev Data Hub — Ghana's trusted platform for buying MTN, Telecel, and AirtelTigo data bundles instantly.",
};

const VALUES = [
  {
    icon: Zap,
    title: "Speed",
    desc: "We built BrownDev Data Hub so bundles land on a number in seconds — not minutes, not hours.",
  },
  {
    icon: Shield,
    title: "Security",
    desc: "Every payment goes through Paystack, a PCI-DSS Level 1 certified processor. We never store your card details.",
  },
  {
    icon: Clock,
    title: "Reliability",
    desc: "Our platform is available 24 hours a day, 7 days a week. Buy data at midnight or midday — it works.",
  },
  {
    icon: Users,
    title: "Accessibility",
    desc: "Buy data for yourself or top up any MTN, Telecel, or AirtelTigo number in Ghana — no extra steps.",
  },
];

const STATS = [
  { label: "Networks Supported", value: "3" },
  { label: "Bundle Options", value: "39+" },
  { label: "Uptime", value: "99.9%" },
  { label: "Delivery Time", value: "< 30s" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#EEF2FF]">
      <SiteHeader />

      <main className="flex-1">

        {/* Hero */}
        <section className="bg-[#2B4EC8] py-16 sm:py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/15 text-white/90 text-xs font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wide">
              <Wifi className="h-3 w-3" />
              Made in Ghana
            </div>
            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight mb-4">
              About BrownDev Data Hub
            </h1>
            <p className="text-blue-200 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              We are a Ghanaian digital platform dedicated to making mobile data affordable and accessible to everyone — one bundle at a time.
            </p>
          </div>
        </section>

        {/* Stats bar */}
        <section className="bg-white border-b border-slate-100 py-8 px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
            {STATS.map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-2xl sm:text-3xl font-black text-[#2B4EC8]">{value}</p>
                <p className="text-xs text-slate-500 font-semibold mt-1">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Who we are */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-[10px] font-black text-[#2B4EC8] uppercase tracking-[0.2em] mb-3">Who We Are</p>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1E293B] leading-tight mb-4 tracking-tight">
                A platform built for everyday Ghanaians
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">
                BrownDev Data Hub was created to solve a real, daily problem — the friction of buying mobile data in Ghana. Whether you are a student needing data to attend an online class, a professional staying connected, or sending airtime to a family member, we built this platform so the process takes seconds, not trips.
              </p>
              <p className="text-slate-500 text-sm leading-relaxed">
                We partner with licensed data providers to deliver bundles automatically as soon as payment is confirmed. No waiting, no calls to agents, no follow-up messages — just instant delivery.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 space-y-4">
              {[
                { label: "Business Name", value: "BrownDev Data Hub" },
                { label: "Industry", value: "Telecommunications / E-commerce" },
                { label: "Location", value: "Ghana" },
                { label: "Payment Processor", value: "Paystack (PCI-DSS Certified)" },
                { label: "Networks", value: "MTN, Telecel, AirtelTigo" },
                { label: "Service Hours", value: "24 / 7 / 365" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-4 text-sm border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                  <span className="text-slate-400 font-semibold">{label}</span>
                  <span className="font-bold text-[#1E293B] text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-white py-14 px-4 border-y border-slate-100">
          <div className="max-w-4xl mx-auto">
            <p className="text-[10px] font-black text-[#2B4EC8] uppercase tracking-[0.2em] mb-2 text-center">Our Values</p>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1E293B] text-center mb-10 tracking-tight">
              What we stand for
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {VALUES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4 p-5 rounded-2xl bg-[#EEF2FF] border border-blue-100">
                  <div className="h-10 w-10 rounded-xl bg-[#2B4EC8] flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-[#1E293B] text-sm mb-1">{title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-14 text-center">
          <Star className="h-8 w-8 text-[#FFBB00] mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-black text-[#1E293B] mb-4 tracking-tight">Our Mission</h2>
          <p className="text-slate-500 text-base sm:text-lg leading-relaxed">
            To make mobile data accessible to every Ghanaian through a fast, honest, and reliable platform — so staying connected never gets in the way of the things that matter.
          </p>
        </section>

      </main>

      <SiteFooter />
    </div>
  );
}
