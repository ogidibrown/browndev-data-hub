import Link from "next/link";
import { Wifi, Shield } from "lucide-react";

const LINKS = {
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Pricing", href: "/pricing" },
    { label: "Contact Us", href: "/contact" },
  ],
  Support: [
    { label: "FAQ", href: "/faq" },
    { label: "Track Order", href: "/order-status" },
    { label: "Buy Data", href: "/" },
  ],
  Legal: [
    { label: "Terms of Service", href: "/terms" },
  ],
};

export default function SiteFooter() {
  return (
    <footer className="bg-[#1E293B] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">

          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-9 w-9 rounded-xl bg-[#2B4EC8]/60 flex items-center justify-center">
                <Wifi className="h-5 w-5 text-blue-300" />
              </div>
              <div>
                <span className="font-black text-white text-base leading-none">BrownDev</span>
                <span className="block text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase">Data Hub</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Ghana&apos;s fast and secure platform for buying MTN, Telecel, and AirtelTigo data bundles — any number, any time.
            </p>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
              <Shield className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
              Payments secured by Paystack
            </div>
          </div>

          {Object.entries(LINKS).map(([section, items]) => (
            <div key={section}>
              <h3 className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 mb-4">{section}</h3>
              <ul className="space-y-2.5">
                {items.map(({ label, href }) => (
                  <li key={href}>
                    <Link href={href} className="text-slate-300 text-sm font-medium hover:text-white transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400 font-medium">
            © {new Date().getFullYear()} BrownDev Data Hub. All rights reserved.
          </p>
          <p className="text-xs text-slate-500 font-medium">
            Ghana · MTN · Telecel · AirtelTigo
          </p>
        </div>
      </div>
    </footer>
  );
}
