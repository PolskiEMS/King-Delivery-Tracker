"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";

type LogoutButtonProps = { className?: string; label?: string };

export function LogoutButton({ className = "", label = "Wyloguj się" }: LogoutButtonProps) {
  return (
    <Link
      href="/"
      onClick={() => {
        window.localStorage.removeItem("kingDeliveryCurrentUser");
        window.localStorage.removeItem("kingDeliveryNotificationsRead");
      }}
      className={className || "inline-flex items-center justify-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-bold text-amber-200 transition hover:border-amber-300/40 hover:bg-amber-400/15 hover:text-amber-100"}
    >
      <LogOut className="h-4 w-4" />
      {label}
    </Link>
  );
}
