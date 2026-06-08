import { Crown } from "lucide-react";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Crown className={compact ? "h-8 w-8 text-amber-400" : "h-10 w-10 text-amber-400 sm:h-12 sm:w-12"} strokeWidth={1.8} />
      <div className="leading-none">
        <p className={compact ? "text-2xl font-black tracking-[0.08em] text-white" : "text-3xl font-black tracking-[0.08em] text-white sm:text-4xl"}>KING</p>
        <p className={compact ? "mt-1 text-[0.6rem] font-bold tracking-[0.17em] text-white/90" : "mt-1 text-[0.68rem] font-bold tracking-[0.16em] text-white/90 sm:text-sm sm:tracking-[0.18em]"}>DELIVERY TRACKER</p>
      </div>
    </div>
  );
}
