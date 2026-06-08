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
    <main className="relative min-h-screen overflow-hidden bg-[#020813] text-slate-100 sm:p-6 lg:p-12">
      <section className="login-scene relative mx-auto flex min-h-screen max-w-7xl overflow-hidden border-white/10 shadow-2xl shadow-black/50 sm:min-h-[calc(100vh-3rem)] sm:rounded-[2rem] sm:border lg:min-h-[calc(100vh-6rem)]">
        <TruckBackdrop />

        <div className="relative z-10 flex w-full flex-col justify-between px-5 py-7 sm:p-10 lg:p-14">
          <Brand />

          <div className="mt-8 grid flex-1 items-center gap-7 sm:mt-12 lg:grid-cols-[1fr_34rem] lg:gap-10">

            <div className="lg:hidden">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300/80">System logistyczny</p>
              <h1 className="mt-3 text-3xl font-black leading-tight text-white">Panel dostaw zawsze pod ręką.</h1>
              <p className="mt-3 text-sm leading-6 text-slate-300">Zaloguj się lub wybierz rolę, aby przejść do mobilnego widoku pracy.</p>
            </div>

            <div className="hidden max-w-xl self-end pb-12 lg:block">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-300/80">System logistyczny</p>
              <h1 className="mt-5 text-5xl font-black leading-tight text-white drop-shadow-2xl">
                Monitoruj dostawy, trasy i pracę kierowców w jednym miejscu.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
                Panel logowania przygotowany pod role administratora, dyspozytora i kierowcy — gotowy do dalszej integracji z Auth.js oraz bazą PostgreSQL.
              </p>
            </div>

            <Card className="mx-auto w-full max-w-md rounded-[1.5rem] p-5 sm:p-9 lg:mr-10">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Zaloguj się</h2>
                <p className="mt-3 text-sm text-slate-400">Witaj ponownie! Zaloguj się do swojego konta</p>
              </div>

              <form className="mt-6 space-y-4 sm:mt-8 sm:space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-slate-200">
                    Email
                  </label>
                  <Input id="email" name="email" type="email" placeholder="Wprowadź email" autoComplete="email" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-semibold text-slate-200">
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

                <div className="flex flex-col gap-2 text-sm min-[380px]:flex-row min-[380px]:justify-between">
                  <Link href="/register" className="font-medium text-amber-300 transition hover:text-amber-200">
                    Zarejestruj konto
                  </Link>
                  <a href="#" className="font-medium text-blue-400 transition hover:text-blue-300">
                    Zapomniałeś hasła?
                  </a>
                </div>

                <Button type="submit" className="w-full">
                  Zaloguj się
                </Button>
              </form>

              <div className="my-6 flex items-center gap-3 text-xs text-slate-500 sm:my-8 sm:gap-4">
                <span className="h-px flex-1 bg-white/10" />
                <span>lub kontynuuj jako</span>
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-3">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <Link
                      key={role.name}
                      href={role.href}
                      className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-left transition hover:-translate-y-0.5 hover:border-amber-400/35 hover:bg-white/[0.07] min-[380px]:block min-[380px]:p-4 min-[380px]:text-center"
                    >
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg min-[380px]:mx-auto ${role.glow}`}>
                        <Icon className={`h-5 w-5 ${role.color}`} />
                      </span>
                      <span className="block text-sm font-semibold text-slate-200 group-hover:text-white min-[380px]:mt-3 min-[380px]:text-xs">{role.name}</span>
                    </Link>
                  );
                })}
              </div>
            </Card>
          </div>

          <p className="relative z-10 mt-7 text-center text-xs text-slate-500 sm:mt-10">
            © 2026 King Delivery Tracker. Wszelkie prawa zastrzeżone.
          </p>
        </div>
      </section>
    </main>
  );
}
