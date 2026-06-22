"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  CalendarDays,
  ExternalLink,
  Gift,
  MapPin,
  MessageCircle,
  Pencil,
  Users
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/Button";
import { LinkButton } from "@/components/LinkButton";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/format";
import { formatLocationText } from "@/lib/location";
import type { SerializedEvent } from "@/lib/types";

export default function EventPage() {
  const params = useParams();
  const eventId = Array.isArray(params.id)
    ? params.id[0]
    : params.id ?? "";
  const [event, setEvent] = useState<SerializedEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const response = await fetch(`/api/events/${eventId}`);
      const body = await response.json();
      setEvent(body.event ?? null);
      setLoading(false);
    }

    load();
  }, [eventId]);

  const attending = useMemo(
    () => event?.guests.filter((guest) => guest.status === "confirmed") ?? [],
    [event]
  );

  const recentLogs = useMemo(
    () =>
      event?.guests
        .flatMap((guest) =>
          (guest.invitationLogs ?? []).map((log) => ({ ...log, guest }))
        )
        .sort((a, b) => Date.parse(b.sentAt) - Date.parse(a.sentAt))
        .slice(0, 8) ?? [],
    [event]
  );

  return (
    <>
      <AppHeader />
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6">
        {loading ? (
          <div className="rounded-lg bg-white p-6 text-sm text-slate-500">טוען...</div>
        ) : !event ? (
          <div className="rounded-lg bg-white p-6 text-sm text-slate-500">
            האירוע לא נמצא
          </div>
        ) : (
          <>
            <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <h1 className="text-2xl font-bold text-slate-950">{event.title}</h1>
                  <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays size={17} aria-hidden="true" />
                      {formatDate(event.date)} · {event.time}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <MapPin size={17} aria-hidden="true" />
                      {formatLocationText(event)}
                    </span>
                  </div>
                  {(event.googleMapsUrl || event.wazeUrl) ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {event.googleMapsUrl ? (
                        <a
                          href={event.googleMapsUrl}
                          target="_blank"
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 transition hover:bg-slate-50"
                        >
                          <ExternalLink size={16} aria-hidden="true" />
                          פתח ב-Google Maps
                        </a>
                      ) : null}
                      {event.wazeUrl ? (
                        <a
                          href={event.wazeUrl}
                          target="_blank"
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 transition hover:bg-slate-50"
                        >
                          <ExternalLink size={16} aria-hidden="true" />
                          פתח ב-Waze
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                  {event.description ? (
                    <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
                      {event.description}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  <LinkButton
                    href={`/events/${event.id}/edit`}
                    variant="secondary"
                    icon={<Pencil size={17} aria-hidden="true" />}
                  >
                    עריכת אירוע
                  </LinkButton>
                  <LinkButton
                    href={`/events/${event.id}/guests`}
                    icon={<Pencil size={17} aria-hidden="true" />}
                  >
                    ניהול אורחים
                  </LinkButton>
                  {event.guests[0] ? (
                    <LinkButton
                      href={`/invite/${event.guests[0].inviteToken}`}
                      variant="secondary"
                      icon={<MessageCircle size={17} aria-hidden="true" />}
                    >
                      תצוגת הזמנה
                    </LinkButton>
                  ) : (
                    <Button
                      variant="secondary"
                      icon={<MessageCircle size={17} aria-hidden="true" />}
                      disabled
                    >
                      תצוגת הזמנה
                    </Button>
                  )}
                </div>
              </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
              <StatCard label="מוזמנים" value={event.stats.totalInvited} />
              <StatCard label="ממתינים" value={event.stats.pending} />
              <StatCard label="מאשרים" value={event.stats.confirmed} />
              <StatCard label="לא מגיעים" value={event.stats.declined} />
              <StatCard label="מתנה בלבד" value={event.stats.giftOnly} />
              <StatCard label="מתנות" value={formatCurrency(event.stats.totalGiftMoney)} />
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                  <h2 className="font-bold text-slate-950">רשימת מגיעים</h2>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <Users size={17} aria-hidden="true" />
                    {attending.length}
                  </span>
                </div>
                {attending.length === 0 ? (
                  <div className="p-5 text-sm text-slate-500">אין מאשרים עדיין.</div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {attending.map((guest) => (
                      <div
                        key={guest.id}
                        className="grid gap-2 px-4 py-3 sm:grid-cols-[1fr_auto_auto]"
                      >
                        <span className="font-bold text-slate-950">{guest.fullName}</span>
                        <span className="font-mono text-sm text-slate-500" dir="ltr">
                          {guest.phoneNumber}
                        </span>
                        <StatusBadge status={guest.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-slate-950">
                  <Gift size={18} aria-hidden="true" />
                  מתנות ותשלומים
                </div>
                <div className="mt-4 text-3xl font-bold text-slate-950">
                  {formatCurrency(event.stats.totalGiftMoney)}
                </div>
                <div className="mt-2 text-sm text-slate-500">
                  עדכון הסכום מתבצע ידנית בטבלת האורחים עד לחיבור webhook.
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-bold text-slate-700">יומן אחרון</h3>
                  <div className="mt-3 grid gap-2 text-sm">
                    {recentLogs.length === 0 ? (
                      <span className="text-slate-500">אין שליחות עדיין.</span>
                    ) : (
                      recentLogs.map((log) => (
                        <div
                          key={log.id}
                          className="rounded-lg bg-slate-50 px-3 py-2 text-slate-600"
                        >
                          {log.guest.fullName} · {log.channel} ·{" "}
                          {new Date(log.sentAt).toLocaleDateString("he-IL")}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}
