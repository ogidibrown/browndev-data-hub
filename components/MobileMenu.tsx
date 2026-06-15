"use client";
import { useEffect } from "react";
import { X, Home, ClipboardList, ShieldCheck, LogIn, UserPlus, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { Wifi } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

const GUEST_NAV = [
  { icon: Home, label: "Buy Data", href: "/" },
  { icon: ClipboardList, label: "Track Order", href: "/order-status" },
  { icon: ShieldCheck, label: "Verify Payment", href: "/order-status" },
  { icon: LogIn, label: "Login", href: "/login" },
  { icon: UserPlus, label: "Register", href: "/register" },
];

const AUTH_NAV = [
  { icon: Home, label: "Buy Data", href: "/" },
  { icon: ClipboardList, label: "Track Order", href: "/order-status" },
  { icon: ShieldCheck, label: "Verify Payment", href: "/order-status" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function MobileMenu({ open, onClose }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/");
      onClose();
    } catch {
      toast.error("Logout failed. Try again.");
    }
  };

  const navItems = user ? AUTH_NAV : GUEST_NAV;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={clsx(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Slide-in drawer */}
      <div
        className={clsx(
          "fixed top-0 left-0 z-50 h-full w-[80vw] max-w-xs bg-[#2B4EC8] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Wifi className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="font-black text-white text-base leading-none">BrownDev</span>
              <span className="block text-[9px] text-blue-200 font-bold tracking-[0.2em] uppercase">Data Hub</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* User greeting when logged in */}
        {user && (
          <div className="mx-5 mt-2 mb-1 bg-white/10 rounded-xl px-4 py-3">
            <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider">Signed in as</p>
            <p className="text-white font-black text-sm mt-0.5 truncate">
              {user.displayName || user.email}
            </p>
          </div>
        )}

        {/* Divider */}
        <div className="mx-5 mt-3 border-t border-white/10" />

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto pt-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={clsx(
                  "flex items-center gap-3.5 px-6 py-4 border-b border-white/10 text-sm font-bold transition-colors",
                  isActive ? "text-[#FFBB00]" : "text-white/90 hover:text-[#FFBB00]"
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}

          {/* Logout — only when signed in */}
          {user && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3.5 px-6 py-4 border-b border-white/10 text-sm font-bold text-white/90 hover:text-red-300 transition-colors"
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              Logout
            </button>
          )}
        </nav>

        {/* Bottom CTA */}
        <div className="px-5 pb-10 pt-5 border-t border-white/10">
          <a
            href="https://wa.me/233"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-[#FFBB00] text-[#3D1A00] font-black text-sm py-3.5 rounded-xl tracking-wider uppercase"
          >
            💬 WhatsApp Support
          </a>
        </div>
      </div>
    </>
  );
}
