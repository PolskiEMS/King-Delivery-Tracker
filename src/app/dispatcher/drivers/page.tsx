"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Edit3, Loader2, Phone, Plus, RefreshCw, Route, Trash2, Users } from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";

type Driver = { id: string; firstName: string; lastName: string; phone: string | null; active: boolean; routes: unknown[] };
const initialForm = { firstName: "", lastName: "", phone: "", active: true };

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLElement | null>(null);

  const scrollToForm = useCallback(() => {
    window.requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const openCreateForm = useCallback(() => {
    setEditingId(null);
    setForm(initialForm);
    setShowForm(true);
    scrollToForm();
  }, [scrollToForm]);

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
    const response = await fetch("/api/drivers", { method: editingId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editingId ? { ...form, id: editingId } : form) });
    const data = (await response.json()) as { ok: boolean; error?: string };
    setSaving(false);

    if (!response.ok || !data.ok) {
      setMessage(data.error ?? "Nie udało się zapisać kierowcy.");
      return;
    }

    setForm(initialForm);
    setShowForm(false);
    setEditingId(null);
    setMessage(editingId ? "Dane kierowcy zostały zaktualizowane." : "Kierowca został dodany.");
    await loadDrivers();
  }

  async function deleteDriver(id: string) {
    const confirmed = window.confirm("Czy na pewno usunąć kierowcę? Zostanie odpięty od tras.");
    if (!confirmed) return;
    setDeletingId(id);
    setMessage(null);
    const response = await fetch(`/api/drivers?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const data = (await response.json()) as { ok: boolean; error?: string };
    setDeletingId(null);
    if (!response.ok || !data.ok) {
      setMessage(data.error ?? "Nie udało się usunąć kierowcy.");
      return;
    }
    if (editingId === id) { setEditingId(null); setShowForm(false); setForm(initialForm); }
    setMessage("Kierowca został usunięty.");
    await loadDrivers();
  }

  function editDriver(driver: Driver) {
    setEditingId(driver.id);
    setForm({ firstName: driver.firstName, lastName: driver.lastName, phone: driver.phone ?? "", active: driver.active });
    setShowForm(true);
    scrollToForm();
  }

  return (
    <main className="min-h-screen bg-[#020813] text-slate-100">
      <div className="flex min-h-screen">
        <Sidebar />
        <section className="flex-1 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.14),transparent_34%),linear-gradient(180deg,#061123_0%,#020813_44%,#020813_100%)]">
          <header className="flex min-h-20 flex-col gap-4 border-b border-white/10 bg-[#020813]/90 px-4 py-5 shadow-2xl shadow-black/20 backdrop-blur sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-9">
            <div>
              <h1 className="text-2xl font-bold text-white">Kierowcy</h1>
              <p className="mt-1 text-sm text-slate-400">Lista kierowców dostępnych do przypisywania tras.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:flex">
              <button onClick={() => void loadDrivers()} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-300 hover:text-amber-300"><RefreshCw className="h-4 w-4" />Odśwież</button>
              <button onClick={openCreateForm} className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-[#020813]"><Plus className="h-4 w-4" />Dodaj kierowcę</button>
            </div>
          </header>

          <div className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-5 sm:px-6 lg:p-8">
            <div className="grid gap-4 md:grid-cols-3">
              {[{ label: "Aktywni", value: activeDrivers, icon: Users }, { label: "Wszyscy", value: drivers.length, icon: CheckCircle2 }, { label: "Trasy przypisane", value: drivers.reduce((sum, driver) => sum + driver.routes.length, 0), icon: Route }].map((stat) => {
                const Icon = stat.icon;
                return <article key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20"><Icon className="h-6 w-6 text-amber-300" /><p className="mt-4 text-3xl font-black text-white">{stat.value}</p><p className="text-sm text-slate-400">{stat.label}</p></article>;
              })}
            </div>

            {message && <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm font-semibold text-amber-200">{message}</div>}

            {showForm && <article ref={formRef} id="formularz-kierowcy" className="scroll-mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/20 sm:p-6">
              <h2 className="text-lg font-bold text-white">{editingId ? "Edytuj kierowcę" : "Nowy kierowca"}</h2>
              <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <input required placeholder="Imię" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="rounded-xl border border-white/10 bg-[#020813]/70 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/50" />
                <input required placeholder="Nazwisko" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="rounded-xl border border-white/10 bg-[#020813]/70 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/50" />
                <input placeholder="Telefon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-xl border border-white/10 bg-[#020813]/70 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/50" />
                <select value={form.active ? "active" : "inactive"} onChange={(e) => setForm({ ...form, active: e.target.value === "active" })} className="rounded-xl border border-white/10 bg-[#020813]/70 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/50"><option value="active">Aktywny</option><option value="inactive">Nieaktywny</option></select>
                <div className="grid gap-3 sm:col-span-2 lg:col-span-4 lg:grid-cols-2">{editingId && <button type="button" disabled={deletingId === editingId} onClick={() => void deleteDriver(editingId)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-5 py-3 text-sm font-bold text-red-200 transition hover:border-red-300/40 hover:bg-red-400/15 disabled:opacity-60"><Trash2 className="h-4 w-4" />Usuń kierowcę</button>}<button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-[#020813]">{saving && <Loader2 className="h-4 w-4 animate-spin" />}{editingId ? "Zapisz zmiany" : "Zapisz kierowcę"}</button></div>
              </form>
            </article>}

            <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20">
              <h2 className="text-lg font-bold text-white">Lista kierowców</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {loading ? <p className="text-slate-500">Ładowanie kierowców...</p> : drivers.length ? drivers.map((driver) => <div key={driver.id} className="rounded-2xl border border-white/10 bg-[#020813]/50 p-5"><p className="font-bold text-white">{driver.firstName} {driver.lastName}</p><p className="mt-2 flex items-center gap-2 text-sm text-slate-400"><Phone className="h-4 w-4 text-amber-300" />{driver.phone ?? "Brak telefonu"}</p><p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">{driver.active ? "Aktywny" : "Nieaktywny"}</p><button type="button" onClick={() => editDriver(driver)} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-amber-400/30 hover:text-amber-300"><Edit3 className="h-3.5 w-3.5" />Edytuj</button><button type="button" disabled={deletingId === driver.id} onClick={() => void deleteDriver(driver.id)} className="mt-4 ml-2 inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs font-bold text-red-200 transition hover:border-red-300/40 hover:bg-red-400/15 disabled:opacity-60"><Trash2 className="h-3.5 w-3.5" />Usuń</button></div>) : <p className="text-slate-500">Brak kierowców. Dodaj pierwszego kierowcę.</p>}
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
