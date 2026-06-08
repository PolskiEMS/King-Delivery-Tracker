import Link from "next/link";
import { ArrowLeft, Building2, Mail, UserPlus } from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#020813] text-slate-100 sm:p-6 lg:p-8">
      <section className="login-scene mx-auto flex min-h-screen max-w-5xl flex-col border-white/10 px-5 py-7 shadow-2xl shadow-black/50 sm:min-h-[calc(100vh-3rem)] sm:rounded-[2rem] sm:border sm:p-10">
        <div className="flex items-center justify-between gap-4">
          <Brand compact />
          <Link href="/" className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white sm:px-4 sm:text-sm">
            <ArrowLeft className="h-4 w-4" /> Powrót
          </Link>
        </div>

        <div className="grid flex-1 items-center gap-7 py-8 sm:gap-10 sm:py-12 lg:grid-cols-[0.85fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300/80 sm:text-sm sm:tracking-[0.35em]">Rejestracja</p>
            <h1 className="mt-4 text-3xl font-black leading-tight text-white sm:mt-5 sm:text-5xl">Utwórz konto w King Delivery Tracker.</h1>
            <p className="mt-4 text-sm leading-6 text-slate-300 sm:mt-5 sm:text-base sm:leading-7">
              Formularz jest przygotowany pod późniejsze podpięcie Auth.js, walidacji Zod oraz nadawania ról przez administratora.
            </p>
          </div>

          <Card className="rounded-[1.5rem] p-5 sm:p-9">
            <div className="mb-6 flex items-center gap-3 sm:mb-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
                <UserPlus className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-white sm:text-2xl">Zarejestruj się</h2>
                <p className="text-sm text-slate-400">Załóż konto użytkownika systemu</p>
              </div>
            </div>

            <form className="grid gap-4 sm:grid-cols-2 sm:gap-5">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-semibold text-slate-200">Imię</label>
                <Input id="firstName" name="firstName" placeholder="Jan" autoComplete="given-name" />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-semibold text-slate-200">Nazwisko</label>
                <Input id="lastName" name="lastName" placeholder="Kowalski" autoComplete="family-name" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="company" className="text-sm font-semibold text-slate-200">Firma</label>
                <div className="relative">
                  <Input id="company" name="company" placeholder="King Logistics Sp. z o.o." className="pl-11" />
                  <Building2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="email" className="text-sm font-semibold text-slate-200">Email</label>
                <div className="relative">
                  <Input id="email" name="email" type="email" placeholder="jan@firma.pl" autoComplete="email" className="pl-11" />
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-semibold text-slate-200">Hasło</label>
                <Input id="password" name="password" type="password" placeholder="Minimum 8 znaków" autoComplete="new-password" />
              </div>
              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-semibold text-slate-200">Rola</label>
                <select id="role" name="role" className="flex h-12 w-full rounded-lg border border-slate-700/90 bg-slate-950/25 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/20">
                  <option>dyspozytor</option>
                  <option>kierowca</option>
                  <option>admin</option>
                </select>
              </div>
              <Button type="submit" className="sm:col-span-2">Utwórz konto</Button>
            </form>
          </Card>
        </div>
      </section>
    </main>
  );
}
