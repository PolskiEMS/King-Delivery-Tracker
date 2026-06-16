"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CircleDot,
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

type DispatcherStatus = "AVAILABLE" | "BUSY" | "AWAY" | "OFFLINE";
type Dispatcher = { id: string; email: string; firstName: string; lastName: string; dispatcherStatus: DispatcherStatus };

const dispatcherStatusLabels: Record<DispatcherStatus, string> = {
  AVAILABLE: "Dostępny",
  BUSY: "Zajęty",
  AWAY: "Poza stanowiskiem",
  OFFLINE: "Offline",
};

const dispatcherStatusStyles: Record<DispatcherStatus, string> = {
  AVAILABLE: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  BUSY: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  AWAY: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  OFFLINE: "border-slate-400/30 bg-slate-400/10 text-slate-300",
};

const dispatcherStatuses = Object.keys(dispatcherStatusLabels) as DispatcherStatus[];

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
  const [dispatchers, setDispatchers] = useState<Dispatcher[]>([]);
  const [selectedDispatcherId, setSelectedDispatcherId] = useState("");
  const [dispatcherMessage, setDispatcherMessage] = useState<string | null>(null);
  const [statusSaving, setStatusSaving] = useState(false);

  const selectedDispatcher = useMemo(
    () => dispatchers.find((dispatcher) => dispatcher.id === selectedDispatcherId) ?? dispatchers[0],
    [dispatchers, selectedDispatcherId],
  );

  const loadDispatchers = useCallback(async () => {
    const response = await fetch("/api/dispatchers", { cache: "no-store" });
    const data = (await response.json()) as { dispatchers?: Dispatcher[] };
    const loadedDispatchers = data.dispatchers ?? [];
    setDispatchers(loadedDispatchers);
    setSelectedDispatcherId((current) => current || loadedDispatchers[0]?.id || "");
  }, []);

  useEffect(() => {
    void loadDispatchers();
  }, [loadDispatchers]);

  async function updateDispatcherStatus(dispatcherStatus: DispatcherStatus) {
    if (!selectedDispatcher) return;

    setStatusSaving(true);
    setDispatcherMessage(null);

    const response = await fetch("/api/dispatchers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedDispatcher.id, dispatcherStatus }),
    });
    const data = (await response.json()) as { ok: boolean; error?: string; dispatcher?: Dispatcher };
    setStatusSaving(false);

    if (!response.ok || !data.ok || !data.dispatcher) {
      setDispatcherMessage(data.error ?? "Nie udało się zmienić statusu.");
      return;
    }

    setDispatchers((current) => current.map((dispatcher) => dispatcher.id === data.dispatcher?.id ? data.dispatcher : dispatcher));
    setDispatcherMessage("Status dyspozytora został zmieniony.");
  }

  return (
    <main className="min-h-screen bg-[#020813] text-slate-100">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="flex-1 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.14),transparent_34%),linear-gradient(180deg,#061123_0%,#020813_44%,#020813_100%)]">
          <header className="flex min-h-20 flex-col gap-4 border-b border-white/10 bg-[#020813]/90 px-4 py-5 shadow-2xl shadow-black/20 backdrop-blur sm:px-6 md:flex-row md:items-center md:justify-between lg:px-9">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-300 lg:hidden">
                King Delivery Tracker
              </p>
              <h1 className="text-2xl font-bold text-white">Pulpit</h1>
              <p className="mt-1 hidden text-sm text-slate-400 sm:block">
                Operacyjny widok tras, dostaw i powiadomień.
              </p>
            </div>

            <div className="grid w-full grid-cols-[1fr_auto_auto] items-center gap-3 md:w-auto md:flex">
              <button className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-400 transition hover:border-amber-400/30 hover:bg-white/[0.07] hover:text-slate-100 md:flex">
                <Search className="h-4 w-4" />
                Szukaj
              </button>

              <Link
                href="/dispatcher/routes#nowa-trasa"
                className="inline-flex min-w-0 items-center justify-center gap-2 rounded-xl bg-amber-400 px-3 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-400/10 transition hover:bg-amber-300 sm:px-4"
              >
                <Plus className="h-4 w-4" />
                Dodaj trasę
              </Link>

              <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-amber-400/30 hover:bg-white/[0.07] hover:text-amber-300" aria-label="Powiadomienia">
                <Bell className="h-5 w-5" />
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-amber-400/30 hover:bg-white/[0.07] hover:text-amber-300" aria-label="Pomoc">
                <ShieldQuestion className="h-5 w-5" />
              </button>
            </div>
          </header>

          <div className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-5 sm:px-6 lg:p-8">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <article
                    key={stat.label}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/20 backdrop-blur sm:p-6"
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

            <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/20 backdrop-blur sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                    Status dyspozytora
                  </p>
                  <h2 className="mt-2 text-lg font-bold text-white">
                    Zmień swoją dostępność
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Status jest widoczny dla administratora w panelu admin.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] lg:min-w-[560px]">
                  <select
                    value={selectedDispatcher?.id ?? ""}
                    onChange={(event) => setSelectedDispatcherId(event.target.value)}
                    className="rounded-xl border border-white/10 bg-[#020813]/70 px-4 py-3 text-sm font-semibold text-white outline-none focus:border-amber-400/50"
                  >
                    {dispatchers.length ? dispatchers.map((dispatcher) => (
                      <option key={dispatcher.id} value={dispatcher.id}>
                        {dispatcher.firstName} {dispatcher.lastName}
                      </option>
                    )) : <option value="">Brak dyspozytorów</option>}
                  </select>

                  {selectedDispatcher && (
                    <span className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold ${dispatcherStatusStyles[selectedDispatcher.dispatcherStatus]}`}>
                      <CircleDot className="h-4 w-4" />
                      {dispatcherStatusLabels[selectedDispatcher.dispatcherStatus]}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-4">
                {dispatcherStatuses.map((status) => (
                  <button
                    key={status}
                    type="button"
                    disabled={!selectedDispatcher || statusSaving}
                    onClick={() => updateDispatcherStatus(status)}
                    className={`rounded-xl border px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${dispatcherStatusStyles[status]}`}
                  >
                    {dispatcherStatusLabels[status]}
                  </button>
                ))}
              </div>

              {dispatcherMessage && (
                <p className="mt-3 text-sm font-semibold text-amber-200">{dispatcherMessage}</p>
              )}
            </article>

            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/20 backdrop-blur sm:p-6">
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

              <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/20 backdrop-blur sm:p-6">
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
              <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/20 backdrop-blur sm:p-6">
                <h2 className="text-lg font-bold text-white">Status dostaw</h2>

                <div className="mt-6 flex items-center gap-8">
                  <div className="h-32 w-32 rounded-full bg-[conic-gradient(from_120deg,rgba(251,191,36,0.85),rgba(16,185,129,0.65),rgba(148,163,184,0.25),rgba(251,191,36,0.85))] p-7 shadow-lg shadow-amber-500/10">
                    <div className="h-full w-full rounded-full border border-white/10 bg-[#020813]" />
                  </div>

                  <div className="space-y-3 text-sm text-slate-300">
                    {deliveryStatuses.map(([label, value, color]) => (
                      <div key={label} className="grid w-full grid-cols-[1fr_auto_auto] items-center gap-3 md:w-auto md:flex">
                        <span className={`h-3 w-3 rounded-full ${color}`} />
                        <span className="min-w-28 text-slate-400">{label}</span>
                        <span className="font-semibold">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>

              <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/20 backdrop-blur sm:p-6">
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
