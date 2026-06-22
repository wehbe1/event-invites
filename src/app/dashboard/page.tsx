"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, Gift, Hourglass, PartyPopper, Users } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { LinkButton } from "@/components/LinkButton";
import { StatCard } from "@/components/StatCard";
import { formatCurrency, formatDate } from "@/lib/format";
import { formatLocationText } from "@/lib/location";
import type { SerializedEvent } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [events, setEvents] = useState<SerializedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/events");

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      const body = await response.json();
      setEvents(body.events ?? []);
      setLoading(false);
    }

    load();
  }, [router]);

  const totals = useMemo(
    () =>
      events.reduce(
        (acc, event) => ({
          invited: acc.invited + event.stats.totalInvited,
          confirmed: acc.confirmed + event.stats.confirmed,
          pending: acc.pending + event.stats.pending,
          gifts: acc.gifts + event.stats.totalGiftMoney
        }),
        { invited: 0, confirmed: 0, pending: 0, gifts: 0 }
      ),
    [events]
  );

  return (
    <>
      <AppHeader />
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-950">דשבורד</h1>
            <p className="mt-1 text-sm text-slate-500">אירועים, RSVP ומתנות</p>
          </div>
          <LinkButton href="/events/new" icon={<CalendarPlus size={18} aria-hidden="true" />}>
            יצירת אירוע
          </LinkButton>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="מוזמנים"
            value={totals.invited}
            icon={<Users size={19} aria-hidden="true" />}
          />
          <StatCard
            label="מאשרים"
            value={totals.confirmed}
            icon={<PartyPopper size={19} aria-hidden="true" />}
          />
          <StatCard
            label="ממתינים"
            value={totals.pending}
            icon={<Hourglass size={19} aria-hidden="true" />}
          />
          <StatCard
            label="מתנות"
            value={formatCurrency(totals.gifts)}
            icon={<Gift size={19} aria-hidden="true" />}
          />
        </section>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="font-bold text-slate-950">אירועים</h2>
          </div>

          {loading ? (
            <div className="p-6 text-sm text-slate-500">טוען...</div>
          ) : events.length === 0 ? (
            <div className="grid gap-3 p-6 text-sm text-slate-500">
              <span>עדיין אין אירועים.</span>
              <LinkButton href="/events/new" icon={<CalendarPlus size={18} aria-hidden="true" />}>
                יצירת אירוע ראשון
              </LinkButton>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {events.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="grid gap-3 px-4 py-4 transition hover:bg-slate-50 md:grid-cols-[1.3fr_1fr_auto]"
                >
                  <div>
                    <div className="font-bold text-slate-950">{event.title}</div>
                    <div className="mt-1 text-sm text-slate-500">
                      {formatDate(event.date)} בשעה {event.time} ·{" "}
                      {formatLocationText(event)}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <span className="rounded-lg bg-slate-100 px-2 py-2">
                      {event.stats.totalInvited}
                      <b className="block text-slate-500">מוזמנים</b>
                    </span>
                    <span className="rounded-lg bg-emerald-50 px-2 py-2 text-emerald-800">
                      {event.stats.confirmed}
                      <b className="block text-emerald-700">מאשרים</b>
                    </span>
                    <span className="rounded-lg bg-rose-50 px-2 py-2 text-rose-800">
                      {event.stats.declined}
                      <b className="block text-rose-700">לא מגיעים</b>
                    </span>
                    <span className="rounded-lg bg-sky-50 px-2 py-2 text-sky-800">
                      {event.stats.giftOnly}
                      <b className="block text-sky-700">מתנה</b>
                    </span>
                  </div>
                  <div className="self-center text-sm font-bold text-indigo-700">
                    פתיחה
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
