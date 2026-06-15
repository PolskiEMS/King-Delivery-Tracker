"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Phone, Plus, RefreshCw, Route, Users } from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";

type Driver = { id: string; firstName: string; lastName: string; phone: string | null; active: boolean; routes: unknown[] };
const initialForm = { firstName: "", lastName: "", phone: "" };

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadDrivers = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/drivers", { cache: "no-store" });
    const data = (await response.json()) as { drivers?: Driver[] };
    setDrivers(data.drivers ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { void loadDrivers(); }, [loadDrivers]);

  const activeDrivers = useMemo(() => drivers.filter((driver) => driver.active).length, [drivers]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    const response = await fetch("/api/drivers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = (await response.json()) as { ok: boolean; error?: string };
    setSaving(false);

    if (!response.ok || !data.ok) {
      setMessage(data.error ?? "Nie udało się zapisać kierowcy.");
      return;
    }

    setForm(initialForm);
    setShowForm(false);
    setMessage("Kierowca został dodany.");
    await loadDrivers();
  }

  return (
    <main className="min-h-screen bg-[#020813] text-slate-100">
      <div className="flex min-h-screen">
        <Sidebar />
        <section className="flex-1 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.14),transparent_34%),linear-gradient(180deg,#061123_0%,#020813_44%,#020813_100%)]">
          <header className="flex min-h-20 flex-col gap-4 border-b border-white/10 bg-[#020813]/90 px-6 py-5 shadow-2xl shadow-black/20 backdrop-blur lg:flex-row lg:items-center lg:justify-between lg:px-9">
            <div>
              <h1 className="text-2xl font-bold text-white">Kierowcy</h1>
              <p className="mt-1 text-sm text-slate-400">Lista kierowców dostępnych do przypisywania tras.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => void loadDrivers()} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-300 hover:text-amber-300"><RefreshCw className="h-4 w-4" />Odśwież</button>
              <button onClick={() => setShowForm((value) => !value)} className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-[#020813]"><Plus className="h-4 w-4" />Dodaj kierowcę</button>
            </div>
          </header>

          <div className="space-y-6 p-6 lg:p-8">
            <div className="grid gap-4 md:grid-cols-3">
              {[{ label: "Aktywni", value: activeDrivers, icon: Users }, { label: "Wszyscy", value: drivers.length, icon: CheckCircle2 }, { label: "Trasy przypisane", value: drivers.reduce((sum, driver) => sum + driver.routes.length, 0), icon: Route }].map((stat) => {
                const Icon = stat.icon;
                return <article key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20"><Icon className="h-6 w-6 text-amber-300" /><p className="mt-4 text-3xl font-black text-white">{stat.value}</p><p className="text-sm text-slate-400">{stat.label}</p></article>;
              })}
            </div>

            {message && <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm font-semibold text-amber-200">{message}</div>}

            {showForm && <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20">
              <h2 className="text-lg font-bold text-white">Nowy kierowca</h2>
              <form onSubmit={submit} className="mt-5 grid gap-4 md:grid-cols-3">
                <input required placeholder="Imię" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="rounded-xl border border-white/10 bg-[#020813]/70 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/50" />
                <input required placeholder="Nazwisko" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="rounded-xl border border-white/10 bg-[#020813]/70 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/50" />
                <input placeholder="Telefon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-xl border border-white/10 bg-[#020813]/70 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/50" />
                <button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-[#020813] md:col-span-3">{saving && <Loader2 className="h-4 w-4 animate-spin" />}Zapisz kierowcę</button>
              </form>
            </article>}

            <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20">
              <h2 className="text-lg font-bold text-white">Lista kierowców</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {loading ? <p className="text-slate-500">Ładowanie kierowców...</p> : drivers.length ? drivers.map((driver) => <div key={driver.id} className="rounded-2xl border border-white/10 bg-[#020813]/50 p-5"><p className="font-bold text-white">{driver.firstName} {driver.lastName}</p><p className="mt-2 flex items-center gap-2 text-sm text-slate-400"><Phone className="h-4 w-4 text-amber-300" />{driver.phone ?? "Brak telefonu"}</p><p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">{driver.active ? "Aktywny" : "Nieaktywny"}</p></div>) : <p className="text-slate-500">Brak kierowców. Dodaj pierwszego kierowcę.</p>}
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
