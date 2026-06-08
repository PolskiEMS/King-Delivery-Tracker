import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-slate-950/70 shadow-2xl shadow-black/30 backdrop-blur ${className}`}
      {...props}
    />
  );
}