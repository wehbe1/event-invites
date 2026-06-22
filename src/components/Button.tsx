import type { ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  icon?: ReactNode;
};

export const buttonVariants = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:outline-indigo-600",
  secondary:
    "bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50 focus-visible:outline-indigo-600",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:outline-indigo-600",
  danger:
    "bg-rose-600 text-white hover:bg-rose-700 focus-visible:outline-rose-600"
};

export function Button({
  className,
  variant = "primary",
  icon,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        buttonVariants[variant],
        className
      )}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}
