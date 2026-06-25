"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CalendarDays, Copy, ExternalLink, Gift, MapPin, X } from "lucide-react";
import { Button } from "@/components/Button";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/format";
import { formatLocationText } from "@/lib/location";
import type { GuestStatus, SerializedGuest } from "@/lib/types";

type PublicEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  locationName: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  googleMapsUrl: string | null;
  wazeUrl: string | null;
  bitPhoneNumber: string | null;
  description: string | null;
  organizerName: string;
};

export default function InvitePage() {
  const params = useParams();
  const token = Array.isArray(params.token)
    ? params.token[0]
    : params.token ?? "";
  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [guest, setGuest] = useState<SerializedGuest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<GuestStatus | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [paymentPhoneNumber, setPaymentPhoneNumber] = useState<string | null>(null);
  const [copyNotice, setCopyNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const response = await fetch(`/api/invite/${token}`);
      const body = await response.json();
      setEvent(body.event ?? null);
      setGuest(body.guest ?? null);
      setLoading(false);
    }

    load();
  }, [token]);

  async function respond(status: GuestStatus) {
    setSubmitting(status);
    setError("");
    setPaymentUrl(null);
    setPaymentPhoneNumber(null);
    setCopyNotice("");

    const response = await fetch(`/api/invite/${token}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });

    setSubmitting(null);

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.error ?? "לא הצלחנו לעדכן את התשובה");
      return;
    }

    const body = await response.json();
    setGuest(body.guest);
    setPaymentUrl(body.paymentUrl ?? null);
    setPaymentPhoneNumber(body.paymentPhoneNumber ?? null);
  }

  async function copyBitPhoneNumber() {
    const phone = paymentPhoneNumber ?? event?.bitPhoneNumber;
    if (!phone) {
      return;
    }

    await navigator.clipboard?.writeText(phone);
    setCopyNotice("מספר הביט הועתק");
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-8">
      {loading ? (
        <div className="rounded-lg bg-white p-6 text-sm text-slate-500">טוען...</div>
      ) : !event || !guest ? (
        <div className="rounded-lg bg-white p-6 text-sm text-slate-500">
          ההזמנה לא נמצאה
        </div>
      ) : (
        <section className="w-full max-w-xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
          <div className="bg-slate-950 p-6 text-white">
            <div className="text-sm text-indigo-200">הזמנה אישית עבור</div>
            <h1 className="mt-2 text-3xl font-bold">{guest.fullName}</h1>
            <div className="mt-4">
              <StatusBadge status={guest.status} />
            </div>
          </div>

          <div className="grid gap-5 p-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">{event.title}</h2>
              {event.description ? (
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {event.description}
                </p>
              ) : null}
            </div>

            <div className="grid gap-3 rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-700">
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={18} aria-hidden="true" />
                {formatDate(event.date)} · {event.time}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin size={18} aria-hidden="true" />
                {formatLocationText(event)}
              </span>
            </div>

            {(event.googleMapsUrl || event.wazeUrl) ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {event.googleMapsUrl ? (
                  <a
                    href={event.googleMapsUrl}
                    target="_blank"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white"
                  >
                    <ExternalLink size={17} aria-hidden="true" />
                    פתח ב-Google Maps
                  </a>
                ) : null}
                {event.wazeUrl ? (
                  <a
                    href={event.wazeUrl}
                    target="_blank"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white"
                  >
                    <ExternalLink size={17} aria-hidden="true" />
                    פתח ב-Waze
                  </a>
                ) : null}
              </div>
            ) : null}

            <div className="grid gap-3">
              <Button
                onClick={() => respond("confirmed")}
                disabled={submitting !== null}
              >
                {submitting === "confirmed" ? "שומר..." : "מאשר/ת הגעה"}
              </Button>
              <Button
                variant="secondary"
                icon={<X size={17} aria-hidden="true" />}
                onClick={() => respond("declined")}
                disabled={submitting !== null}
              >
                {submitting === "declined" ? "שומר..." : "לא מגיע/ה"}
              </Button>
              <Button
                variant="secondary"
                icon={<Gift size={17} aria-hidden="true" />}
                onClick={() => respond("gift_only")}
                disabled={submitting !== null}
              >
                {submitting === "gift_only"
                  ? "שומר..."
                  : "לא אוכל/ת להגיע אבל אשלח מתנה ב-bit"}
              </Button>
            </div>

            {guest.status === "confirmed" ? (
              <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
                תודה, אישור ההגעה נשמר.
              </div>
            ) : null}

            {guest.status === "declined" ? (
              <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">
                תודה, התשובה נשמרה.
              </div>
            ) : null}

            {guest.status === "gift_only" ? (
              <div className="grid gap-3 rounded-lg bg-sky-50 px-4 py-3 text-sm text-sky-900">
                <b>שליחת מתנה ב-bit</b>
                {paymentPhoneNumber || event.bitPhoneNumber ? (
                  <>
                    <div className="rounded-lg bg-white p-3">
                      <div className="text-xs font-bold text-sky-700">
                        מספר הביט של המארגן/ת
                      </div>
                      <div className="mt-1 text-2xl font-black text-slate-950" dir="ltr">
                        {paymentPhoneNumber ?? event.bitPhoneNumber}
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      icon={<Copy size={17} aria-hidden="true" />}
                      onClick={copyBitPhoneNumber}
                    >
                      העתקת מספר ביט
                    </Button>
                    {copyNotice ? (
                      <div className="text-sm font-bold text-emerald-700">{copyNotice}</div>
                    ) : null}
                  </>
                ) : (
                  <div className="rounded-lg bg-amber-50 px-3 py-2 font-semibold text-amber-800">
                    המארגן/ת עדיין לא הגדיר/ה מספר לקבלת מתנות ב-bit.
                  </div>
                )}
                {paymentUrl ? (
                  <a
                    href={paymentUrl}
                    target="_blank"
                    className="inline-flex min-h-10 items-center justify-center rounded-lg bg-sky-600 px-4 py-2 font-bold text-white"
                  >
                    פתיחת bit
                  </a>
                ) : null}
              </div>
            ) : null}

            {error ? (
              <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">
                {error}
              </div>
            ) : null}
          </div>
        </section>
      )}
    </main>
  );
}
