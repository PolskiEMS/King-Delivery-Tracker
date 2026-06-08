import { Bell, CheckCircle2, Clock3, Database, MapPin, PackageCheck, Plus, Route, Search, ShieldQuestion, Truck } from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";

const stats = [
  { label: "Aktywne trasy", icon: Route, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Dostawy dzisiaj", icon: PackageCheck, color: "text-red-500", bg: "bg-red-50" },
  { label: "Dostarczone", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "W trakcie", icon: Clock3, color: "text-amber-500", bg: "bg-amber-50" },
];

const deliveryStatuses = [
  { label: "Dostarczone", color: "bg-emerald-500" },
  { label: "W trakcie", color: "bg-amber-500" },
  { label: "Oczekuje", color: "bg-slate-500" },
  { label: "Problem", color: "bg-red-500" },
  { label: "Anulowane", color: "bg-slate-300" },
];

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <Database className="mx-auto h-8 w-8 text-slate-400" />
      <p className="mt-3 font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function MobileRouteCards() {
  return (
    <div className="md:hidden">
      <EmptyState
        title="Brak tras do wyświetlenia"
        description="Lista tras zostanie uzupełniona danymi pobranymi z bazy danych."
      />
    </div>
  );
}

const mobileNavItems = [
  { label: "Pulpit", icon: Route, color: "text-blue-600" },
  { label: "Dostawy", icon: PackageCheck, color: "text-slate-500" },
  { label: "Mapa", icon: MapPin, color: "text-slate-500" },
  { label: "Pojazdy", icon: Truck, color: "text-slate-500" },
];

function MobileBottomNav() {
  return (
    <nav className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-4 rounded-2xl border border-slate-200 bg-white/95 p-2 text-[0.68rem] font-semibold text-slate-500 shadow-2xl shadow-slate-400/30 backdrop-blur lg:hidden">
      {mobileNavItems.map((item) => {
        const Icon = item.icon;
        return (
          <a key={item.label} href="#" className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 ${item.color}`}>
            <Icon className="h-5 w-5" />
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}

function MapPreview() {
  return (
    <div className="map-grid relative h-64 overflow-hidden rounded-xl bg-slate-50 sm:h-72">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-emerald-50/60" />
      <div className="absolute inset-8 rounded-2xl border border-dashed border-slate-300" />
      <div className="absolute left-1/2 top-1/2 w-[calc(100%-3rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white/95 p-5 text-center shadow-xl">
        <MapPin className="mx-auto h-8 w-8 text-blue-600" />
        <p className="mt-3 font-bold text-slate-900">Mapa oczekuje na dane GPS</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Po podłączeniu API punkty tras i pozycje kierowców będą pobierane z bazy danych.
        </p>
      </div>
    </div>
  );
}

export default function DispatcherPage() {
  return (
    <main className="min-h-screen bg-slate-100 pb-24 text-slate-900 lg:pb-0">
      <div className="flex min-h-screen">
        <Sidebar />
        <MobileBottomNav />
        <section className="flex-1">
          <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur lg:h-20 lg:px-9">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600 lg:hidden">King Delivery Tracker</p>
              <h1 className="text-xl font-bold sm:text-2xl">Pulpit</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button className="hidden items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-500 md:flex">
                <Search className="h-4 w-4" /> Szukaj
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700 sm:px-4 sm:text-sm">
                <Plus className="h-4 w-4" /> <span className="hidden min-[390px]:inline">Dodaj trasę</span><span className="min-[390px]:hidden">Trasa</span>
              </button>
              <Bell className="h-5 w-5 text-slate-500" />
              <ShieldQuestion className="h-5 w-5 text-slate-500" />
            </div>
          </header>

          <div className="space-y-5 p-4 sm:p-6 lg:space-y-6 lg:p-8">
            <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <article key={stat.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                      <span className={`flex h-10 w-10 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${stat.bg}`}>
                        <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                      </span>
                      <div>
                        <p className="text-2xl font-black text-slate-400">—</p>
                        <p className="text-xs font-medium text-slate-600 sm:text-sm">{stat.label}</p>
                        <p className="mt-2 text-xs font-semibold text-blue-600 sm:mt-3 sm:text-sm">Dane z bazy</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="grid gap-5 lg:gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-4 sm:mb-5">
                  <h2 className="text-base font-bold sm:text-lg">Ostatnie trasy</h2>
                  <span className="text-xs font-semibold text-slate-400 sm:text-sm">Dane z bazy</span>
                </div>
                <MobileRouteCards />
                <div className="hidden md:block">
                  <EmptyState
                    title="Brak tras do wyświetlenia"
                    description="Tabela zostanie wypełniona rekordami tras po podłączeniu źródła danych."
                  />
                </div>
              </article>

              <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-4 sm:mb-5">
                  <h2 className="text-base font-bold sm:text-lg">Mapa na żywo</h2>
                  <span className="text-xs font-semibold text-slate-400 sm:text-sm">Dane GPS</span>
                </div>
                <MapPreview />
              </article>
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
              <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <h2 className="text-base font-bold sm:text-lg">Status dostaw</h2>
                <div className="mt-5 flex flex-col gap-5 min-[420px]:flex-row min-[420px]:items-center sm:mt-6 sm:gap-8">
                  <div className="flex h-28 w-28 items-center justify-center rounded-full border-8 border-slate-100 bg-white text-2xl font-black text-slate-300 sm:h-32 sm:w-32">
                    —
                  </div>
                  <div className="space-y-3 text-sm">
                    {deliveryStatuses.map((status) => (
                      <div key={status.label} className="flex items-center gap-3">
                        <span className={`h-3 w-3 rounded-full ${status.color}`} />
                        <span className="min-w-28 text-slate-600">{status.label}</span>
                        <span className="font-semibold text-slate-400">—</span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>

              <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <h2 className="text-base font-bold sm:text-lg">Ostatnie powiadomienia</h2>
                <div className="mt-5">
                  <EmptyState
                    title="Brak powiadomień"
                    description="Powiadomienia systemowe pojawią się tutaj po zapisaniu zdarzeń w bazie danych."
                  />
                </div>
              </article>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
