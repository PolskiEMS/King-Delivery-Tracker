"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Edit3, Loader2, PackageCheck, Plus, Route, Trash2, Truck, Users, X } from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";

type Driver = { id: string; firstName: string; lastName: string };
type Vehicle = { id: string; registration: string; brand: string | null; model: string | null; pallets: number | null };
type Order = { id: string; orderNumber: string; customerName: string; city: string; address: string; goodsName: string; quantity: number; unit: string; status: string };
type AppRoute = {
  id: string;
  routeNumber: string;
  name: string;
  plannedDate: string | null;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  notes: string | null;
  driver: Driver | null;
  vehicle: Vehicle | null;
  driverId?: string | null;
  vehicleId?: string | null;
  deliveries: { id: string; order: Order }[];
};

type RouteForm = {
  routeNumber: string;
  name: string;
  plannedDate: string;
  driverId: string;
  vehicleId: string;
  notes: string;
  orderIds: string[];
};

const initialForm: RouteForm = { routeNumber: "", name: "", plannedDate: "", driverId: "", vehicleId: "", notes: "", orderIds: [] };
const statusLabels = { PLANNED: "Zaplanowana", IN_PROGRESS: "W trakcie", COMPLETED: "Zakończona", CANCELLED: "Anulowana" };

function toDateInputValue(value: string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function vehicleLabel(vehicle: Vehicle) {
  const model = [vehicle.brand, vehicle.model].filter(Boolean).join(" ");
  return `${vehicle.registration}${model ? ` — ${model}` : ""}`;
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState<AppRoute[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [form, setForm] = useState<RouteForm>(initialForm);
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

  const resetForm = useCallback(() => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(false);
  }, []);

  const openCreateForm = useCallback(() => {
    setEditingId(null);
    setForm(initialForm);
    setShowForm(true);
    scrollToForm();
  }, [scrollToForm]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [routesResponse, driversResponse, vehiclesResponse, ordersResponse] = await Promise.all([
      fetch("/api/routes", { cache: "no-store" }),
      fetch("/api/drivers", { cache: "no-store" }),
      fetch("/api/vehicles", { cache: "no-store" }),
      fetch("/api/orders", { cache: "no-store" }),
    ]);
    const [routesData, driversData, vehiclesData, ordersData] = await Promise.all([
      routesResponse.json(),
      driversResponse.json(),
      vehiclesResponse.json(),
      ordersResponse.json(),
    ]) as [{ routes?: AppRoute[] }, { drivers?: Driver[] }, { vehicles?: Vehicle[] }, { orders?: Order[] }];
    setRoutes(routesData.routes ?? []);
    setDrivers(driversData.drivers ?? []);
    setVehicles(vehiclesData.vehicles ?? []);
    setOrders((ordersData.orders ?? []).filter((order) => order.status === "NEW"));
    setLoading(false);
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  useEffect(() => {
    if (window.location.hash === "#nowa-trasa") {
      openCreateForm();
    }
  }, [openCreateForm]);

  const stats = useMemo(() => [
    { label: "Zaplanowane", value: routes.filter((routeItem) => routeItem.status === "PLANNED").length, icon: Route },
    { label: "W trakcie", value: routes.filter((routeItem) => routeItem.status === "IN_PROGRESS").length, icon: Truck },
    { label: "Dostawy w trasach", value: routes.reduce((sum, routeItem) => sum + routeItem.deliveries.length, 0), icon: PackageCheck },
    { label: "Kierowcy", value: drivers.length, icon: Users },
  ], [drivers.length, routes]);

  function toggleOrder(orderId: string) {
    setForm((current) => ({
      ...current,
      orderIds: current.orderIds.includes(orderId) ? current.orderIds.filter((id) => id !== orderId) : [...current.orderIds, orderId],
    }));
  }

  function editRoute(routeItem: AppRoute) {
    setEditingId(routeItem.id);
    setForm({
      routeNumber: routeItem.routeNumber,
      name: routeItem.name,
      plannedDate: toDateInputValue(routeItem.plannedDate),
      driverId: routeItem.driver?.id ?? routeItem.driverId ?? "",
      vehicleId: routeItem.vehicle?.id ?? routeItem.vehicleId ?? "",
      notes: routeItem.notes ?? "",
      orderIds: [],
    });
    setShowForm(true);
    scrollToForm();
  }

  async function deleteRoute(id: string) {
    const confirmed = window.confirm("Czy na pewno usunąć trasę? Usunie to trasę z widoku kierowcy i odblokuje zamówienia do ponownego planowania.");
    if (!confirmed) return;
    setDeletingId(id);
    setMessage(null);
    const response = await fetch(`/api/routes?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const data = (await response.json()) as { ok: boolean; error?: string };
    setDeletingId(null);
    if (!response.ok || !data.ok) {
      setMessage(data.error ?? "Nie udało się usunąć trasy.");
      return;
    }
    if (editingId === id) resetForm();
    setMessage("Trasa została usunięta i zniknie z panelu kierowcy.");
    await loadData();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    const response = await fetch("/api/routes", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingId ? { ...form, id: editingId } : form),
    });
    const data = (await response.json()) as { ok: boolean; error?: string };
    setSaving(false);

    if (!response.ok || !data.ok) {
      setMessage(data.error ?? "Nie udało się zapisać trasy.");
      return;
    }

    resetForm();
    setMessage(editingId ? "Trasa została zaktualizowana." : "Trasa została utworzona, a wybrane zamówienia zamieniono w dostawy.");
    await loadData();
  }

  return (
    <main className="min-h-screen bg-[#020813] text-slate-100">
      <div className="flex min-h-screen">
        <Sidebar />
        <section className="flex-1 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.14),transparent_34%),linear-gradient(180deg,#061123_0%,#020813_44%,#020813_100%)]">
          <header className="flex min-h-20 flex-col gap-4 border-b border-white/10 bg-[#020813]/90 px-4 py-5 shadow-2xl shadow-black/20 backdrop-blur sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-9">
            <div>
              <h1 className="text-2xl font-bold text-white">Trasy</h1>
              <p className="mt-1 text-sm text-slate-400">Tworzenie tras z nowych zamówień i przypisywanie ich kierowcom.</p>
            </div>
            <button onClick={openCreateForm} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-[#020813] sm:w-auto sm:py-2.5"><Plus className="h-4 w-4" />Dodaj trasę</button>
          </header>

          <div className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-5 sm:px-6 lg:p-8">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return <article key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20"><Icon className="h-6 w-6 text-amber-300" /><p className="mt-4 text-3xl font-black text-white">{stat.value}</p><p className="text-sm text-slate-400">{stat.label}</p></article>;
              })}
            </div>

            {message && <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm font-semibold text-amber-200">{message}</div>}

            {showForm && <article ref={formRef} id="nowa-trasa" className="scroll-mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/20 sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-bold text-white">{editingId ? "Edytuj trasę" : "Nowa trasa"}</h2>
                {editingId && <p className="text-sm font-semibold text-amber-200">Edycja danych z listy tras</p>}
              </div>
              <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <input required placeholder="Numer trasy" value={form.routeNumber} onChange={(e) => setForm({ ...form, routeNumber: e.target.value })} className="rounded-xl border border-white/10 bg-[#020813]/70 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/50" />
                <input required placeholder="Nazwa trasy" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl border border-white/10 bg-[#020813]/70 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/50" />
                <input type="date" value={form.plannedDate} onChange={(e) => setForm({ ...form, plannedDate: e.target.value })} className="rounded-xl border border-white/10 bg-[#020813]/70 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/50" />
                <select value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })} className="rounded-xl border border-white/10 bg-[#020813]/70 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/50"><option value="">Bez kierowcy</option>{drivers.map((driver) => <option key={driver.id} value={driver.id}>{driver.firstName} {driver.lastName}</option>)}</select>
                <select value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} className="rounded-xl border border-white/10 bg-[#020813]/70 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/50"><option value="">Bez pojazdu</option>{vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicleLabel(vehicle)}</option>)}</select>
                <textarea placeholder="Notatki" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="rounded-xl border border-white/10 bg-[#020813]/70 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/50" />
                {!editingId && <div className="sm:col-span-2 xl:col-span-3"><p className="mb-3 text-sm font-semibold text-slate-300">Zamówienia do trasy</p><div className="grid gap-3 md:grid-cols-2">{orders.length ? orders.map((order) => <label key={order.id} className="flex cursor-pointer gap-3 rounded-xl border border-white/10 bg-[#020813]/50 p-4 text-sm text-slate-300"><input type="checkbox" checked={form.orderIds.includes(order.id)} onChange={() => toggleOrder(order.id)} className="mt-1" /><span><span className="font-semibold text-white">{order.orderNumber}</span> — {order.customerName}, {order.city}<br /><span className="text-slate-500">{order.goodsName} ({order.quantity} {order.unit})</span></span></label>) : <p className="text-sm text-slate-500">Brak nowych zamówień do przypisania.</p>}</div></div>}
                {editingId && <p className="text-sm text-slate-500 sm:col-span-2 xl:col-span-3">Edycja trasy zmienia dane główne, kierowcę i pojazd. Dostawy przypisane do trasy pozostają bez zmian.</p>}
                <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2 xl:col-span-3">
                  <button type="button" onClick={resetForm} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-slate-300 transition hover:border-amber-400/30 hover:text-amber-300"><X className="h-4 w-4" />Anuluj</button>
                  {editingId && <button type="button" disabled={deletingId === editingId} onClick={() => void deleteRoute(editingId)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-5 py-3 text-sm font-bold text-red-200 transition hover:border-red-300/40 hover:bg-red-400/15 disabled:opacity-60"><Trash2 className="h-4 w-4" />Usuń trasę</button>}
                  <button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-[#020813]">{saving && <Loader2 className="h-4 w-4 animate-spin" />}{editingId ? "Zapisz zmiany" : "Zapisz trasę"}</button>
                </div>
              </form>
            </article>}

            <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20">
              <h2 className="text-lg font-bold text-white">Lista tras</h2>
              <div className="mt-5 grid gap-4">
                {loading ? <p className="text-slate-500">Ładowanie tras...</p> : routes.length ? routes.map((routeItem) => <div key={routeItem.id} className="rounded-2xl border border-white/10 bg-[#020813]/50 p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div><p className="font-bold text-white">{routeItem.routeNumber} — {routeItem.name}</p><p className="mt-2 flex items-center gap-2 text-sm text-slate-400"><CalendarDays className="h-4 w-4 text-amber-300" />{routeItem.plannedDate ? new Date(routeItem.plannedDate).toLocaleDateString("pl-PL") : "Brak daty"}</p></div>
                    <div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200">{statusLabels[routeItem.status]}</span><button type="button" onClick={() => editRoute(routeItem)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-amber-400/30 hover:text-amber-300"><Edit3 className="h-3.5 w-3.5" />Edytuj</button><button type="button" disabled={deletingId === routeItem.id} onClick={() => void deleteRoute(routeItem.id)} className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs font-bold text-red-200 transition hover:border-red-300/40 hover:bg-red-400/15 disabled:opacity-60"><Trash2 className="h-3.5 w-3.5" />Usuń</button></div>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-slate-400 md:grid-cols-3"><p>Kierowca: <span className="text-slate-100">{routeItem.driver ? `${routeItem.driver.firstName} ${routeItem.driver.lastName}` : "Nieprzypisany"}</span></p><p>Dostawy: <span className="text-slate-100">{routeItem.deliveries.length}</span></p><p>Pojazd: <span className="text-slate-100">{routeItem.vehicle ? vehicleLabel(routeItem.vehicle) : "Brak"}</span></p></div>
                </div>) : <p className="text-slate-500">Brak tras. Dodaj pierwszą trasę.</p>}
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
