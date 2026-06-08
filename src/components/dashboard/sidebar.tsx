import Link from "next/link";
import { BarChart3, Boxes, Car, ClipboardList, Home, Map, Settings, Truck, Users } from "lucide-react";
import { Brand } from "@/components/brand";

const items = [
  { href: "/dispatcher", label: "Pulpit", icon: Home, active: true },
  { href: "#", label: "Trasy", icon: ClipboardList },
  { href: "#", label: "Dostawy", icon: Boxes },
  { href: "#", label: "Mapa na żywo", icon: Map },
  { href: "#", label: "Kierowcy", icon: Users },
  { href: "#", label: "Pojazdy", icon: Car },
  { href: "#", label: "Raporty", icon: BarChart3 },
  { href: "#", label: "Ustawienia", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-64 flex-col bg-[#07111d] px-5 py-6 text-slate-300 shadow-2xl shadow-slate-950/40 lg:flex">
      <Brand compact />
      <nav className="mt-10 space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              href={item.href}
              key={item.label}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                item.active ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30" : "hover:bg-white/[0.07] hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex items-center gap-3 border-t border-white/10 pt-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-200 text-slate-900">
          <Truck className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Użytkownik</p>
          <p className="text-xs text-slate-500">Rola z sesji</p>
        </div>
      </div>
    </aside>
  );
}
