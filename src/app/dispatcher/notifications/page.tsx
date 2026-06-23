"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Clock3, Filter, Loader2, PackageCheck, RefreshCw, Route, Search, Settings, Truck, Users } from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";

type StoredNotification = { id: string; title: string; description: string; category: "route" | "delivery" | "order" | "driver" | "system"; priority: "high" | "medium" | "low"; createdAt: string; read: boolean; href?: string };
type ApiRoute = { id: string; routeNumber: string; name: string; status: string; plannedDate?: string | null; driver?: { firstName: string; lastName: string } | null; deliveries?: unknown[] };
type ApiDelivery = { id: string; deliveryNumber: string; status: string; updatedAt: string; order: { customerName: string; city: string }; route?: { routeNumber: string; driver?: { firstName: string; lastName: string } | null } | null };
type ApiOrder = { id: string; orderNumber: string; customerName: string; city: string; status: string; createdAt: string };

const storageKey = "kingDeliveryNotificationsRead";
const categoryLabels = { all: "Wszystkie", route: "Trasy", delivery: "Dostawy", order: "Zamówienia", driver: "Kierowcy", system: "System" } as const;
const categoryIcons = { route: Route, delivery: Truck, order: PackageCheck, driver: Users, system: Bell } as const;
const priorityStyles = { high: "border-red-400/30 bg-red-400/10 text-red-200", medium: "border-amber-400/30 bg-amber-400/10 text-amber-200", low: "border-sky-400/30 bg-sky-400/10 text-sky-200" };

function formatDate(value: string) { return new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
function emptyText(value?: string | null) { return value && value.trim() ? value : "Nieprzypisany"; }

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<keyof typeof categoryLabels>("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const getReadIds = useCallback(() => {
    try { return new Set(JSON.parse(window.localStorage.getItem(storageKey) ?? "[]") as string[]); } catch { return new Set<string>(); }
  }, []);

  const saveReadIds = useCallback((ids: Set<string>) => window.localStorage.setItem(storageKey, JSON.stringify([...ids])), []);

  const loadNotifications = useCallback(async () => {
    setLoading(true); setMessage(null);
    try {
      const [routesResponse, deliveriesResponse, ordersResponse] = await Promise.all([fetch("/api/routes", { cache: "no-store" }), fetch("/api/deliveries", { cache: "no-store" }), fetch("/api/orders", { cache: "no-store" })]);
      const [{ routes = [] }, { deliveries = [] }, { orders = [] }] = await Promise.all([routesResponse.json() as Promise<{ routes?: ApiRoute[] }>, deliveriesResponse.json() as Promise<{ deliveries?: ApiDelivery[] }>, ordersResponse.json() as Promise<{ orders?: ApiOrder[] }>]);
      const readIds = getReadIds();
      const generated: StoredNotification[] = [
        ...routes.slice(0, 8).map((route) => ({ id: `route-${route.id}-${route.status}`, title: `Trasa ${route.routeNumber}: ${route.name}`, description: `${route.deliveries?.length ?? 0} dostaw · Kierowca: ${emptyText(route.driver ? `${route.driver.firstName} ${route.driver.lastName}` : null)} · Status: ${route.status}`, category: "route" as const, priority: route.status === "CANCELLED" ? "high" as const : "medium" as const, createdAt: route.plannedDate ?? new Date().toISOString(), read: readIds.has(`route-${route.id}-${route.status}`), href: "/dispatcher/routes" })),
        ...deliveries.slice(0, 10).map((delivery) => ({ id: `delivery-${delivery.id}-${delivery.status}`, title: `Dostawa ${delivery.deliveryNumber}: ${delivery.order.customerName}`, description: `${delivery.order.city} · Trasa: ${delivery.route?.routeNumber ?? "brak"} · Status: ${delivery.status}`, category: "delivery" as const, priority: delivery.status === "PROBLEM" ? "high" as const : delivery.status === "IN_PROGRESS" ? "medium" as const : "low" as const, createdAt: delivery.updatedAt, read: readIds.has(`delivery-${delivery.id}-${delivery.status}`), href: "/dispatcher/deliveries" })),
        ...orders.slice(0, 8).map((order) => ({ id: `order-${order.id}-${order.status}`, title: `Zamówienie ${order.orderNumber}`, description: `${order.customerName}, ${order.city} · Status: ${order.status}`, category: "order" as const, priority: order.status === "NEW" ? "medium" as const : "low" as const, createdAt: order.createdAt, read: readIds.has(`order-${order.id}-${order.status}`), href: "/dispatcher/orders" })),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotifications(generated);
    } catch { setMessage("Nie udało się pobrać powiadomień. Spróbuj odświeżyć widok."); } finally { setLoading(false); }
  }, [getReadIds]);

  useEffect(() => { void loadNotifications(); }, [loadNotifications]);

  const filtered = useMemo(() => notifications.filter((item) => (category === "all" || item.category === category) && (!showUnreadOnly || !item.read) && (`${item.title} ${item.description}`.toLowerCase().includes(query.toLowerCase()))), [category, notifications, query, showUnreadOnly]);
  const unreadCount = notifications.filter((item) => !item.read).length;
  const highCount = notifications.filter((item) => item.priority === "high").length;

  function markRead(id: string) { const ids = getReadIds(); ids.add(id); saveReadIds(ids); setNotifications((current) => current.map((item) => item.id === id ? { ...item, read: true } : item)); }
  function markAllRead() { const ids = new Set(notifications.map((item) => item.id)); saveReadIds(ids); setNotifications((current) => current.map((item) => ({ ...item, read: true }))); }

  return <main className="min-h-screen bg-[#020813] text-slate-100"><div className="flex min-h-screen"><Sidebar /><section className="flex-1 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.14),transparent_34%),linear-gradient(180deg,#061123_0%,#020813_44%,#020813_100%)]"><header className="flex min-h-20 flex-col gap-4 border-b border-white/10 bg-[#020813]/90 px-4 py-5 shadow-2xl shadow-black/20 backdrop-blur sm:px-6 md:flex-row md:items-center md:justify-between lg:px-9"><div><h1 className="text-2xl font-bold text-white">Powiadomienia</h1><p className="mt-1 text-sm text-slate-400">Centrum zdarzeń dla tras, dostaw i zamówień.</p></div><div className="flex flex-wrap gap-3"><button onClick={() => void loadNotifications()} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-slate-200"><RefreshCw className="h-4 w-4" />Odśwież</button><button onClick={markAllRead} className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-[#020813]"><CheckCheck className="h-4 w-4" />Oznacz jako przeczytane</button></div></header><div className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-5 sm:px-6 lg:p-8"><div className="grid gap-4 md:grid-cols-3"><article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"><Bell className="h-5 w-5 text-amber-300" /><p className="mt-4 text-3xl font-black text-white">{notifications.length}</p><p className="text-sm text-slate-400">Wszystkie zdarzenia</p></article><article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"><Clock3 className="h-5 w-5 text-sky-300" /><p className="mt-4 text-3xl font-black text-white">{unreadCount}</p><p className="text-sm text-slate-400">Nieprzeczytane</p></article><article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"><Filter className="h-5 w-5 text-red-300" /><p className="mt-4 text-3xl font-black text-white">{highCount}</p><p className="text-sm text-slate-400">Wysoki priorytet</p></article></div><article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"><div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]"><label className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#020813]/70 px-3 py-2 text-sm text-slate-400"><Search className="h-4 w-4" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Szukaj powiadomień..." className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500" /></label><select value={category} onChange={(event) => setCategory(event.target.value as keyof typeof categoryLabels)} className="rounded-xl border border-white/10 bg-[#020813] px-3 py-2 text-sm text-slate-200">{Object.entries(categoryLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select><button onClick={() => setShowUnreadOnly((value) => !value)} className={`rounded-xl border px-4 py-2 text-sm font-bold ${showUnreadOnly ? "border-amber-400/40 bg-amber-400/10 text-amber-200" : "border-white/10 bg-white/[0.04] text-slate-300"}`}>Tylko nieprzeczytane</button></div>{message ? <p className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{message}</p> : null}<div className="mt-5 space-y-3">{loading ? <div className="py-16 text-center text-slate-500"><Loader2 className="mx-auto h-6 w-6 animate-spin text-amber-300" /></div> : filtered.length ? filtered.map((item) => { const Icon = categoryIcons[item.category]; return <div key={item.id} className={`rounded-2xl border p-4 transition ${item.read ? "border-white/10 bg-[#020813]/60" : "border-amber-400/25 bg-amber-400/[0.07]"}`}><div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div className="flex gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-amber-300"><Icon className="h-5 w-5" /></span><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold text-white">{item.title}</h2><span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityStyles[item.priority]}`}>{item.priority === "high" ? "Pilne" : item.priority === "medium" ? "Ważne" : "Informacyjne"}</span>{!item.read ? <span className="rounded-full bg-amber-300 px-2 py-0.5 text-xs font-black text-[#020813]">Nowe</span> : null}</div><p className="mt-1 text-sm text-slate-400">{item.description}</p><p className="mt-2 text-xs text-slate-500">{formatDate(item.createdAt)}</p></div></div><div className="flex gap-2 md:justify-end">{item.href ? <Link href={item.href} className="rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-amber-400/40">Otwórz</Link> : null}<button onClick={() => markRead(item.id)} className="rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-amber-400/40" disabled={item.read}>{item.read ? "Przeczytane" : "Oznacz"}</button></div></div></div>; }) : <div className="py-16 text-center text-slate-500"><Bell className="mx-auto mb-3 h-8 w-8 text-amber-300" />Brak powiadomień dla wybranych filtrów.</div>}</div></article><Link href="/dispatcher/settings" className="inline-flex items-center gap-2 text-sm font-semibold text-amber-200 hover:text-amber-100"><Settings className="h-4 w-4" />Przejdź do ustawień powiadomień</Link></div></section></div></main>;
}
