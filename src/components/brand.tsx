import { Crown } from "lucide-react";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Crown className={compact ? "h-8 w-8 text-amber-400" : "h-12 w-12 text-amber-400"} strokeWidth={1.8} />
      <div className="leading-none">
        <p className={compact ? "text-2xl font-black tracking-[0.08em] text-white" : "text-4xl font-black tracking-[0.08em] text-white"}>KING</p>
        <p className={compact ? "mt-1 text-[0.6rem] font-bold tracking-[0.17em] text-white/90" : "mt-1 text-sm font-bold tracking-[0.18em] text-white/90"}>DELIVERY TRACKER</p>
      </div>
    </div>
  );
}
