import Link from "next/link";
import {
  Bell,
  LogIn,
  LayoutDashboard,
  PackageCheck,
  Route,
  Settings,
  Truck,
  Users,
} from "lucide-react";

const menu = [
  { label: "Pulpit", href: "/dispatcher", icon: LayoutDashboard },
  { label: "Zamówienia", href: "/dispatcher/orders", icon: PackageCheck },
  { label: "Trasy", href: "/dispatcher/routes", icon: Route },
  { label: "Kierowcy", href: "/dispatcher/drivers", icon: Users },
  { label: "Dostawy", href: "/dispatcher/deliveries", icon: Truck },
  { label: "Powiadomienia", href: "/dispatcher/notifications", icon: Bell },
  { label: "Ustawienia", href: "/dispatcher/settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden w-72 border-r border-white/10 bg-[#020813] p-6 text-slate-100 shadow-2xl shadow-black/30 lg:block">
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/20">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400 text-[#020813] shadow-lg shadow-amber-500/20">
          <Truck className="h-5 w-5" />
        </div>
        <p className="mt-5 text-xl font-black tracking-tight text-white">
          King Delivery Tracker
        </p>
        <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-amber-300">
            Panel
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-100">
            Dyspozytor
          </p>
        </div>
      </div>

      <nav className="mt-8 space-y-2">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className="group flex items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-sm font-semibold text-slate-400 transition hover:border-white/10 hover:bg-white/[0.06] hover:text-white"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition group-hover:border-amber-400/40 group-hover:bg-amber-400/10 group-hover:text-amber-300">
                <Icon className="h-5 w-5" />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/"
        className="mt-8 flex items-center gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm font-bold text-amber-200 transition hover:border-amber-300/40 hover:bg-amber-400/15 hover:text-amber-100"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/20 bg-[#020813]/60 text-amber-300">
          <LogIn className="h-5 w-5" />
        </span>
        Powrót do logowania
      </Link>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Status systemu
        </p>
        <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-300">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.8)]" />
          Gotowy do pracy
        </div>
      </div>
    </aside>
  );
}
