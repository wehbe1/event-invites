"use client";

import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { EventForm, type EventFormValues } from "@/components/EventForm";

export default function NewEventPage() {
  const router = useRouter();

  async function submit(form: EventFormValues) {
    const response = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.error ?? "לא הצלחנו ליצור אירוע");
    }

    const body = await response.json();
    router.push(`/events/${body.event.id}/guests`);
  }

  return (
    <>
      <AppHeader />
      <main className="mx-auto grid max-w-3xl gap-6 px-4 py-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">יצירת אירוע</h1>
          <p className="mt-1 text-sm text-slate-500">
            אירוע של X בתאריך Y במקום Z
          </p>
        </div>

        <EventForm mode="create" onSubmit={submit} />
      </main>
    </>
  );
}
