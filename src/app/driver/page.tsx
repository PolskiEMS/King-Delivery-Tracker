import Link from "next/link";
import { ArrowLeft, CheckCircle2, Database, Map, Navigation, Package, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

function EmptyDeliveryList() {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-center">
      <Database className="mx-auto h-8 w-8 text-slate-500" />
      <p className="mt-3 font-semibold">Brak przypisanej trasy</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Punkty dostaw, adresy i statusy będą pobierane z bazy danych po zalogowaniu kierowcy.
      </p>
    </div>
  );
}

export default function DriverPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white">
      <section className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-[#07111d] p-5 shadow-2xl shadow-black/50">
        <header className="flex items-center justify-between py-3">
          <Link href="/" className="rounded-full p-2 transition hover:bg-white/10"><ArrowLeft className="h-5 w-5" /></Link>
          <p className="font-bold">Moja trasa</p>
          <Truck className="h-5 w-5 text-slate-400" />
        </header>
        <div className="mt-6 rounded-2xl bg-white/[0.04] p-5">
          <p className="font-bold text-slate-300">Trasa z bazy danych</p>
          <p className="mt-1 text-sm text-slate-400">Po zalogowaniu pojawią się szczegóły aktywnej trasy.</p>
          <div className="mt-5 flex items-center justify-between text-sm">
            <span>Postęp trasy</span>
            <span className="font-semibold text-slate-400">—</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-slate-800"><div className="h-2 w-0 rounded-full bg-emerald-500" /></div>
        </div>
        <EmptyDeliveryList />
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button className="gap-2" disabled><Navigation className="h-4 w-4" /> Nawiguj</Button>
          <button disabled className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-500/40 px-4 py-3 text-sm font-semibold text-blue-400/60">
            <Package className="h-4 w-4" /> Dostawa
          </button>
        </div>
        <nav className="mt-7 grid grid-cols-3 border-t border-white/10 pt-4 text-center text-xs text-slate-400">
          <span className="text-blue-400"><Navigation className="mx-auto mb-1 h-5 w-5" />Trasa</span>
          <span><Map className="mx-auto mb-1 h-5 w-5" />Mapa</span>
          <span><CheckCircle2 className="mx-auto mb-1 h-5 w-5" />Status</span>
        </nav>
      </section>
    </main>
  );
}
