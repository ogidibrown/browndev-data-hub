"use client";
import { useState } from "react";
import { DataPackage, Network } from "@/types";
import { Loader2, Phone, Mail, ArrowRight } from "lucide-react";
import clsx from "clsx";

const NETWORK_PREFIXES: Record<Network, string[]> = {
  mtn: ["024", "054", "055", "059", "025"],
  telecel: ["020", "050"],
  airteltigo: ["027", "057", "026", "056"],
};

const NETWORK_META: Record<Network, { label: string; badgeClass: string }> = {
  mtn: { label: "MTN", badgeClass: "bg-amber-100 text-amber-800 border-amber-200" },
  telecel: { label: "Telecel", badgeClass: "bg-red-100 text-red-700 border-red-200" },
  airteltigo: { label: "AirtelTigo", badgeClass: "bg-blue-100 text-blue-700 border-blue-200" },
};

interface Props {
  network: Network;
  pkg: DataPackage;
  onSubmit: (phone: string, email: string) => void;
  loading?: boolean;
}

export default function CheckoutForm({ network, pkg, onSubmit, loading }: Props) {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ phone?: string; email?: string }>({});

  const { label, badgeClass } = NETWORK_META[network];

  const validate = () => {
    const newErrors: { phone?: string; email?: string } = {};
    const digits = phone.replace(/\s/g, "");
    if (!digits || digits.length !== 10) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    } else {
      const prefixes = NETWORK_PREFIXES[network];
      if (!prefixes.some((p) => digits.startsWith(p))) {
        newErrors.phone = `Use a valid ${label} number (e.g. ${prefixes[0]}XXXXXXX)`;
      }
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onSubmit(phone.replace(/\s/g, ""), email.trim());
  };

  return (
    <div className="space-y-5">
      {/* Order summary strip */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Order Summary</p>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={clsx("text-xs font-black px-2.5 py-1 rounded-full border", badgeClass)}>
              {label}
            </span>
            <span className="text-sm font-bold text-[#1E293B]">{pkg.data_size}GB Bundle</span>
          </div>
          <span className="text-lg font-black text-[#2B4EC8] whitespace-nowrap">GHS {pkg.price.toFixed(2)}</span>
        </div>
      </div>

      {/* Phone field */}
      <div>
        <label className="block text-sm font-bold text-[#1E293B] mb-1.5">
          Recipient&apos;s Phone Number
        </label>
        <div className="relative">
          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="tel"
            placeholder="0547264035"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={10}
            className={clsx(
              "w-full bg-white border-2 rounded-xl pl-10 pr-4 py-3 text-[#1E293B] placeholder-slate-300 outline-none transition-colors text-sm font-semibold",
              errors.phone
                ? "border-red-400 focus:border-red-500"
                : "border-slate-200 focus:border-[#2B4EC8]"
            )}
          />
        </div>
        {errors.phone && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.phone}</p>}
      </div>

      {/* Email field */}
      <div>
        <label className="block text-sm font-bold text-[#1E293B] mb-1.5">
          Your Email <span className="text-slate-400 font-normal">(for receipt)</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={clsx(
              "w-full bg-white border-2 rounded-xl pl-10 pr-4 py-3 text-[#1E293B] placeholder-slate-300 outline-none transition-colors text-sm font-semibold",
              errors.email
                ? "border-red-400 focus:border-red-500"
                : "border-slate-200 focus:border-[#2B4EC8]"
            )}
          />
        </div>
        {errors.email && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.email}</p>}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-[#2B4EC8] hover:bg-[#1D40B0] active:bg-[#1638A0] disabled:opacity-60 disabled:cursor-not-allowed text-white font-black rounded-xl py-4 transition-colors text-sm shadow-lg shadow-blue-500/30"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            Proceed to Payment · GHS {pkg.price.toFixed(2)}
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </div>
  );
}
