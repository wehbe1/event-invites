"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { EventForm, type EventFormValues } from "@/components/EventForm";
import { LinkButton } from "@/components/LinkButton";
import type { SerializedEvent } from "@/lib/types";

export default function EditEventPage() {
  const router = useRouter();
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

  async function submit(form: EventFormValues) {
    const response = await fetch(`/api/events/${eventId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.error ?? "לא הצלחנו לשמור את האירוע");
    }

    router.push(`/events/${eventId}`);
  }

  return (
    <>
      <AppHeader />
      <main className="mx-auto grid max-w-3xl gap-6 px-4 py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-950">עריכת אירוע</h1>
            <p className="mt-1 text-sm text-slate-500">
              עדכון פרטים, כתובת וקישורי ניווט
            </p>
          </div>
          <LinkButton
            href={`/events/${eventId}`}
            variant="secondary"
            icon={<ArrowRight size={17} aria-hidden="true" />}
          >
            חזרה
          </LinkButton>
        </div>

        {loading ? (
          <div className="rounded-lg bg-white p-6 text-sm text-slate-500">
            טוען...
          </div>
        ) : event ? (
          <EventForm mode="edit" initialEvent={event} onSubmit={submit} />
        ) : (
          <div className="rounded-lg bg-white p-6 text-sm text-slate-500">
            האירוע לא נמצא
          </div>
        )}
      </main>
    </>
  );
}
