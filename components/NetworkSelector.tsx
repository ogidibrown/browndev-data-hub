"use client";
import clsx from "clsx";
import { Network } from "@/types";
import { Wifi, Check } from "lucide-react";

const NETWORKS: {
  id: Network;
  name: string;
  from: string;
  to: string;
  textColor: string;
  iconBg: string;
  btnBg: string;
  ringColor: string;
  shadow: string;
}[] = [
  {
    id: "mtn",
    name: "MTN Data",
    from: "from-[#FFBB00]",
    to: "to-[#F59E0B]",
    textColor: "text-[#3D1A00]",
    iconBg: "bg-white/30",
    btnBg: "bg-[#3D1A00]/15 border border-[#3D1A00]/20 text-[#3D1A00]",
    ringColor: "ring-[#FFBB00]",
    shadow: "shadow-amber-300/60",
  },
  {
    id: "telecel",
    name: "Telecel Data",
    from: "from-[#EF4444]",
    to: "to-[#B91C1C]",
    textColor: "text-white",
    iconBg: "bg-white/20",
    btnBg: "bg-white/20 border border-white/30 text-white",
    ringColor: "ring-[#EF4444]",
    shadow: "shadow-red-400/60",
  },
  {
    id: "airteltigo",
    name: "AirtelTigo",
    from: "from-[#3B82F6]",
    to: "to-[#1D4ED8]",
    textColor: "text-white",
    iconBg: "bg-white/20",
    btnBg: "bg-white/20 border border-white/30 text-white",
    ringColor: "ring-[#3B82F6]",
    shadow: "shadow-blue-400/60",
  },
];

interface Props {
  selected: Network | null;
  onSelect: (n: Network) => void;
}

export default function NetworkSelector({ selected, onSelect }: Props) {
  return (
    // Mobile: 2-col grid. Desktop: 3-col so all networks fit in one row.
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
      {NETWORKS.map((n, i) => {
        const isActive = selected === n.id;
        // Last card of an odd-length list spans full width on mobile only.
        const isMobileFullWidth = i === NETWORKS.length - 1 && NETWORKS.length % 2 !== 0;

        return (
          <button
            key={n.id}
            onClick={() => onSelect(n.id)}
            className={clsx(
              "relative overflow-hidden rounded-2xl bg-gradient-to-br transition-all duration-200 cursor-pointer",
              n.from,
              n.to,
              // Full-width on mobile, normal column on desktop
              isMobileFullWidth ? "col-span-2 lg:col-span-1" : "",
              isMobileFullWidth ? "p-4 lg:p-5" : "p-5",
              isActive
                ? `ring-4 ${n.ringColor} ring-offset-2 ring-offset-[#EEF2FF] shadow-xl ${n.shadow}`
                : "shadow-md hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]"
            )}
          >
            {/* Decorative circles */}
            <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/[0.07] pointer-events-none" />

            {/*
              Mobile full-width card: horizontal row layout.
              Desktop (lg:): force flex-col so it matches the other two cards.
            */}
            <div className={clsx(
              "relative flex gap-3",
              isMobileFullWidth
                ? "flex-row items-center lg:flex-col lg:items-start"
                : "flex-col"
            )}>
              {/* Icon */}
              <div className={clsx(
                "rounded-xl flex items-center justify-center flex-shrink-0",
                isMobileFullWidth ? "h-12 w-12 lg:h-11 lg:w-11" : "h-11 w-11",
                n.iconBg
              )}>
                <Wifi className={clsx(
                  isMobileFullWidth ? "h-6 w-6 lg:h-5 lg:w-5" : "h-5 w-5",
                  n.textColor
                )} />
              </div>

              {/* Name */}
              <p className={clsx(
                "font-black leading-tight flex-1",
                isMobileFullWidth ? "text-lg lg:text-base" : "text-base",
                n.textColor
              )}>
                {n.name}
              </p>

              {/* BUY NOW */}
              <div className={clsx(
                "rounded-xl px-3 py-1.5 text-xs font-black text-center flex-shrink-0",
                isMobileFullWidth ? "lg:w-full" : "w-full",
                n.btnBg
              )}>
                {isActive ? (
                  <span className="flex items-center justify-center gap-1">
                    <Check className="h-3 w-3" /> Selected
                  </span>
                ) : "BUY NOW"}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
