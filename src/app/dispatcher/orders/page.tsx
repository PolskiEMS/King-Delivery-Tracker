"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Edit3,
  Loader2,
  PackageCheck,
  Plus,
  RefreshCw,
  Route,
  Truck,
  Trash2,
} from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";

type OrderStatus =
  | "NEW"
  | "ASSIGNED"
  | "IN_DELIVERY"
  | "DELIVERED"
  | "PROBLEM"
  | "CANCELLED";

type OrderUser = {
  firstName: string;
  lastName: string;
};

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  address: string;
  city: string;
  postalCode: string | null;
  country: string;
  goodsName: string;
  quantity: number;
  unit: string;
  pallets: number | null;
  weightKg: number | null;
  notes: string | null;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: OrderUser | null;
};

type OrderFormState = {
  orderNumber: string;
  customerName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  goodsName: string;
  quantity: string;
  unit: string;
  pallets: string;
  weightKg: string;
  notes: string;
};

const initialFormState: OrderFormState = {
  orderNumber: "",
  customerName: "",
  address: "",
  city: "",
  postalCode: "",
  country: "UK",
  goodsName: "",
  quantity: "",
  unit: "szt.",
  pallets: "",
  weightKg: "",
  notes: "",
};

const statusLabels: Record<OrderStatus, string> = {
  NEW: "Nowe",
  ASSIGNED: "Przypisane",
  IN_DELIVERY: "W dostawie",
  DELIVERED: "Dostarczone",
  PROBLEM: "Problem",
  CANCELLED: "Anulowane",
};

const statusStyles: Record<OrderStatus, string> = {
  NEW: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  ASSIGNED: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  IN_DELIVERY: "border-orange-400/30 bg-orange-400/10 text-orange-200",
  DELIVERED: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  PROBLEM: "border-red-400/30 bg-red-400/10 text-red-200",
  CANCELLED: "border-slate-400/30 bg-slate-400/10 text-slate-200",
};

const statConfig = [
  {
    label: "Nowe",
    status: "NEW" as const,
    icon: ClipboardList,
    color: "text-amber-300",
    bg: "bg-amber-400/10",
  },
  {
    label: "Przypisane",
    status: "ASSIGNED" as const,
    icon: Route,
    color: "text-sky-300",
    bg: "bg-sky-400/10",
  },
  {
    label: "W dostawie",
    status: "IN_DELIVERY" as const,
    icon: Truck,
    color: "text-orange-300",
    bg: "bg-orange-400/10",
  },
  {
    label: "Dostarczone",
    status: "DELIVERED" as const,
    icon: CheckCircle2,
    color: "text-emerald-300",
    bg: "bg-emerald-400/10",
  },
];

const formFields = [
  { name: "orderNumber", label: "Numer zamówienia", required: true },
  { name: "customerName", label: "Klient", required: true },
  { name: "address", label: "Adres", required: true, wide: true },
  { name: "city", label: "Miasto", required: true },
  { name: "postalCode", label: "Kod pocztowy" },
  { name: "country", label: "Kraj" },
  { name: "goodsName", label: "Towar", required: true, wide: true },
  { name: "quantity", label: "Ilość", required: true, type: "number", step: "0.01" },
  { name: "unit", label: "Jednostka" },
  { name: "pallets", label: "Palety", type: "number", step: "1" },
  { name: "weightKg", label: "Waga kg", type: "number", step: "0.01" },
] as const;

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

function formatQuantity(order: Order) {
  return `${order.quantity.toLocaleString("pl-PL")} ${order.unit}`;
}

export default function DispatcherOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [form, setForm] = useState<OrderFormState>(initialFormState);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const formRef = useRef<HTMLElement | null>(null);

  const scrollToForm = useCallback(() => {
    window.requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const openForm = useCallback(() => {
    setEditingId(null);
    setForm(initialFormState);
    setShowForm(true);
    scrollToForm();
  }, [scrollToForm]);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/orders", { cache: "no-store" });
      const data = (await response.json()) as { ok: boolean; orders?: Order[]; error?: string };

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Nie udało się pobrać zamówień.");
      }

      setOrders(data.orders ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Nie udało się pobrać zamówień.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (window.location.hash === "#nowe-zamowienie") {
      openForm();
    }
  }, [openForm]);

  const stats = useMemo(
    () =>
      statConfig.map((stat) => ({
        ...stat,
        value: orders.filter((order) => order.status === stat.status).length,
      })),
    [orders],
  );

  function updateForm(field: keyof OrderFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function editOrder(order: Order) {
    setEditingId(order.id);
    setForm({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      address: order.address,
      city: order.city,
      postalCode: order.postalCode ?? "",
      country: order.country,
      goodsName: order.goodsName,
      quantity: String(order.quantity),
      unit: order.unit,
      pallets: order.pallets === null ? "" : String(order.pallets),
      weightKg: order.weightKg === null ? "" : String(order.weightKg),
      notes: order.notes ?? "",
    });
    setShowForm(true);
    scrollToForm();
  }

  async function deleteOrder(id: string) {
    const confirmed = window.confirm("Czy na pewno usunąć zamówienie? Powiązana dostawa również zostanie usunięta.");
    if (!confirmed) return;
    setDeletingId(id);
    setError(null);
    setSuccess(null);
    const response = await fetch(`/api/orders?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const data = (await response.json()) as { ok: boolean; error?: string };
    setDeletingId(null);
    if (!response.ok || !data.ok) {
      setError(data.error ?? "Nie udało się usunąć zamówienia.");
      return;
    }
    if (editingId === id) { setEditingId(null); setShowForm(false); setForm(initialFormState); }
    setSuccess("Zamówienie zostało usunięte.");
    await loadOrders();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/orders", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { ...form, id: editingId } : form),
      });
      const data = (await response.json()) as { ok: boolean; error?: string };

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Nie udało się zapisać zamówienia.");
      }

      setForm(initialFormState);
      setEditingId(null);
      setShowForm(false);
      setSuccess(editingId ? "Zamówienie zostało zaktualizowane." : "Zamówienie zostało zapisane.");
      await loadOrders();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Nie udało się zapisać zamówienia.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#020813] text-slate-100">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="flex-1 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.14),transparent_34%),linear-gradient(180deg,#061123_0%,#020813_44%,#020813_100%)]">
          <header className="flex min-h-20 flex-col gap-4 border-b border-white/10 bg-[#020813]/90 px-4 py-5 shadow-2xl shadow-black/20 backdrop-blur sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-9">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-300 lg:hidden">
                King Delivery Tracker
              </p>
              <h1 className="text-2xl font-bold text-white">Zamówienia</h1>
              <p className="mt-1 text-sm text-slate-400">
                Lista zamówień oczekujących na przypisanie do tras
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:items-center">
              <button
                type="button"
                onClick={() => void loadOrders()}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-amber-400/30 hover:bg-white/[0.07] hover:text-amber-300"
              >
                <RefreshCw className="h-4 w-4" />
                Odśwież
              </button>
              <button
                type="button"
                onClick={openForm}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-[#020813] shadow-lg shadow-amber-500/20 transition hover:bg-amber-300 sm:py-2.5"
              >
                <Plus className="h-4 w-4" />
                Dodaj zamówienie
              </button>
            </div>
          </header>

          <div className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-5 sm:px-6 lg:p-8">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {(error || success) && (
              <div
                className={`flex items-start gap-3 rounded-2xl border p-4 text-sm font-semibold ${
                  error
                    ? "border-red-400/30 bg-red-400/10 text-red-200"
                    : "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                }`}
              >
                {error ? (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                )}
                {error ?? success}
              </div>
            )}

            {showForm && (
              <article ref={formRef} id="nowe-zamowienie" className="scroll-mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/20 backdrop-blur sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {editingId ? "Edytuj zamówienie" : "Nowe zamówienie"}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Wprowadź dane wejściowe, z których później powstaną trasy.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {formFields.map((field) => (
                    <label
                      key={field.name}
                      className={`text-sm font-semibold text-slate-300 ${
                        "wide" in field && field.wide ? "md:col-span-2" : ""
                      }`}
                    >
                      {field.label}
                      {"required" in field && field.required && <span className="text-amber-300"> *</span>}
                      <input
                        type={"type" in field ? field.type : "text"}
                        step={"step" in field ? field.step : undefined}
                        min={field.name === "pallets" ? "0" : undefined}
                        required={"required" in field ? field.required : false}
                        value={form[field.name]}
                        onChange={(event) => updateForm(field.name, event.target.value)}
                        className="mt-2 w-full rounded-xl border border-white/10 bg-[#020813]/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/10"
                      />
                    </label>
                  ))}

                  <label className="text-sm font-semibold text-slate-300 md:col-span-2 xl:col-span-3">
                    Notatki
                    <textarea
                      value={form.notes}
                      onChange={(event) => updateForm("notes", event.target.value)}
                      rows={4}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#020813]/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/10"
                    />
                  </label>

                  <div className="grid gap-3 sm:col-span-2 sm:flex sm:flex-wrap xl:col-span-3">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-[#020813] shadow-lg shadow-amber-500/20 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <PackageCheck className="h-4 w-4" />
                      )}
                      {editingId ? "Zapisz zmiany" : "Zapisz zamówienie"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); setEditingId(null); setForm(initialFormState); }}
                      className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-amber-400/30 hover:bg-white/[0.07] hover:text-amber-300"
                    >
                      Anuluj
                    </button>
                  </div>
                </form>
              </article>
            )}

            <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Lista zamówień</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Zamówienia gotowe do przypisania do przyszłych tras.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-400">
                  <Clock3 className="h-4 w-4 text-amber-300" />
                  Sortowanie od najnowszych
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] text-left text-sm text-slate-300">
                  <thead className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    <tr>
                      <th className="pb-4">Numer zamówienia</th>
                      <th className="pb-4">Klient</th>
                      <th className="pb-4">Miasto</th>
                      <th className="pb-4">Adres</th>
                      <th className="pb-4">Towar</th>
                      <th className="pb-4">Ilość</th>
                      <th className="pb-4">Palety</th>
                      <th className="pb-4">Status</th>
                      <th className="pb-4 text-right">Akcje</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/10">
                    {isLoading ? (
                      <tr>
                        <td colSpan={9} className="py-10 text-center text-sm text-slate-500">
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-amber-300" />
                            Ładowanie zamówień...
                          </span>
                        </td>
                      </tr>
                    ) : orders.length > 0 ? (
                      orders.map((order) => (
                        <tr key={order.id} className="align-top">
                          <td className="py-4">
                            <p className="font-semibold text-white">{order.orderNumber}</p>
                            <span className="mt-2 inline-flex rounded-full border border-slate-500/20 bg-slate-500/10 px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                              Utworzył: {order.createdBy ? `${order.createdBy.firstName} ${order.createdBy.lastName}` : "nieznany"}
                            </span>
                          </td>
                          <td className="py-4">{order.customerName}</td>
                          <td className="py-4">{order.city}</td>
                          <td className="max-w-[240px] py-4 text-slate-400">
                            {order.address}
                            {order.postalCode ? `, ${order.postalCode}` : ""}
                          </td>
                          <td className="py-4">{order.goodsName}</td>
                          <td className="py-4 font-semibold text-white">
                            {formatQuantity(order)}
                          </td>
                          <td className="py-4">{order.pallets ?? "—"}</td>
                          <td className="py-4">
                            <StatusBadge status={order.status} />
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex flex-wrap justify-end gap-2">
                              <button type="button" onClick={() => editOrder(order)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-amber-400/30 hover:text-amber-300"><Edit3 className="h-3.5 w-3.5" />Edytuj</button>
                              <button type="button" disabled={deletingId === order.id} onClick={() => void deleteOrder(order.id)} className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs font-bold text-red-200 transition hover:border-red-300/40 hover:bg-red-400/15 disabled:opacity-60"><Trash2 className="h-3.5 w-3.5" />Usuń</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="py-14 text-center text-sm text-slate-500">
                          Brak zamówień. Dodaj pierwsze zamówienie.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
