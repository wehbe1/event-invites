"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { GuestManager } from "@/components/GuestManager";

export default function EventGuestsPage() {
  const params = useParams();
  const eventId = Array.isArray(params.id)
    ? params.id[0]
    : params.id ?? "";

  return (
    <>
      <AppHeader />
      <main className="mx-auto grid max-w-6xl gap-5 px-4 py-6">
        <Link
          href={`/events/${eventId}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-indigo-700"
        >
          <ArrowRight size={17} aria-hidden="true" />
          חזרה לאירוע
        </Link>
        <GuestManager eventId={eventId} />
      </main>
    </>
  );
}
