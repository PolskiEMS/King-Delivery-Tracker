"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, Clock3, Download, FileSignature, Loader2, Map as MapIcon, MapPin, Navigation, Package, Phone, Truck, User, X } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";

type StoredUser = { firstName?: string; lastName?: string; role?: string };
type DeliveryStatus = "PENDING" | "IN_PROGRESS" | "DELIVERED" | "PROBLEM" | "CANCELLED";
type DeliveryProof = { receiverName: string; signature: string; deliveredAt: string };
type Delivery = { id: string; deliveryNumber: string; sequence: number | null; status: DeliveryStatus; deliveredAt?: string | null; order: { orderNumber: string; customerName: string; address: string; city: string; postalCode?: string | null; country: string; goodsName: string; quantity: number; unit: string; phone?: string | null; notes?: string | null }; route?: { id: string; routeNumber: string; name: string; plannedDate?: string | null; driver?: { firstName: string; lastName: string; phone?: string | null } | null; vehicle?: { registration: string; brand?: string | null; model?: string | null } | null } | null };
type RouteGroup = { id: string; routeNumber: string; name: string; plannedDate?: string | null; driverName: string; vehicle: string; deliveries: Delivery[] };

const labels: Record<DeliveryStatus, string> = { PENDING: "Oczekuje", IN_PROGRESS: "W trasie", DELIVERED: "Doręczona", PROBLEM: "Problem", CANCELLED: "Anulowana" };
const styles: Record<DeliveryStatus, string> = { PENDING: "border-slate-400/30 bg-slate-400/10 text-slate-200", IN_PROGRESS: "border-amber-400/30 bg-amber-400/10 text-amber-200", DELIVERED: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200", PROBLEM: "border-red-400/30 bg-red-400/10 text-red-200", CANCELLED: "border-slate-500/30 bg-slate-500/10 text-slate-400" };
const proofKey = "kingDeliveryProofs";

function formatDate(value?: string | null) { return value ? new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Brak daty"; }
function vehicleLabel(delivery: Delivery) { const vehicle = delivery.route?.vehicle; return vehicle ? [vehicle.registration, vehicle.brand, vehicle.model].filter(Boolean).join(" · ") : "Brak pojazdu"; }
function proofStore(): Record<string, DeliveryProof> { try { return JSON.parse(window.localStorage.getItem(proofKey) ?? "{}") as Record<string, DeliveryProof>; } catch { return {}; } }

export default function DriverPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeDelivery, setActiveDelivery] = useState<Delivery | null>(null);
  const [receiverName, setReceiverName] = useState("");
  const [signature, setSignature] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [proofs, setProofs] = useState<Record<string, DeliveryProof>>({});

  const loadDeliveries = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/deliveries", { cache: "no-store" });
    const data = (await response.json()) as { deliveries?: Delivery[] };
    setDeliveries(data.deliveries ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    try { setCurrentUser(JSON.parse(window.localStorage.getItem("kingDeliveryCurrentUser") ?? "null") as StoredUser | null); } catch { window.localStorage.removeItem("kingDeliveryCurrentUser"); }
    setProofs(proofStore());
    void loadDeliveries();
  }, [loadDeliveries]);

  const visibleDeliveries = useMemo(() => {
    const driverName = [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(" ").toLowerCase();
    const matched = deliveries.filter((delivery) => `${delivery.route?.driver?.firstName ?? ""} ${delivery.route?.driver?.lastName ?? ""}`.toLowerCase().trim() === driverName && driverName);
    return (matched.length ? matched : deliveries).sort((a, b) => (a.sequence ?? 999) - (b.sequence ?? 999));
  }, [currentUser, deliveries]);

  const routes = useMemo<RouteGroup[]>(() => {
    const groups = new Map<string, RouteGroup>();
    visibleDeliveries.forEach((delivery) => {
      const id = delivery.route?.id ?? "unassigned";
      if (!groups.has(id)) groups.set(id, { id, routeNumber: delivery.route?.routeNumber ?? "Bez trasy", name: delivery.route?.name ?? "Dostawy nieprzypisane", plannedDate: delivery.route?.plannedDate, driverName: delivery.route?.driver ? `${delivery.route.driver.firstName} ${delivery.route.driver.lastName}` : "Brak kierowcy", vehicle: vehicleLabel(delivery), deliveries: [] });
      groups.get(id)!.deliveries.push(delivery);
    });
    return [...groups.values()];
  }, [visibleDeliveries]);

  const selectedRoute = routes[0];
  const deliveredCount = visibleDeliveries.filter((delivery) => delivery.status === "DELIVERED").length;
  const progress = visibleDeliveries.length ? Math.round((deliveredCount / visibleDeliveries.length) * 100) : 0;

  async function submitDelivery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeDelivery || !receiverName.trim()) { setMessage("Uzupełnij imię i nazwisko odbiorcy."); return; }
    setSaving(true); setMessage(null);
    const response = await fetch("/api/deliveries", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: activeDelivery.id, status: "DELIVERED", receiverName, signature }) });
    const data = (await response.json()) as { ok?: boolean; delivery?: Delivery; error?: string };
    setSaving(false);
    if (!response.ok || !data.delivery) { setMessage(data.error ?? "Nie udało się zapisać doręczenia."); return; }
    const proof = { receiverName, signature, deliveredAt: new Date().toISOString() };
    const nextProofs = { ...proofs, [activeDelivery.id]: proof };
    window.localStorage.setItem(proofKey, JSON.stringify(nextProofs));
    setProofs(nextProofs);
    setDeliveries((current) => current.map((item) => item.id === data.delivery!.id ? data.delivery! : item));
    setActiveDelivery(null); setReceiverName(""); setSignature(""); setMessage("Doręczenie zostało zapisane.");
  }

  function downloadRoutePdf(route: RouteGroup) {
    const rows = route.deliveries.map((delivery) => `<tr><td>${delivery.deliveryNumber}</td><td>${delivery.order.customerName}</td><td>${delivery.order.address}, ${delivery.order.city}</td><td>${labels[delivery.status]}</td><td>${formatDate(proofs[delivery.id]?.deliveredAt ?? delivery.deliveredAt)}</td><td>${proofs[delivery.id]?.receiverName ?? "—"}</td></tr>`).join("");
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>Trasówka ${route.routeNumber}</title><style>body{font-family:Arial;padding:32px;color:#111}h1{margin-bottom:4px}table{width:100%;border-collapse:collapse;margin-top:24px}th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:12px}th{background:#f3f4f6}.meta{color:#555}</style></head><body><h1>Trasówka ${route.routeNumber}</h1><p class="meta">${route.name} · ${formatDate(route.plannedDate)} · Kierowca: ${route.driverName} · Pojazd: ${route.vehicle}</p><table><thead><tr><th>Dostawa</th><th>Klient</th><th>Adres</th><th>Status</th><th>Data i czas doręczenia</th><th>Odbiorca</th></tr></thead><tbody>${rows}</tbody></table><script>window.print()</script></body></html>`);
    win.document.close();
  }

  return <main className="min-h-screen bg-[#020813] text-white"><section className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_34%),linear-gradient(180deg,#061123_0%,#020813_46%,#020813_100%)] px-3 py-4 sm:px-6 lg:px-10"><div className="mx-auto grid max-w-[1500px] gap-5 lg:grid-cols-[0.95fr_1.05fr]"><header className="rounded-[2rem] border border-white/10 bg-[#07111d]/95 p-5 shadow-2xl shadow-black/50 lg:sticky lg:top-5 lg:self-start"><div className="flex items-center justify-between gap-3"><LogoutButton label="Wyloguj" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-bold text-slate-200" /><p className="font-bold">Panel kierowcy</p><Truck className="h-5 w-5 text-slate-400" /></div><div className="mt-6 rounded-3xl bg-white/[0.04] p-5"><p className="text-sm text-slate-400">Aktywna trasa</p><h1 className="mt-1 text-2xl font-black text-white">{selectedRoute?.routeNumber ?? "Brak przypisanej trasy"}</h1><p className="mt-1 text-sm text-slate-400">{selectedRoute ? `${selectedRoute.name} · ${selectedRoute.deliveries.length} punktów dostawy` : "0 punktów dostawy"}</p><div className="mt-5 flex items-center justify-between text-sm"><span>Postęp trasy</span><span className="font-semibold">{deliveredCount} / {visibleDeliveries.length}</span></div><div className="mt-2 h-2 rounded-full bg-slate-800"><div className="h-2 rounded-full bg-emerald-500" style={{ width: `${progress}%` }} /></div></div><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2"><div className="rounded-2xl bg-white/[0.04] p-4"><Clock3 className="h-5 w-5 text-amber-300" /><p className="mt-2 text-2xl font-black">{visibleDeliveries.filter((item) => item.status !== "DELIVERED").length}</p><p className="text-xs text-slate-400">Do doręczenia</p></div><div className="rounded-2xl bg-white/[0.04] p-4"><CheckCircle2 className="h-5 w-5 text-emerald-300" /><p className="mt-2 text-2xl font-black">{deliveredCount}</p><p className="text-xs text-slate-400">Doręczone</p></div><div className="rounded-2xl bg-white/[0.04] p-4"><MapPin className="h-5 w-5 text-sky-300" /><p className="mt-2 text-2xl font-black">{routes.length}</p><p className="text-xs text-slate-400">Trasówki</p></div><div className="rounded-2xl bg-white/[0.04] p-4"><Package className="h-5 w-5 text-violet-300" /><p className="mt-2 text-2xl font-black">{visibleDeliveries.length}</p><p className="text-xs text-slate-400">Punkty</p></div></div><div className="mt-6 grid grid-cols-2 gap-3"><Button className="gap-2"><Navigation className="h-4 w-4" />Nawiguj</Button><button onClick={() => selectedRoute && downloadRoutePdf(selectedRoute)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-500 px-4 py-3 text-sm font-semibold text-blue-300"><Download className="h-4 w-4" />PDF</button></div><nav className="mt-7 grid grid-cols-3 border-t border-white/10 pt-4 text-center text-xs text-slate-400"><span className="text-blue-400"><Navigation className="mx-auto mb-1 h-5 w-5" />Trasa</span><span><MapIcon className="mx-auto mb-1 h-5 w-5" />Mapa</span><span><CheckCircle2 className="mx-auto mb-1 h-5 w-5" />Status</span></nav></header><section className="space-y-5">{message ? <p className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-100">{message}</p> : null}{loading ? <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-16 text-center text-slate-400"><Loader2 className="mx-auto h-7 w-7 animate-spin text-amber-300" /></div> : routes.length ? routes.map((route) => <article key={route.id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/30 sm:p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Trasówka</p><h2 className="mt-1 text-xl font-black text-white">{route.routeNumber} — {route.name}</h2><p className="mt-1 text-sm text-slate-400">{formatDate(route.plannedDate)} · {route.vehicle}</p></div><button onClick={() => downloadRoutePdf(route)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-slate-200"><Download className="h-4 w-4" />Pobierz PDF</button></div><div className="mt-5 space-y-3">{route.deliveries.map((delivery, index) => { const proof = proofs[delivery.id]; const expanded = expandedId === delivery.id; return <div key={delivery.id} className="rounded-2xl border border-white/10 bg-[#020813]/55 p-4"><button onClick={() => setExpandedId(expanded ? null : delivery.id)} className="flex w-full items-start gap-3 text-left"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold">{delivery.sequence ?? index + 1}</span><span className="flex-1"><span className="block font-bold text-white">{delivery.order.customerName}</span><span className="mt-1 block text-sm text-slate-400">{delivery.order.address}, {delivery.order.city}</span></span><span className={`rounded-full border px-3 py-1 text-xs font-bold ${styles[delivery.status]}`}>{labels[delivery.status]}</span><ChevronDown className={`h-5 w-5 text-slate-500 transition ${expanded ? "rotate-180" : ""}`} /></button>{expanded ? <div className="mt-4 grid gap-4 border-t border-white/10 pt-4 text-sm text-slate-300 md:grid-cols-2"><p><Package className="mb-1 h-4 w-4 text-amber-300" />Towar: <span className="font-semibold text-white">{delivery.order.goodsName} ({delivery.order.quantity} {delivery.order.unit})</span></p><p><User className="mb-1 h-4 w-4 text-amber-300" />Zamówienie: <span className="font-semibold text-white">{delivery.order.orderNumber}</span></p><p><MapPin className="mb-1 h-4 w-4 text-amber-300" />Adres: <span className="font-semibold text-white">{delivery.order.address}, {delivery.order.postalCode ?? ""} {delivery.order.city}, {delivery.order.country}</span></p><p><Phone className="mb-1 h-4 w-4 text-amber-300" />Kontakt: <span className="font-semibold text-white">{delivery.route?.driver?.phone ?? "Brak telefonu"}</span></p><p className="md:col-span-2">Doręczenie: <span className="font-semibold text-white">{proof ? `${proof.receiverName} · ${formatDate(proof.deliveredAt)}` : formatDate(delivery.deliveredAt)}</span></p><div className="flex flex-wrap gap-2 md:col-span-2"><button onClick={() => { setActiveDelivery(delivery); setReceiverName(proof?.receiverName ?? ""); setSignature(proof?.signature ?? ""); }} className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-sm font-black text-[#020813]"><FileSignature className="h-4 w-4" />Doręczenie</button><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${delivery.order.address}, ${delivery.order.city}`)}`} target="_blank" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-200"><Navigation className="h-4 w-4" />Nawiguj</a></div></div> : null}</div>; })}</div></article>) : <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-16 text-center text-slate-400">Brak punktów dostawy do wyświetlenia.</div>}</section></div>{activeDelivery ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"><form onSubmit={submitDelivery} className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#07111d] p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-xl font-black">Potwierdzenie doręczenia</h2><button type="button" onClick={() => setActiveDelivery(null)}><X className="h-5 w-5" /></button></div><p className="mt-2 text-sm text-slate-400">{activeDelivery.order.customerName} · {activeDelivery.order.address}, {activeDelivery.order.city}</p><label className="mt-5 block text-sm font-semibold text-slate-300">Imię i nazwisko odbiorcy *<input required value={receiverName} onChange={(event) => setReceiverName(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#020813]/70 px-4 py-3 text-white outline-none focus:border-amber-400/50" /></label><label className="mt-4 block text-sm font-semibold text-slate-300">Podpis odbiorcy (opcjonalnie)<textarea value={signature} onChange={(event) => setSignature(event.target.value)} placeholder="Wpisz podpis tekstowo lub notatkę z podpisu" className="mt-2 min-h-28 w-full rounded-xl border border-white/10 bg-[#020813]/70 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-amber-400/50" /></label><button disabled={saving} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-black text-[#020813] disabled:opacity-60"><CheckCircle2 className="h-4 w-4" />{saving ? "Zapisywanie..." : "Zapisz doręczenie"}</button></form></div> : null}</section></main>;
}
