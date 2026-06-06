import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-lg border border-slate-700/90 bg-slate-950/25 px-4 py-3 text-sm text-slate-100 shadow-inner shadow-black/10 outline-none transition file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/20 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);

Input.displayName = "Input";
