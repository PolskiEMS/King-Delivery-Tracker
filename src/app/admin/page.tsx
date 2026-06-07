import Link from "next/link";
import { ArrowLeft, Database, ShieldCheck, UserCog, Users } from "lucide-react";

const cards = [
  { title: "Użytkownicy", description: "128 kont w systemie", icon: Users, color: "bg-blue-50 text-blue-600" },
  { title: "Role i uprawnienia", description: "admin, dyspozytor, kierowca", icon: ShieldCheck, color: "bg-violet-50 text-violet-600" },
  { title: "Konfiguracja firmy", description: "oddziały, pojazdy, klienci", icon: UserCog, color: "bg-amber-50 text-amber-600" },
  { title: "Baza danych", description: "PostgreSQL / Prisma", icon: Database, color: "bg-emerald-50 text-emerald-600" },
];

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900 lg:p-10">
      <section className="mx-auto max-w-6xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
          <ArrowLeft className="h-4 w-4" /> Powrót do logowania
        </Link>
        <div className="mt-8 rounded-2xl bg-[#07111d] p-8 text-white shadow-2xl shadow-slate-300">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">Panel administratora</p>
          <h1 className="mt-4 text-4xl font-black">Zarządzanie systemem King Delivery Tracker</h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            Widok startowy dla administratora z miejscem na zarządzanie użytkownikami, rolami, konfiguracją firmy oraz integracją bazy danych.
          </p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <h2 className="mt-5 text-xl font-bold">{card.title}</h2>
                <p className="mt-2 text-slate-500">{card.description}</p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
