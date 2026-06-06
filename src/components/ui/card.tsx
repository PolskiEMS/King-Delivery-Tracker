import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-slate-900/75 shadow-2xl shadow-black/35 backdrop-blur-xl",
        className,
      )}
      {...props}
    />
  );
}
