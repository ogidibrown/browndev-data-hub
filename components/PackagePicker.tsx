"use client";
import clsx from "clsx";
import { DataPackage } from "@/types";
import { Check } from "lucide-react";

interface Props {
  packages: DataPackage[];
  selected: DataPackage | null;
  onSelect: (p: DataPackage) => void;
  loading?: boolean;
}

export default function PackagePicker({ packages, selected, onSelect, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 lg:grid-cols-4 gap-2.5 lg:gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-24 lg:h-28 rounded-xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!packages.length) {
    return (
      <div className="text-center py-10 text-slate-400 text-sm font-medium">
        No packages available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 lg:grid-cols-4 gap-2.5 lg:gap-3">
      {packages.map((pkg) => {
        const isActive = selected?.package_id === pkg.package_id;
        return (
          <button
            key={pkg.package_id}
            onClick={() => onSelect(pkg)}
            className={clsx(
              "relative flex flex-col items-center gap-1 rounded-xl border-2 px-2 py-4 lg:py-5 transition-all duration-150 cursor-pointer",
              isActive
                ? "border-[#2B4EC8] bg-[#2B4EC8] shadow-lg shadow-blue-400/25"
                : "border-slate-200 bg-white hover:border-[#2B4EC8]/50 hover:bg-blue-50/60 active:scale-[0.97]"
            )}
          >
            {isActive && (
              <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-white flex items-center justify-center">
                <Check className="h-2.5 w-2.5 text-[#2B4EC8]" />
              </span>
            )}
            <span className={clsx("text-xl lg:text-2xl font-black leading-none", isActive ? "text-white" : "text-[#1E293B]")}>
              {pkg.data_size}GB
            </span>
            <span className={clsx("text-[10px] font-semibold mt-0.5", isActive ? "text-blue-200" : "text-slate-400")}>
              {pkg.label && pkg.label !== String(pkg.data_size) ? pkg.label : "Bundle"}
            </span>
            <span className={clsx("text-xs font-black mt-1", isActive ? "text-blue-100" : "text-[#2B4EC8]")}>
              GHS {pkg.price.toFixed(2)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
