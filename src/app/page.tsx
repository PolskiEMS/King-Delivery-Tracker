import Link from "next/link";
import { Eye, Headphones, ShieldCheck, Truck } from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const roles = [
  {
    name: "Dyspozytor",
    href: "/dispatcher",
    icon: Headphones,
    color: "text-sky-400",
    glow: "bg-sky-400/10",
  },
  {
    name: "Kierowca",
    href: "/driver",
    icon: Truck,
    color: "text-emerald-400",
    glow: "bg-emerald-400/10",
  },
  {
    name: "Administrator",
    href: "/admin",
    icon: ShieldCheck,
    color: "text-violet-400",
    glow: "bg-violet-400/10",
  },
];

function TruckBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

      <div className="absolute bottom-20 left-10 hidden h-44 w-[34rem] max-w-[48vw] opacity-55 lg:block">
        <div className="absolute bottom-10 left-0 h-20 w-48 rounded-t-[2rem] bg-slate-950/95 shadow-2xl shadow-black" />
        <div className="absolute bottom-10 left-44 h-28 w-80 rounded-r-xl bg-gradient-to-r from-slate-900 to-slate-950 shadow-2xl shadow-black" />
        <div className="absolute bottom-20 left-16 h-12 w-20 rounded-t-xl bg-slate-700/70" />
        <div className="absolute bottom-6 left-12 h-14 w-14 rounded-full border-[10px] border-slate-700 bg-slate-950" />
        <div className="absolute bottom-6 left-72 h-14 w-14 rounded-full border-[10px] border-slate-700 bg-slate-950" />
        <div className="absolute bottom-32 left-3 h-3 w-28 rounded-full bg-amber-200/70 blur-sm" />
      </div>

      <div className="road-line absolute -bottom-16 left-24 hidden h-64 w-3 rounded-full bg-white/55 blur-[1px] lg:block" />
      <div className="road-line absolute -bottom-6 left-72 hidden h-52 w-2 rounded-full bg-white/30 blur-[1px] lg:block" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020813] p-4 text-slate-100 sm:p-8 lg:p-12">
      <section className="login-scene relative mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl shadow-black/50 sm:min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-6rem)]">
        <TruckBackdrop />

        <div className="relative z-10 flex w-full flex-col justify-between p-6 sm:p-10 lg:p-14">
          <Brand />

          
          <div className="mt-6 grid flex-1 items-center gap-10 lg:grid-cols-[1fr_34rem]">
          <div className="hidden max-w-xl self-center -translate-y-10 lg:block">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-300/80">
              System logistyczny
            </p>
          
            <h1 className="mt-5 text-5xl font-black leading-tight text-white drop-shadow-2xl">
              Monitoruj dostawy, trasy i pracę kierowców w jednym miejscu.
            </h1>
          
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
              Wybierz swoją rolę i zaloguj się, aby rozpocząć zarządzanie dostawami i
              trasami w systemie King Delivery Tracker.
            </p>
          </div>

            <Card className="mx-auto w-full max-w-md p-7 sm:p-9 lg:mr-10">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">
                  Zaloguj się
                </h2>
                <p className="mt-3 text-sm text-slate-400">
                  Witaj ponownie! Zaloguj się do swojego konta
                </p>
              </div>

              <form className="mt-8 space-y-5">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-semibold text-slate-200"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Wprowadź email"
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-slate-200"
                  >
                    Hasło
                  </label>

                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Wprowadź hasło"
                      autoComplete="current-password"
                      className="pr-12"
                    />
                    <Eye className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  </div>
                </div>

                <div className="flex justify-between gap-4 text-sm">
                  <Link
                    href="/register"
                    className="font-medium text-amber-300 transition hover:text-amber-200"
                  >
                    Zarejestruj konto
                  </Link>

                  <a
                    href="#"
                    className="font-medium text-blue-400 transition hover:text-blue-300"
                  >
                    Zapomniałeś hasła?
                  </a>
                </div>

                <Button type="submit" className="w-full">
                  Zaloguj się
                </Button>
              </form>

              <div className="my-8 flex items-center gap-4 text-xs text-slate-500">
                <span className="h-px flex-1 bg-white/10" />
                <span>lub kontynuuj jako</span>
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                {roles.map((role) => {
                  const Icon = role.icon;

                  return (
                    <Link
                      key={role.name}
                      href={role.href}
                      className="group rounded-xl border border-white/10 bg-white/[0.04] p-4 text-center transition hover:-translate-y-0.5 hover:border-amber-400/35 hover:bg-white/[0.07]"
                    >
                      <span
                        className={`mx-auto flex h-10 w-10 items-center justify-center rounded-lg ${role.glow}`}
                      >
                        <Icon className={`h-5 w-5 ${role.color}`} />
                      </span>

                      <span className="mt-3 block text-xs font-semibold text-slate-200 group-hover:text-white">
                        {role.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </Card>
          </div>

          <p className="relative z-10 mt-10 text-center text-xs text-slate-500">
            © 2026 King Delivery Tracker. Wszelkie prawa zastrzeżone.
          </p>
        </div>
      </section>
    </main>
  );
}
