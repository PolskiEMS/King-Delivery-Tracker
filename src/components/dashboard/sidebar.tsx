import Link from "next/link";
import {
  BarChart3,
  Building2,
  FileText,
  LayoutDashboard,
  Map,
  Settings,
  Truck,
  Users,
} from "lucide-react";

const menu = [
  { label: "Pulpit", href: "/dispatcher", icon: LayoutDashboard },
  { label: "Trasy", href: "#", icon: Map },
  { label: "Kierowcy", href: "#", icon: Users },
  { label: "Pojazdy", href: "#", icon: Truck },
  { label: "Klienci", href: "#", icon: Building2 },
  { label: "Raporty", href: "#", icon: BarChart3 },
  { label: "Dokumenty", href: "#", icon: FileText },
  { label: "Ustawienia", href: "#", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden w-72 border-r border-slate-200 bg-white p-6 lg:block">
      <div>
        <p className="text-xl font-black text-slate-900">
          King Delivery Tracker
        </p>
        <p className="mt-1 text-xs font-medium text-slate-500">
          Panel dyspozytora
        </p>
      </div>

      <nav className="mt-10 space-y-2">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}