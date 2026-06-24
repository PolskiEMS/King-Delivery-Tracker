"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import {
  BarChart3,
  CircleDot,
  Database,
  ShieldCheck,
  Pencil,
  Save,
  Trash2,
  Truck,
  Eye,
  EyeOff,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react";

type UserRole = "ADMIN" | "DISPATCHER" | "DRIVER";
type DispatcherStatus = "AVAILABLE" | "ACTIVE" | "INACTIVE" | "BUSY" | "AWAY" | "OFFLINE";

type AdminUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  dispatcherStatus: DispatcherStatus;
  createdAt: string;
  password: string;
};

type UserForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
};

const emptyForm: UserForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  role: "DISPATCHER",
};

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Administrator",
  DISPATCHER: "Dyspozytor",
  DRIVER: "Kierowca",
};

const roleStyles: Record<UserRole, string> = {
  ADMIN: "border-violet-400/30 bg-violet-400/10 text-violet-200",
  DISPATCHER: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  DRIVER: "border-sky-400/30 bg-sky-400/10 text-sky-200",
};

const statusLabels: Record<DispatcherStatus, string> = {
  AVAILABLE: "Dostępny",
  ACTIVE: "Aktywny",
  INACTIVE: "Nieaktywny",
  BUSY: "Zajęty",
  AWAY: "Poza stanowiskiem",
  OFFLINE: "Offline",
};

const statusStyles: Record<DispatcherStatus, string> = {
  AVAILABLE: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  ACTIVE: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  INACTIVE: "border-slate-400/30 bg-slate-400/10 text-slate-300",
  BUSY: "border-orange-400/30 bg-orange-400/10 text-orange-200",
  AWAY: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  OFFLINE: "border-slate-400/30 bg-slate-400/10 text-slate-300",
};

const controlCards = [
  {
    title: "Użytkownicy",
    description: "Dodawanie, usuwanie i kontrola kont w systemie.",
    icon: Users,
    accent: "text-amber-300",
    bg: "bg-amber-400/10",
  },
  {
    title: "Role i uprawnienia",
    description: "Administrator, dyspozytor i kierowca w jednym widoku.",
    icon: ShieldCheck,
    accent: "text-violet-300",
    bg: "bg-violet-400/10",
  },
  {
    title: "Operacje",
    description: "Skróty do dyspozytorni, tras, kierowców i dostaw.",
    icon: UserCog,
    accent: "text-sky-300",
    bg: "bg-sky-400/10",
  },
  {
    title: "Baza danych",
    description: "Centralna kontrola rekordów PostgreSQL / Prisma.",
    icon: Database,
    accent: "text-emerald-300",
    bg: "bg-emerald-400/10",
  },
];

const managementLinks = [
  { label: "Dyspozytornia", href: "/dispatcher", icon: BarChart3 },
  { label: "Zamówienia", href: "/dispatcher/orders", icon: Database },
  { label: "Trasy", href: "/dispatcher/routes", icon: Truck },
  { label: "Kierowcy", href: "/dispatcher/drivers", icon: Users },
];

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<UserForm>(emptyForm);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [visiblePasswordIds, setVisiblePasswordIds] = useState<Set<string>>(new Set());

  const stats = useMemo(() => {
    const byRole = users.reduce<Record<UserRole, number>>(
      (acc, user) => ({ ...acc, [user.role]: acc[user.role] + 1 }),
      { ADMIN: 0, DISPATCHER: 0, DRIVER: 0 },
    );

    return [
      { label: "Wszyscy użytkownicy", value: users.length, hint: "pełna kontrola kont" },
      { label: "Administratorzy", value: byRole.ADMIN, hint: "dostęp do centrum" },
      { label: "Dyspozytorzy", value: byRole.DISPATCHER, hint: "operacje i trasy" },
      { label: "Kierowcy", value: byRole.DRIVER, hint: "realizacja dostaw" },
    ];
  }, [users]);


  const roleChart = useMemo(() => {
    const counts = users.reduce<Record<UserRole, number>>((acc, user) => ({ ...acc, [user.role]: acc[user.role] + 1 }), { ADMIN: 0, DISPATCHER: 0, DRIVER: 0 });
    const max = Math.max(...Object.values(counts), 1);
    return (Object.entries(counts) as [UserRole, number][]).map(([role, value]) => ({ label: roleLabels[role], value, width: `${Math.max(8, (value / max) * 100)}%`, style: roleStyles[role] }));
  }, [users]);

  const dispatcherStatusChart = useMemo(() => {
    const dispatchers = users.filter((user) => user.role === "DISPATCHER");
    const counts = dispatchers.reduce<Record<DispatcherStatus, number>>((acc, user) => ({ ...acc, [user.dispatcherStatus]: acc[user.dispatcherStatus] + 1 }), { AVAILABLE: 0, ACTIVE: 0, INACTIVE: 0, BUSY: 0, AWAY: 0, OFFLINE: 0 });
    const max = Math.max(...Object.values(counts), 1);
    return (Object.entries(counts) as [DispatcherStatus, number][]).filter(([, value]) => value > 0).map(([status, value]) => ({ label: statusLabels[status], value, width: `${Math.max(8, (value / max) * 100)}%`, style: statusStyles[status] }));
  }, [users]);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    const response = await fetch("/api/admin/users", { cache: "no-store" });
    const data = (await response.json()) as { users?: AdminUser[]; message?: string };
    setUsers(data.users ?? []);
    setMessage(response.ok ? null : data.message ?? "Nie udało się pobrać użytkowników.");
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as { user?: AdminUser; message?: string };

      if (!response.ok || !data.user) {
        setMessage(data.message ?? "Nie udało się dodać użytkownika.");
        return;
      }

      setUsers((current) => [data.user!, ...current]);
      setForm(emptyForm);
      setMessage("Użytkownik został dodany do centrum zarządzania.");
    } catch {
      setMessage("Nie udało się połączyć z API dodawania użytkowników.");
    } finally {
      setIsSaving(false);
    }
  }

  function startEditing(user: AdminUser) {
    setEditingId(user.id);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: "",
      role: user.role,
    });
    setVisiblePasswordIds((current) => {
      const next = new Set(current);
      next.delete(user.id);
      return next;
    });
    setMessage(null);
  }

  function togglePasswordVisibility(id: string) {
    setVisiblePasswordIds((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  async function updateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingId) return;

    setUpdatingId(editingId);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...editForm }),
      });
      const data = (await response.json()) as { user?: AdminUser; message?: string };

      if (!response.ok || !data.user) {
        setMessage(data.message ?? "Nie udało się zapisać zmian użytkownika.");
        return;
      }

      setUsers((current) => current.map((user) => (user.id === data.user!.id ? data.user! : user)));
      setEditingId(null);
      setEditForm(emptyForm);
      setVisiblePasswordIds((current) => {
        const next = new Set(current);
        next.delete(data.user!.id);
        return next;
      });
      setMessage("Dane użytkownika i rola zostały zaktualizowane.");
    } catch {
      setMessage("Nie udało się połączyć z API edycji użytkowników.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteUser(id: string) {
    const user = users.find((item) => item.id === id);
    const confirmed = window.confirm(`Czy na pewno usunąć użytkownika ${user?.firstName ?? ""} ${user?.lastName ?? ""}?`);

    if (!confirmed) return;

    setDeletingId(id);
    setMessage(null);
    const response = await fetch(`/api/admin/users?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const data = (await response.json()) as { message?: string };
    setDeletingId(null);

    if (!response.ok) {
      setMessage(data.message ?? "Nie udało się usunąć użytkownika.");
      return;
    }

    setUsers((current) => current.filter((item) => item.id !== id));
    setMessage("Użytkownik został usunięty.");
  }

  return (
    <main className="min-h-screen bg-[#020813] text-slate-100">
      <section className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.16),transparent_32%),linear-gradient(180deg,#061123_0%,#020813_46%,#020813_100%)] px-4 py-5 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1600px] space-y-6">
          <header className="rounded-3xl border border-white/10 bg-[#020813]/90 p-5 shadow-2xl shadow-black/30 backdrop-blur sm:p-7">
            <LogoutButton label="Wyloguj z konta" />

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">
                  Panel administratora
                </p>
                <h1 className="mt-4 max-w-4xl text-3xl font-black text-white sm:text-5xl">
                  Centrum zarządzania King Delivery Tracker
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
                  Panel admina korzysta z tej samej ciemnej kolorystyki co panel dyspozytora i skupia w jednym miejscu kontrolę użytkowników, ról, statusów oraz najważniejszych obszarów operacyjnych.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:w-[420px]">
                {managementLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.label} href={item.href} className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-slate-300 transition hover:border-amber-400/40 hover:bg-amber-400/10 hover:text-amber-200">
                      <Icon className="h-4 w-4 text-amber-300" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </header>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <article key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 backdrop-blur">
                <p className="text-3xl font-black text-white">{stat.value}</p>
                <p className="mt-2 text-sm font-semibold text-slate-300">{stat.label}</p>
                <p className="mt-1 text-xs text-slate-500">{stat.hint}</p>
              </article>
            ))}
          </div>


          <div className="grid gap-6 xl:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 backdrop-blur sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Wykres ról</p>
              <h2 className="mt-2 text-xl font-black text-white">Struktura kont w systemie</h2>
              <div className="mt-6 space-y-4">
                {roleChart.map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between text-sm"><span className="font-semibold text-slate-300">{item.label}</span><span className="font-black text-white">{item.value}</span></div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-amber-400" style={{ width: item.width }} /></div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 backdrop-blur sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Wykres statusów</p>
              <h2 className="mt-2 text-xl font-black text-white">Dostępność dyspozytorów</h2>
              <div className="mt-6 space-y-4">
                {dispatcherStatusChart.length ? dispatcherStatusChart.map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between text-sm"><span className="font-semibold text-slate-300">{item.label}</span><span className="font-black text-white">{item.value}</span></div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-emerald-400" style={{ width: item.width }} /></div>
                  </div>
                )) : <p className="rounded-2xl border border-white/10 bg-[#020813]/60 p-5 text-sm text-slate-400">Brak dyspozytorów do pokazania na wykresie.</p>}
              </div>
            </article>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 backdrop-blur sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Dodawanie użytkowników</p>
              <h2 className="mt-2 text-xl font-black text-white">Utwórz konto w systemie</h2>
              <p className="mt-2 text-sm text-slate-400">Administrator może zakładać konta dla administratorów, dyspozytorów i kierowców.</p>

              <form onSubmit={createUser} className="mt-6 grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <input required value={form.firstName} onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))} placeholder="Imię" className="rounded-xl border border-white/10 bg-[#020813]/70 px-4 py-3 text-sm font-semibold text-white outline-none placeholder:text-slate-600 focus:border-amber-400/50" />
                  <input required value={form.lastName} onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))} placeholder="Nazwisko" className="rounded-xl border border-white/10 bg-[#020813]/70 px-4 py-3 text-sm font-semibold text-white outline-none placeholder:text-slate-600 focus:border-amber-400/50" />
                </div>
                <input required type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="email@firma.com" className="rounded-xl border border-white/10 bg-[#020813]/70 px-4 py-3 text-sm font-semibold text-white outline-none placeholder:text-slate-600 focus:border-amber-400/50" />
                <input required type="password" minLength={8} value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} placeholder="Hasło min. 8 znaków" className="rounded-xl border border-white/10 bg-[#020813]/70 px-4 py-3 text-sm font-semibold text-white outline-none placeholder:text-slate-600 focus:border-amber-400/50" />
                <select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as UserRole }))} className="rounded-xl border border-white/10 bg-[#020813]/70 px-4 py-3 text-sm font-semibold text-white outline-none focus:border-amber-400/50">
                  {Object.entries(roleLabels).map(([role, label]) => <option key={role} value={role}>{label}</option>)}
                </select>
                <button disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-amber-400/10 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60">
                  <UserPlus className="h-4 w-4" />
                  {isSaving ? "Dodawanie..." : "Dodaj użytkownika"}
                </button>
              </form>
            </article>

            <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 backdrop-blur sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Kontrola systemu</p>
                  <h2 className="mt-2 text-xl font-black text-white">Użytkownicy i uprawnienia</h2>
                </div>
                <p className="text-sm font-semibold text-slate-500">{isLoading ? "Ładowanie..." : `${users.length} kont`}</p>
              </div>

              {message && <p className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-100">{message}</p>}

              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm text-slate-300">
                  <thead className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    <tr>
                      <th className="pb-4">Użytkownik</th>
                      <th className="pb-4">Rola</th>
                      <th className="pb-4">Status</th>
                      <th className="pb-4">Utworzono</th>
                      <th className="pb-4 text-right">Akcje</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {users.length ? users.map((user) => (
                      <tr key={user.id}>
                        <td className="py-4">
                          {editingId === user.id ? (
                            <form id={`edit-user-${user.id}`} onSubmit={updateUser} className="grid gap-2 sm:grid-cols-2">
                              <input required value={editForm.firstName} onChange={(event) => setEditForm((current) => ({ ...current, firstName: event.target.value }))} placeholder="Imię" className="rounded-lg border border-white/10 bg-[#020813]/70 px-3 py-2 text-xs font-semibold text-white outline-none focus:border-amber-400/50" />
                              <input required value={editForm.lastName} onChange={(event) => setEditForm((current) => ({ ...current, lastName: event.target.value }))} placeholder="Nazwisko" className="rounded-lg border border-white/10 bg-[#020813]/70 px-3 py-2 text-xs font-semibold text-white outline-none focus:border-amber-400/50" />
                              <input required type="email" value={editForm.email} onChange={(event) => setEditForm((current) => ({ ...current, email: event.target.value }))} placeholder="email@firma.com" className="rounded-lg border border-white/10 bg-[#020813]/70 px-3 py-2 text-xs font-semibold text-white outline-none focus:border-amber-400/50 sm:col-span-2" />
                              <input type="password" minLength={8} value={editForm.password} onChange={(event) => setEditForm((current) => ({ ...current, password: event.target.value }))} placeholder="Nowe hasło (opcjonalnie)" className="rounded-lg border border-white/10 bg-[#020813]/70 px-3 py-2 text-xs font-semibold text-white outline-none focus:border-amber-400/50 sm:col-span-2" />
                            </form>
                          ) : (
                            <>
                              <p className="font-bold text-white">{user.firstName} {user.lastName}</p>
                              <p className="text-xs text-slate-500">{user.email}</p>
                              <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#020813]/70 px-3 py-1 text-xs font-semibold text-slate-400">
                                <span>Hasło:</span>
                                <span className="font-mono text-slate-200">{visiblePasswordIds.has(user.id) ? user.password || "Brak zapisanego hasła" : "••••••••"}</span>
                                <button type="button" onClick={() => togglePasswordVisibility(user.id)} className="text-sky-300 transition hover:text-sky-200" aria-label={visiblePasswordIds.has(user.id) ? "Ukryj hasło" : "Pokaż hasło"}>
                                  {visiblePasswordIds.has(user.id) ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                </button>
                              </div>
                            </>
                          )}
                        </td>
                        <td className="py-4">
                          {editingId === user.id ? (
                            <select form={`edit-user-${user.id}`} value={editForm.role} onChange={(event) => setEditForm((current) => ({ ...current, role: event.target.value as UserRole }))} className="rounded-xl border border-white/10 bg-[#020813]/70 px-3 py-2 text-xs font-bold text-white outline-none focus:border-amber-400/50">
                              {Object.entries(roleLabels).map(([role, label]) => <option key={role} value={role}>{label}</option>)}
                            </select>
                          ) : (
                            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${roleStyles[user.role]}`}>{roleLabels[user.role]}</span>
                          )}
                        </td>
                        <td className="py-4"><span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${statusStyles[user.dispatcherStatus]}`}><CircleDot className="h-3.5 w-3.5" />{user.role === "DISPATCHER" ? statusLabels[user.dispatcherStatus] : "Nie dotyczy"}</span></td>
                        <td className="py-4 text-slate-400">{new Intl.DateTimeFormat("pl-PL").format(new Date(user.createdAt))}</td>
                        <td className="py-4 text-right">
                          <div className="flex flex-wrap justify-end gap-2">
                            {editingId === user.id ? (
                              <>
                                <button type="submit" form={`edit-user-${user.id}`} disabled={updatingId === user.id} className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-200 transition hover:border-emerald-300/40 hover:bg-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-60"><Save className="h-4 w-4" />Zapisz</button>
                                <button type="button" onClick={() => { setEditingId(null); setEditForm(emptyForm); }} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-white/20 hover:bg-white/10">Anuluj</button>
                              </>
                            ) : (
                              <>
                                <button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); startEditing(user); }} className="inline-flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs font-bold text-amber-200 transition hover:border-amber-300/40 hover:bg-amber-400/15"><Pencil className="h-4 w-4" />Edytuj</button>
                              </>
                            )}
                            <button type="button" disabled={deletingId === user.id || updatingId === user.id} onClick={() => deleteUser(user.id)} className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs font-bold text-red-200 transition hover:border-red-300/40 hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-60"><Trash2 className="h-4 w-4" />Usuń</button>
                            
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} className="py-10 text-center text-sm text-slate-500">Brak użytkowników do wyświetlenia.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {controlCards.map((card) => {
              const Icon = card.icon;
              return (
                <article key={card.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 backdrop-blur">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 ${card.bg}`}><Icon className={`h-6 w-6 ${card.accent}`} /></span>
                  <h3 className="mt-5 text-lg font-black text-white">{card.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">{card.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
