"use client";
import clsx from "clsx";
import { Check } from "lucide-react";

const STEPS = ["Network", "Bundle", "Checkout"];

interface Props {
  current: number;
}

export default function StepIndicator({ current }: Props) {
  return (
    <div className="flex items-center justify-center mb-6 lg:mb-8">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={clsx(
                  "h-8 w-8 lg:h-9 lg:w-9 rounded-full flex items-center justify-center text-xs font-black transition-all duration-200",
                  done && "bg-[#2B4EC8] text-white",
                  active && "bg-[#2B4EC8] text-white ring-4 ring-blue-200 ring-offset-1 ring-offset-[#EEF2FF]",
                  !done && !active && "bg-slate-200 text-slate-400"
                )}
              >
                {done ? <Check className="h-4 w-4" /> : <span className="lg:text-sm">{i + 1}</span>}
              </div>
              <span
                className={clsx(
                  "text-[10px] lg:text-xs font-bold tracking-wide",
                  active || done ? "text-[#2B4EC8]" : "text-slate-400"
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={clsx(
                  "h-0.5 mx-2 mb-4 rounded-full transition-colors duration-300",
                  "w-10 sm:w-16 lg:w-24 xl:w-32",
                  i < current ? "bg-[#2B4EC8]" : "bg-slate-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
