"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wifi, Menu, X } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-[#2B4EC8] shadow-lg sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Wifi className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-black text-white text-lg leading-none tracking-tight">BrownDev</span>
            <span className="block text-[10px] text-blue-200 font-semibold tracking-[0.2em] uppercase">Data Hub</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "px-3.5 py-2 rounded-lg text-sm font-bold transition-colors",
                pathname === href
                  ? "bg-white/20 text-white"
                  : "text-blue-200 hover:text-white hover:bg-white/10"
              )}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/"
            className="ml-2 bg-[#FFBB00] text-[#1E293B] font-black text-xs px-4 py-2 rounded-xl hover:bg-yellow-300 transition-colors"
          >
            Buy Data
          </Link>
        </nav>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden h-9 w-9 rounded-xl bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors text-white"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/10">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={clsx(
                "block px-5 py-3.5 text-sm font-bold border-b border-white/10 transition-colors",
                pathname === href ? "text-[#FFBB00]" : "text-white/90 hover:text-[#FFBB00]"
              )}
            >
              {label}
            </Link>
          ))}
          <div className="p-4">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="block w-full text-center bg-[#FFBB00] text-[#1E293B] font-black text-sm py-3 rounded-xl"
            >
              Buy Data Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
