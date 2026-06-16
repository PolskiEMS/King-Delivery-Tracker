import Link from "next/link";
import { ArrowLeft, CircleDot, Database, ShieldCheck, UserCog, Users } from "lucide-react";
import type { DispatcherStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const statusLabels: Record<DispatcherStatus, string> = {
  AVAILABLE: "Dostępny",
  ACTIVE: "Aktywny",
  INACTIVE: "Nieaktywny",
  BUSY: "Zajęty",
  AWAY: "Poza stanowiskiem",
  OFFLINE: "Offline",
};

const statusStyles: Record<DispatcherStatus, string> = {
  AVAILABLE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  INACTIVE: "bg-slate-50 text-slate-600 ring-slate-200",
  BUSY: "bg-orange-50 text-orange-700 ring-orange-200",
  AWAY: "bg-yellow-50 text-yellow-700 ring-yellow-200",
  OFFLINE: "bg-slate-50 text-slate-600 ring-slate-200",
};

const cards = [
  {
    title: "Użytkownicy",
    description: "Konta operatorów w systemie",
    icon: Users,
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Role i uprawnienia",
    description: "admin, dyspozytor, kierowca",
    icon: ShieldCheck,
    color: "bg-violet-50 text-violet-600",
  },
  {
    title: "Konfiguracja firmy",
    description: "oddziały, pojazdy, klienci",
    icon: UserCog,
    color: "bg-amber-50 text-amber-600",
  },
  {
    title: "Baza danych",
    description: "PostgreSQL / Prisma",
    icon: Database,
    color: "bg-emerald-50 text-emerald-600",
  },
];

export default async function AdminPage() {
  const dispatchers = process.env.DATABASE_URL
    ? await prisma.user.findMany({
        where: { role: "DISPATCHER" },
        orderBy: [{ dispatcherStatus: "asc" }, { firstName: "asc" }, { lastName: "asc" }],
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          dispatcherStatus: true,
        },
      })
    : [];

  return (
    <main className="min-h-screen bg-slate-100 p-4 text-slate-900 sm:p-6 lg:p-10">
      <section className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Powrót do logowania
        </Link>

        <div className="mt-6 rounded-2xl bg-[#07111d] p-5 text-white shadow-2xl shadow-slate-300 sm:mt-8 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
            Panel administratora
          </p>
          <h1 className="mt-4 text-3xl font-black sm:text-4xl">
            Zarządzanie systemem King Delivery Tracker
          </h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            Widok startowy dla administratora z miejscem na zarządzanie
            użytkownikami, rolami, konfiguracją firmy oraz integracją bazy
            danych.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 lg:gap-5">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.title}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}
                >
                  <Icon className="h-6 w-6" />
                </span>
                <h2 className="mt-5 text-xl font-bold">{card.title}</h2>
                <p className="mt-2 text-slate-500">{card.description}</p>
              </article>
            );
          })}
        </div>

        <article className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:mt-8 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">
                Statusy dyspozytorów
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">
                Widoczność pracy dyspozytorów
              </h2>
            </div>
            <p className="text-sm font-semibold text-slate-500">
              {dispatchers.length} kont dyspozytorów
            </p>
          </div>

          <div className="mt-5 grid gap-3">
            {dispatchers.length ? (
              dispatchers.map((dispatcher) => (
                <div
                  key={dispatcher.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-bold text-slate-950">
                      {dispatcher.firstName} {dispatcher.lastName}
                    </p>
                    <p className="text-sm text-slate-500">{dispatcher.email}</p>
                  </div>
                  <span
                    className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusStyles[dispatcher.dispatcherStatus]}`}
                  >
                    <CircleDot className="h-3.5 w-3.5" />
                    {statusLabels[dispatcher.dispatcherStatus]}
                  </span>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                Brak kont dyspozytorów do wyświetlenia.
              </p>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}
