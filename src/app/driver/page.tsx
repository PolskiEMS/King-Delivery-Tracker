import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Map,
  Navigation,
  Package,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const stops = [
  [
    "Firma ABC Sp. z o.o.",
    "ul. Przemysłowa 10, Warszawa",
    "Dostarczono",
    "text-emerald-400",
  ],
  [
    "Hurtownia XYZ",
    "ul. Logistyczna 5, Warszawa",
    "Dostarczono",
    "text-emerald-400",
  ],
  [
    "Sklep 123",
    "ul. Kwiatowa 20, Warszawa",
    "W trakcie",
    "text-amber-300",
  ],
  [
    "Magazyn DEF",
    "ul. Towarowa 15, Warszawa",
    "Oczekuje",
    "text-slate-400",
  ],
];

export default function DriverPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white">
      <section className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-[#07111d] p-5 shadow-2xl shadow-black/50">
        <header className="flex items-center justify-between py-3">
          <Link href="/" className="rounded-full p-2 transition hover:bg-white/10">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <p className="font-bold">Moja trasa</p>
          <Truck className="h-5 w-5 text-slate-400" />
        </header>

        <div className="mt-6 rounded-2xl bg-white/[0.04] p-5">
          <p className="font-bold">TR-2024-05-24-01</p>
          <p className="mt-1 text-sm text-slate-400">10 punktów dostawy</p>

          <div className="mt-5 flex items-center justify-between text-sm">
            <span>Postęp trasy</span>
            <span className="font-semibold">6 / 10</span>
          </div>

          <div className="mt-2 h-2 rounded-full bg-slate-800">
            <div className="h-2 w-3/5 rounded-full bg-emerald-500" />
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {stops.map(([name, address, status, color], index) => (
            <article
              key={name}
              className={`rounded-2xl p-4 ${
                index === 2
                  ? "bg-blue-600/20 ring-1 ring-blue-500/30"
                  : "bg-white/[0.03]"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold">
                  {index + 1}
                </span>

                <div className="flex-1">
                  <p className="font-semibold">{name}</p>
                  <p className="mt-1 text-xs text-slate-400">{address}</p>
                </div>

                <span className={`text-xs font-semibold ${color}`}>
                  {status}
                </span>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button className="gap-2">
            <Navigation className="h-4 w-4" />
            Nawiguj
          </Button>

          <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-500 px-4 py-3 text-sm font-semibold text-blue-400">
            <Package className="h-4 w-4" />
            Dostawa
          </button>
        </div>

        <nav className="mt-7 grid grid-cols-3 border-t border-white/10 pt-4 text-center text-xs text-slate-400">
          <span className="text-blue-400">
            <Navigation className="mx-auto mb-1 h-5 w-5" />
            Trasa
          </span>
          <span>
            <Map className="mx-auto mb-1 h-5 w-5" />
            Mapa
          </span>
          <span>
            <CheckCircle2 className="mx-auto mb-1 h-5 w-5" />
            Status
          </span>
        </nav>
      </section>
    </main>
  );
}