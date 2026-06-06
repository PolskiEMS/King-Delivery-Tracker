import { Crown, Eye, Headphones, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const roles = [
  {
    name: "Dyspozytor",
    icon: Headphones,
    color: "text-sky-400",
    glow: "bg-sky-400/10",
  },
  {
    name: "Kierowca",
    icon: Truck,
    color: "text-emerald-400",
    glow: "bg-emerald-400/10",
  },
  {
    name: "Administrator",
    icon: ShieldCheck,
    color: "text-violet-400",
    glow: "bg-violet-400/10",
  },
];

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <Crown className="h-12 w-12 text-amber-400" strokeWidth={1.7} />
      <div className="leading-none">
        <p className="text-4xl font-black tracking-[0.08em] text-white">KING</p>
        <p className="mt-1 text-sm font-bold tracking-[0.18em] text-white/90">DELIVERY TRACKER</p>
      </div>
    </div>
  );
}

function TruckIllustration() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="absolute bottom-20 left-8 h-32 w-[28rem] max-w-[82vw] opacity-80 truck-body bg-gradient-to-r from-slate-950 via-slate-800 to-slate-950 shadow-2xl shadow-black" />
      <div className="absolute bottom-20 left-16 h-10 w-28 rounded-t-xl bg-slate-700/60 blur-[1px]" />
      <div className="absolute bottom-18 left-16 h-8 w-8 rounded-full border-4 border-slate-500 bg-slate-950 shadow-lg" />
      <div className="absolute bottom-18 left-80 h-8 w-8 rounded-full border-4 border-slate-500 bg-slate-950 shadow-lg" />
      <div className="absolute bottom-32 left-72 h-2 w-24 rounded-full bg-amber-200 blur-sm" />
      <div className="road-line absolute -bottom-12 left-16 h-48 w-3 rounded-full bg-white/70 blur-[1px]" />
      <div className="road-line absolute -bottom-6 left-52 h-44 w-2 rounded-full bg-white/35 blur-[1px]" />
      <div className="absolute bottom-0 right-0 h-72 w-2/3 bg-gradient-to-tl from-slate-950/70 via-transparent to-transparent" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020813] p-4 text-slate-100 sm:p-8 lg:p-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.18),transparent_28%),radial-gradient(circle_at_20%_20%,rgba(245,158,11,0.16),transparent_24%)]" />
      <section className="truck-scene relative mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl shadow-black/50 sm:min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-6rem)]">
        <TruckIllustration />

        <div className="relative z-10 flex w-full flex-col justify-between p-6 sm:p-10 lg:p-14">
          <Brand />

          <div className="mt-12 grid flex-1 items-center gap-10 lg:grid-cols-[1fr_34rem]">
            <div className="hidden max-w-xl self-end pb-12 lg:block">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-300/80">System logistyczny</p>
              <h1 className="mt-5 text-5xl font-black leading-tight text-white drop-shadow-2xl">
                Monitoruj dostawy, trasy i pracę kierowców w jednym miejscu.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
                Panel logowania przygotowany pod role administratora, dyspozytora i kierowcy — gotowy do dalszej integracji z Auth.js oraz bazą PostgreSQL.
              </p>
            </div>

            <Card className="mx-auto w-full max-w-md p-7 sm:p-9 lg:mr-10">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Zaloguj się</h2>
                <p className="mt-3 text-sm text-slate-400">Witaj ponownie! Zaloguj się do swojego konta</p>
              </div>

              <form className="mt-8 space-y-5">
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

                <div className="flex justify-end">
                  <a href="#" className="text-sm font-medium text-blue-400 transition hover:text-blue-300">
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
                    <button
                      key={role.name}
                      type="button"
                      className="group rounded-xl border border-white/10 bg-white/[0.04] p-4 text-center transition hover:-translate-y-0.5 hover:border-amber-400/35 hover:bg-white/[0.07]"
                    >
                      <span className={`mx-auto flex h-10 w-10 items-center justify-center rounded-lg ${role.glow}`}>
                        <Icon className={`h-5 w-5 ${role.color}`} />
                      </span>
                      <span className="mt-3 block text-xs font-semibold text-slate-200 group-hover:text-white">{role.name}</span>
                    </button>
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
