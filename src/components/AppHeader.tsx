"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, LogOut, Plus, Users } from "lucide-react";
import { Button } from "@/components/Button";
import { LinkButton } from "@/components/LinkButton";

export function AppHeader() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-slate-950">
          <span className="grid size-9 place-items-center rounded-lg bg-indigo-600 text-white">
            <CalendarDays size={19} aria-hidden="true" />
          </span>
          <span>ניהול הזמנות</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 sm:flex"
          >
            <Users size={17} aria-hidden="true" />
            אירועים
          </Link>
          <LinkButton
            href="/events/new"
            icon={<Plus size={17} aria-hidden="true" />}
            className="px-3"
          >
            אירוע
          </LinkButton>
          <Button
            variant="ghost"
            icon={<LogOut size={17} aria-hidden="true" />}
            onClick={logout}
            aria-label="יציאה"
            title="יציאה"
            className="px-3"
          >
            יציאה
          </Button>
        </nav>
      </div>
    </header>
  );
}
