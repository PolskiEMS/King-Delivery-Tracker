"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, Loader2, MapPin, PackageCheck, TriangleAlert, Truck } from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";

type DeliveryStatus = "PENDING" | "IN_DELIVERY" | "DELIVERED" | "PROBLEM" | "CANCELLED";
type Delivery = { id: string; deliveryNumber: string; sequence: number | null; status: DeliveryStatus; order: { orderNumber: string; customerName: string; address: string; city: string; goodsName: string; quantity: number; unit: string }; route: { routeNumber: string; name: string; driver: { firstName: string; lastName: string } | null } | null };
const labels: Record<DeliveryStatus, string> = { PENDING: "Oczekuje", IN_DELIVERY: "W dostawie", DELIVERED: "Dostarczone", PROBLEM: "Problem", CANCELLED: "Anulowane" };
const styles: Record<DeliveryStatus, string> = { PENDING: "border-white/10 bg-white/[0.05] text-slate-300", IN_DELIVERY: "border-orange-400/30 bg-orange-400/10 text-orange-200", DELIVERED: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200", PROBLEM: "border-red-400/30 bg-red-400/10 text-red-200", CANCELLED: "border-slate-400/30 bg-slate-400/10 text-slate-200" };

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const loadDeliveries = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/deliveries", { cache: "no-store" });
    const data = (await response.json()) as { deliveries?: Delivery[] };
    setDeliveries(data.deliveries ?? []);
    setLoading(false);
  }, []);
  useEffect(() => { void loadDeliveries(); }, [loadDeliveries]);
  const stats = useMemo(() => [
    { label: "Oczekuje", value: deliveries.filter((item) => item.status === "PENDING").length, icon: Clock3 },
    { label: "W dostawie", value: deliveries.filter((item) => item.status === "IN_DELIVERY").length, icon: Truck },
    { label: "Dostarczone", value: deliveries.filter((item) => item.status === "DELIVERED").length, icon: CheckCircle2 },
    { label: "Problemy", value: deliveries.filter((item) => item.status === "PROBLEM").length, icon: TriangleAlert },
  ], [deliveries]);

  return <main className="min-h-screen bg-[#020813] text-slate-100"><div className="flex min-h-screen"><Sidebar /><section className="flex-1 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.14),transparent_34%),linear-gradient(180deg,#061123_0%,#020813_44%,#020813_100%)]"><header className="flex min-h-20 flex-col gap-4 border-b border-white/10 bg-[#020813]/90 px-4 py-5 shadow-2xl shadow-black/20 backdrop-blur sm:px-6 sm:flex-row sm:items-center sm:justify-between lg:px-9"><div><h1 className="text-2xl font-bold text-white">Dostawy</h1><p className="mt-1 text-sm text-slate-400">Operacyjna lista dostaw utworzonych z zamówień przypisanych do tras.</p></div><button onClick={() => void loadDeliveries()} className="rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-[#020813]">Odśwież</button></header><div className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-5 sm:px-6 lg:p-8"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{stats.map((stat) => { const Icon = stat.icon; return <article key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20"><Icon className="h-6 w-6 text-amber-300" /><p className="mt-4 text-3xl font-black text-white">{stat.value}</p><p className="text-sm text-slate-400">{stat.label}</p></article>; })}</div><article className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20"><h2 className="text-lg font-bold text-white">Lista dostaw</h2><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm text-slate-300"><thead className="text-xs uppercase tracking-[0.18em] text-slate-500"><tr><th className="pb-4">Dostawa</th><th className="pb-4">Trasa</th><th className="pb-4">Klient</th><th className="pb-4">Adres</th><th className="pb-4">Towar</th><th className="pb-4">Kierowca</th><th className="pb-4">Status</th></tr></thead><tbody className="divide-y divide-white/10">{loading ? <tr><td colSpan={7} className="py-10 text-center text-slate-500"><Loader2 className="mx-auto h-5 w-5 animate-spin text-amber-300" /></td></tr> : deliveries.length ? deliveries.map((delivery) => <tr key={delivery.id}><td className="py-4 font-semibold text-white">{delivery.deliveryNumber}</td><td className="py-4">{delivery.route?.routeNumber ?? "—"}</td><td className="py-4">{delivery.order.customerName}</td><td className="py-4 text-slate-400"><span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-amber-300" />{delivery.order.address}, {delivery.order.city}</span></td><td className="py-4">{delivery.order.goodsName} ({delivery.order.quantity} {delivery.order.unit})</td><td className="py-4">{delivery.route?.driver ? `${delivery.route.driver.firstName} ${delivery.route.driver.lastName}` : "Nieprzypisany"}</td><td className="py-4"><span className={`rounded-full border px-3 py-1 text-xs font-semibold ${styles[delivery.status]}`}>{labels[delivery.status]}</span></td></tr>) : <tr><td colSpan={7} className="py-14 text-center text-slate-500"><PackageCheck className="mx-auto mb-3 h-8 w-8 text-amber-300" />Brak dostaw. Utwórz trasę z zamówieniami, aby wygenerować dostawy.</td></tr>}</tbody></table></div></article></div></section></div></main>;
}
