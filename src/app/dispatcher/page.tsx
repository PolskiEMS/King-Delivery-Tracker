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
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    label: "Dostawy dzisiaj",
    value: "0",
    link: "Zobacz więcej",
    icon: PackageCheck,
    color: "text-red-500",
    bg: "bg-red-50",
  },
  {
    label: "Dostarczone",
    value: "0",
    link: "Zobacz więcej",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    label: "W trakcie",
    value: "0",
    link: "Zobacz więcej",
    icon: Clock3,
    color: "text-amber-500",
    bg: "bg-amber-50",
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
    "W trasie": "bg-amber-100 text-amber-700",
    Oczekuje: "bg-slate-100 text-slate-600",
    Zakończona: "bg-emerald-100 text-emerald-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}

function MapPreview() {
  return (
    <div className="map-grid flex h-72 items-center justify-center overflow-hidden rounded-xl bg-slate-50 p-6 text-center">
      <div>
        <MapPin className="mx-auto h-10 w-10 text-slate-300" />
        <p className="mt-3 text-sm font-semibold text-slate-700">
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
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="flex-1">
          <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm lg:px-9">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600 lg:hidden">
                King Delivery Tracker
              </p>
              <h1 className="text-2xl font-bold">Pulpit</h1>
            </div>

            <div className="flex items-center gap-3">
              <button className="hidden items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-500 md:flex">
                <Search className="h-4 w-4" />
                Szukaj
              </button>

              <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Dodaj trasę
              </button>

              <Bell className="h-5 w-5 text-slate-500" />
              <ShieldQuestion className="h-5 w-5 text-slate-500" />
            </div>
          </header>

          <div className="space-y-6 p-6 lg:p-8">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <article
                    key={stat.label}
                    className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}
                      >
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </span>

                      <div>
                        <p className="text-3xl font-black">{stat.value}</p>
                        <p className="text-sm font-medium text-slate-600">
                          {stat.label}
                        </p>
                        <a
                          href="#"
                          className="mt-3 inline-block text-sm font-semibold text-blue-600"
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
              <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-lg font-bold">Ostatnie trasy</h2>
                  <a href="#" className="text-sm font-semibold text-blue-600">
                    Zobacz wszystkie trasy
                  </a>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px] text-left text-sm">
                    <thead className="text-xs uppercase text-slate-500">
                      <tr>
                        <th className="pb-4">Trasa</th>
                        <th className="pb-4">Kierowca</th>
                        <th className="pb-4">Pojazd</th>
                        <th className="pb-4">Status</th>
                        <th className="pb-4">Postęp</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {routes.length > 0 ? (
                        routes.map(
                          ([id, driver, vehicle, status, progress]) => (
                            <tr key={id}>
                              <td className="py-4 font-semibold">{id}</td>
                              <td className="py-4">{driver}</td>
                              <td className="py-4">{vehicle}</td>
                              <td className="py-4">
                                <StatusBadge status={status} />
                              </td>
                              <td className="py-4 font-semibold">{progress}</td>
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

              <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-lg font-bold">Mapa na żywo</h2>
                  <a href="#" className="text-sm font-semibold text-blue-600">
                    Otwórz mapę
                  </a>
                </div>

                <MapPreview />
              </article>
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
              <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold">Status dostaw</h2>

                <div className="mt-6 flex items-center gap-8">
                  <div className="h-32 w-32 rounded-full bg-slate-200 p-7">
                    <div className="h-full w-full rounded-full bg-white" />
                  </div>

                  <div className="space-y-3 text-sm">
                    {deliveryStatuses.map(([label, value, color]) => (
                      <div key={label} className="flex items-center gap-3">
                        <span className={`h-3 w-3 rounded-full ${color}`} />
                        <span className="min-w-28 text-slate-600">{label}</span>
                        <span className="font-semibold">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>

              <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold">Ostatnie powiadomienia</h2>

                <div className="mt-5 divide-y divide-slate-100">
                  {notifications.length > 0 ? (
                    notifications.map(([message, time, color]) => (
                      <div
                        key={message}
                        className="flex items-center gap-4 py-4 text-sm"
                      >
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full ${color}`}
                        >
                          <MapPin className="h-4 w-4" />
                        </span>
                        <p className="flex-1 font-medium">{message}</p>
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
                  className="mt-4 inline-block text-sm font-semibold text-blue-600"
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
