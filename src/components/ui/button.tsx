import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex h-12 items-center justify-center rounded-lg bg-amber-400 px-5 text-sm font-bold text-slate-950 transition hover:bg-amber-300 ${className}`}
      {...props}
    />
  );
}