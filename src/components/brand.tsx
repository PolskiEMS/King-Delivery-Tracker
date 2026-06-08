import { Crown } from "lucide-react";

type BrandProps = {
  compact?: boolean;
};

export function Brand({ compact = false }: BrandProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20">
        <Crown className="h-6 w-6" />
      </span>

      {!compact && (
        <div>
          <p className="text-lg font-black text-white">King Delivery Tracker</p>
          <p className="text-xs text-slate-400">Transport • Dostawy • GPS</p>
        </div>
      )}
    </div>
  );
}