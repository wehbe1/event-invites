import Link from "next/link";
import type { LinkProps } from "next/link";
import type { ReactNode } from "react";
import { clsx } from "clsx";
import { buttonVariants } from "@/components/Button";

type LinkButtonProps = LinkProps & {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  target?: string;
  title?: string;
};

export function LinkButton({
  children,
  className,
  icon,
  variant = "primary",
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={clsx(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        buttonVariants[variant],
        className
      )}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}
