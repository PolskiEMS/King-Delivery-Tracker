import {
  Bell,
  CheckCircle2,
  Clock3,
  MapPin,
  PackageCheck,
  Plus,
  Route,
  Search,
  ShieldQuestion,
} from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";

const stats = [
  {
    label: "Aktywne trasy",
    value: "0",
    link: "Zobacz więcej",
    icon: Route,
    color: "text-amber-300",
    bg: "bg-amber-400/10",
  },
  {
    label: "Dostawy dzisiaj",
    value: "0",
    link: "Zobacz więcej",
    icon: PackageCheck,
    color: "text-sky-300",
    bg: "bg-sky-400/10",
  },
  {
    label: "Dostarczone",
    value: "0",
    link: "Zobacz więcej",
    icon: CheckCircle2,
    color: "text-emerald-300",
    bg: "bg-emerald-400/10",
  },
  {
    label: "W trakcie",
    value: "0",
    link: "Zobacz więcej",
    icon: Clock3,
    color: "text-orange-300",
    bg: "bg-orange-400/10",
  },
];

const routes: string[][] = [];

const deliveryStatuses = [
  ["Dostarczone", "0 (0%)", "bg-emerald-500"],
  ["W trakcie", "0 (0%)", "bg-amber-500"],
  ["Oczekuje", "0 (0%)", "bg-slate-500"],
  ["Problem", "0 (0%)", "bg-red-500"],
  ["Anulowane", "0 (0%)", "bg-slate-300"],
];

const notifications: string[][] = [];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "W trasie": "border-amber-400/30 bg-amber-400/10 text-amber-200",
    Oczekuje: "border-white/10 bg-white/[0.05] text-slate-300",
    Zakończona: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[status] ?? "border-white/10 bg-white/[0.05] text-slate-300"
      }`}
    >
      {status}
    </span>
  );
}

function MapPreview() {
  return (
    <div className="map-grid relative flex h-72 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#050d1d] p-6 text-center shadow-inner shadow-black/40">
      <div>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-300 shadow-lg shadow-amber-500/10">
          <MapPin className="h-8 w-8" />
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-100">
          Brak aktywnych tras do wyświetlenia
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Mapa zostanie uzupełniona po dodaniu rzeczywistych tras.
        </p>
      </div>
    </div>
  );
}

export default function DispatcherPage() {
  return (
    <main className="min-h-screen bg-[#020813] text-slate-100">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="flex-1 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.14),transparent_34%),linear-gradient(180deg,#061123_0%,#020813_44%,#020813_100%)]">
          <header className="flex h-20 items-center justify-between border-b border-white/10 bg-[#020813]/90 px-6 shadow-2xl shadow-black/20 backdrop-blur lg:px-9">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-300 lg:hidden">
                King Delivery Tracker
              </p>
              <h1 className="text-2xl font-bold text-white">Pulpit</h1>
              <p className="mt-1 hidden text-sm text-slate-400 sm:block">
                Operacyjny widok tras, dostaw i powiadomień.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-400 transition hover:border-amber-400/30 hover:bg-white/[0.07] hover:text-slate-100 md:flex">
                <Search className="h-4 w-4" />
                Szukaj
              </button>

              <button className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-[#020813] shadow-lg shadow-amber-500/20 transition hover:bg-amber-300">
                <Plus className="h-4 w-4" />
                Dodaj trasę
                <link rel="app/routes/page.tsx" />
              </button>

              <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-amber-400/30 hover:bg-white/[0.07] hover:text-amber-300" aria-label="Powiadomienia">
                <Bell className="h-5 w-5" />
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-amber-400/30 hover:bg-white/[0.07] hover:text-amber-300" aria-label="Pomoc">
                <ShieldQuestion className="h-5 w-5" />
              </button>
            </div>
          </header>

          <div className="space-y-6 p-6 lg:p-8">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <article
                    key={stat.label}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur"
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className={`flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 ${stat.bg}`}
                      >
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </span>

                      <div>
                        <p className="text-3xl font-black text-white">{stat.value}</p>
                        <p className="text-sm font-medium text-slate-400">
                          {stat.label}
                        </p>
                        <a
                          href="#"
                          className="mt-3 inline-block text-sm font-semibold text-amber-300 transition hover:text-amber-200"
                        >
                          {stat.link}
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <h2 className="text-lg font-bold text-white">Ostatnie trasy</h2>
                  <a href="#" className="text-sm font-semibold text-amber-300 transition hover:text-amber-200">
                    Zobacz wszystkie trasy
                  </a>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px] text-left text-sm text-slate-300">
                    <thead className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      <tr>
                        <th className="pb-4">Trasa</th>
                        <th className="pb-4">Kierowca</th>
                        <th className="pb-4">Pojazd</th>
                        <th className="pb-4">Status</th>
                        <th className="pb-4">Postęp</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-white/10">
                      {routes.length > 0 ? (
                        routes.map(
                          ([id, driver, vehicle, status, progress]) => (
                            <tr key={id}>
                              <td className="py-4 font-semibold text-white">{id}</td>
                              <td className="py-4">{driver}</td>
                              <td className="py-4">{vehicle}</td>
                              <td className="py-4">
                                <StatusBadge status={status} />
                              </td>
                              <td className="py-4 font-semibold text-white">{progress}</td>
                            </tr>
                          ),
                        )
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-10 text-center text-sm text-slate-500"
                          >
                            Brak tras. Dodaj pierwszą trasę, aby rozpocząć
                            pracę.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </article>

              <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <h2 className="text-lg font-bold text-white">Mapa na żywo</h2>
                  <a href="#" className="text-sm font-semibold text-amber-300 transition hover:text-amber-200">
                    Otwórz mapę
                  </a>
                </div>

                <MapPreview />
              </article>
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
              <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur">
                <h2 className="text-lg font-bold text-white">Status dostaw</h2>

                <div className="mt-6 flex items-center gap-8">
                  <div className="h-32 w-32 rounded-full bg-[conic-gradient(from_120deg,rgba(251,191,36,0.85),rgba(16,185,129,0.65),rgba(148,163,184,0.25),rgba(251,191,36,0.85))] p-7 shadow-lg shadow-amber-500/10">
                    <div className="h-full w-full rounded-full border border-white/10 bg-[#020813]" />
                  </div>

                  <div className="space-y-3 text-sm text-slate-300">
                    {deliveryStatuses.map(([label, value, color]) => (
                      <div key={label} className="flex items-center gap-3">
                        <span className={`h-3 w-3 rounded-full ${color}`} />
                        <span className="min-w-28 text-slate-400">{label}</span>
                        <span className="font-semibold">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>

              <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur">
                <h2 className="text-lg font-bold text-white">Ostatnie powiadomienia</h2>

                <div className="mt-5 divide-y divide-white/10">
                  {notifications.length > 0 ? (
                    notifications.map(([message, time, color]) => (
                      <div
                        key={message}
                        className="flex items-center gap-4 py-4 text-sm text-slate-300"
                      >
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full ${color}`}
                        >
                          <MapPin className="h-4 w-4" />
                        </span>
                        <p className="flex-1 font-medium text-slate-100">{message}</p>
                        <span className="text-xs text-slate-500">{time}</span>
                      </div>
                    ))
                  ) : (
                    <p className="py-10 text-center text-sm text-slate-500">
                      Brak powiadomień do wyświetlenia.
                    </p>
                  )}
                </div>

                <a
                  href="#"
                  className="mt-4 inline-block text-sm font-semibold text-amber-300 transition hover:text-amber-200"
                >
                  Zobacz wszystkie
                </a>
              </article>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
