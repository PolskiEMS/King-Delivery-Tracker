"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Mail, UserPlus } from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    const firstName = String(formData.get("firstName") || "");
    const lastName = String(formData.get("lastName") || "");
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    const role = String(formData.get("role") || "");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.message || "Nie udało się utworzyć konta.");
        return;
      }

      setMessage("Konto zostało utworzone. Możesz się teraz zalogować.");

      setTimeout(() => {
        router.push("/");
      }, 1200);
    } catch {
      setError("Nie udało się połączyć z serwerem.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#020813] p-4 text-slate-100 sm:p-8">
      <section className="login-scene mx-auto flex min-h-[calc(100vh-2rem)] max-w-5xl flex-col rounded-[2rem] border border-white/10 p-6 shadow-2xl shadow-black/50 sm:min-h-[calc(100vh-4rem)] sm:p-10">
        <div className="flex items-center justify-between gap-4">
          <Brand compact />

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Powrót
          </Link>
        </div>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[0.85fr_1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-300/80">
              Rejestracja
            </p>

            <h1 className="mt-5 text-4xl font-black leading-tight text-white sm:text-5xl">
              Utwórz konto w King Delivery Tracker.
            </h1>

            <p className="mt-5 text-base leading-7 text-slate-300">
              Formularz pozwala utworzyć konto kierowcy lub dyspozytora.
              Dane zostaną zapisane w bazie systemu i przypisane do odpowiedniej roli.
            </p>
          </div>

          <Card className="p-7 sm:p-9">
            <div className="mb-8 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
                <UserPlus className="h-6 w-6" />
              </span>

              <div>
                <h2 className="text-2xl font-bold text-white">
                  Zarejestruj się
                </h2>
                <p className="text-sm text-slate-400">
                  Załóż konto użytkownika systemu
                </p>
              </div>
            </div>

            <form onSubmit={handleRegister} className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-semibold text-slate-200">
                  Imię
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="Imię"
                  autoComplete="given-name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-semibold text-slate-200">
                  Nazwisko
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Nazwisko"
                  autoComplete="family-name"
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="email" className="text-sm font-semibold text-slate-200">
                  Email
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@firma.pl"
                    autoComplete="email"
                    className="pl-11"
                    required
                  />
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-semibold text-slate-200">
                  Hasło
                </label>

                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 8 znaków"
                    autoComplete="new-password"
                    className="pr-12"
                    minLength={8}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300"
                    aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-semibold text-slate-200">
                  Rola
                </label>
                <select
                  id="role"
                  name="role"
                  defaultValue="DRIVER"
                  className="flex h-12 w-full rounded-lg border border-slate-700/90 bg-slate-950/25 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/20"
                  required
                >
                  <option value="DRIVER">Kierowca</option>
                  <option value="DISPATCHER">Dyspozytor</option>
                </select>
              </div>

              {error && (
                <p className="sm:col-span-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200">
                  {error}
                </p>
              )}

              {message && (
                <p className="sm:col-span-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-200">
                  {message}
                </p>
              )}

              <Button type="submit" className="sm:col-span-2" disabled={loading}>
                {loading ? "Tworzenie konta..." : "Utwórz konto"}
              </Button>
            </form>
          </Card>
        </div>
      </section>
    </main>
  );
}