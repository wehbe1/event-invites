"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import {
  Download,
  FileUp,
  MessageCircle,
  MessageSquare,
  Save,
  UserPlus,
  UsersRound
} from "lucide-react";
import { Button, buttonVariants } from "@/components/Button";
import { Field, Input, Textarea } from "@/components/Field";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, statusLabels } from "@/lib/format";
import type {
  GuestStatus,
  InvitationChannel,
  InvitationLink,
  SerializedEvent,
  SerializedGuest
} from "@/lib/types";

type ContactManager = Navigator & {
  contacts?: {
    select: (
      fields: string[],
      options?: { multiple?: boolean }
    ) => Promise<Array<{ name?: string[]; tel?: string[] }>>;
  };
};

type Draft = {
  status: GuestStatus;
  giftAmount: string;
  notes: string;
};

const statuses: Array<GuestStatus | "all" | "attending"> = [
  "all",
  "attending",
  "pending",
  "confirmed",
  "declined",
  "gift_only"
];

const filterLabels: Record<(typeof statuses)[number], string> = {
  all: "כולם",
  attending: "רשימת מגיעים",
  pending: statusLabels.pending,
  confirmed: statusLabels.confirmed,
  declined: statusLabels.declined,
  gift_only: statusLabels.gift_only
};

export function GuestManager({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<SerializedEvent | null>(null);
  const [guests, setGuests] = useState<SerializedGuest[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [filter, setFilter] = useState<(typeof statuses)[number]>("all");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<InvitationChannel | null>(null);
  const [links, setLinks] = useState<InvitationLink[]>([]);
  const [newGuest, setNewGuest] = useState({
    fullName: "",
    phoneNumber: "",
    notes: ""
  });

  async function load() {
    setLoading(true);
    const response = await fetch(`/api/events/${eventId}`);
    const body = await response.json();
    setEvent(body.event);
    setGuests(body.event?.guests ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [eventId]);

  useEffect(() => {
    const nextDrafts: Record<string, Draft> = {};
    guests.forEach((guest) => {
      nextDrafts[guest.id] = {
        status: guest.status,
        giftAmount: String(guest.giftAmount ?? 0),
        notes: guest.notes ?? ""
      };
    });
    setDrafts(nextDrafts);
  }, [guests]);

  const filteredGuests = useMemo(() => {
    if (filter === "all") {
      return guests;
    }

    if (filter === "attending") {
      return guests.filter((guest) => guest.status === "confirmed");
    }

    return guests.filter((guest) => guest.status === filter);
  }, [filter, guests]);

  const selectedGuests = guests.filter((guest) => selected.includes(guest.id));

  function toggleSelected(guestId: string) {
    setSelected((current) =>
      current.includes(guestId)
        ? current.filter((id) => id !== guestId)
        : [...current, guestId]
    );
  }

  function selectFiltered() {
    const ids = filteredGuests.map((guest) => guest.id);
    setSelected((current) =>
      ids.every((id) => current.includes(id))
        ? current.filter((id) => !ids.includes(id))
        : Array.from(new Set([...current, ...ids]))
    );
  }

  async function addGuest(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");

    const response = await fetch(`/api/events/${eventId}/guests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newGuest)
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.error ?? "לא הצלחנו להוסיף אורח/ת");
      return;
    }

    setNewGuest({ fullName: "", phoneNumber: "", notes: "" });
    setNotice("האורח/ת נוספו");
    await load();
  }

  async function importCsv(file: File) {
    setError("");
    setNotice("");

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (result) => {
        const guestsToImport = result.data
          .map((row) => ({
            fullName:
              row.fullName ??
              row["שם מלא"] ??
              row["שם"] ??
              row.name ??
              "",
            phoneNumber:
              row.phoneNumber ??
              row["טלפון"] ??
              row["מספר טלפון"] ??
              row.phone ??
              "",
            notes: row.notes ?? row["הערות"] ?? ""
          }))
          .filter((guest) => guest.fullName && guest.phoneNumber);

        if (guestsToImport.length === 0) {
          setError("לא נמצאו שורות תקינות בקובץ");
          return;
        }

        const response = await fetch(`/api/events/${eventId}/guests/import`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ guests: guestsToImport })
        });

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          setError(body?.error ?? "ייבוא CSV נכשל");
          return;
        }

        const body = await response.json();
        setNotice(`יובאו ${body.imported} אורחים`);
        await load();
      },
      error: () => setError("לא הצלחנו לקרוא את הקובץ")
    });
  }

  async function pickContacts() {
    setError("");
    const contactNavigator = navigator as ContactManager;

    if (!contactNavigator.contacts?.select) {
      setError("בחירת אנשי קשר אינה זמינה בדפדפן הזה");
      return;
    }

    const contacts = await contactNavigator.contacts.select(["name", "tel"], {
      multiple: true
    });

    const guestsToImport = contacts
      .map((contact) => ({
        fullName: contact.name?.[0] ?? "",
        phoneNumber: contact.tel?.[0] ?? "",
        notes: "יובא מבחירת אנשי קשר"
      }))
      .filter((guest) => guest.fullName && guest.phoneNumber);

    if (guestsToImport.length === 0) {
      return;
    }

    const response = await fetch(`/api/events/${eventId}/guests/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guests: guestsToImport })
    });

    if (response.ok) {
      setNotice(`יובאו ${guestsToImport.length} אנשי קשר`);
      await load();
    }
  }

  async function send(channel: InvitationChannel) {
    if (selected.length === 0) {
      setError("בחרו לפחות אורח/ת אחד/ת");
      return;
    }

    setSending(channel);
    setError("");
    setNotice("");
    setLinks([]);

    const response = await fetch(`/api/events/${eventId}/invitations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestIds: selected, channel })
    });

    setSending(null);

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.error ?? "לא הצלחנו ליצור קישורי שליחה");
      return;
    }

    const body = await response.json();
    setLinks(body.links ?? []);
    setNotice(`נוצרו ${body.links?.length ?? 0} קישורי שליחה`);
    await load();
  }

  async function saveGuest(guestId: string) {
    const draft = drafts[guestId];
    if (!draft) {
      return;
    }

    const response = await fetch(`/api/guests/${guestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: draft.status,
        giftAmount: Number(draft.giftAmount || 0),
        notes: draft.notes
      })
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.error ?? "שמירת האורח/ת נכשלה");
      return;
    }

    setNotice("השינויים נשמרו");
    await load();
  }

  function updateDraft(guestId: string, patch: Partial<Draft>) {
    setDrafts((current) => ({
      ...current,
      [guestId]: {
        ...current[guestId],
        ...patch
      }
    }));
  }

  function onCsvChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      importCsv(file);
    }
    event.target.value = "";
  }

  if (loading) {
    return <div className="rounded-lg bg-white p-6 text-sm text-slate-500">טוען...</div>;
  }

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-950">אורחים</h2>
            <div className="mt-1 text-sm text-slate-500">
              {event?.stats.totalInvited ?? 0} מוזמנים ·{" "}
              {formatCurrency(event?.stats.totalGiftMoney ?? 0)} מתנות
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              icon={<MessageCircle size={17} aria-hidden="true" />}
              disabled={sending !== null}
              onClick={() => send("whatsapp")}
            >
              {sending === "whatsapp" ? "יוצר..." : "שליחת WhatsApp"}
            </Button>
            <Button
              variant="secondary"
              icon={<MessageSquare size={17} aria-hidden="true" />}
              disabled={sending !== null}
              onClick={() => send("sms")}
            >
              {sending === "sms" ? "יוצר..." : "שליחת SMS"}
            </Button>
            <a
              href={`/api/events/${eventId}/guests/export`}
              className={`${buttonVariants.ghost} inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition`}
            >
              <Download size={17} aria-hidden="true" />
              <span>CSV</span>
            </a>
          </div>
        </div>

        <form onSubmit={addGuest} className="grid gap-3 md:grid-cols-[1fr_1fr_1.4fr_auto]">
          <Field label="שם מלא">
            <Input
              value={newGuest.fullName}
              onChange={(event) =>
                setNewGuest((current) => ({
                  ...current,
                  fullName: event.target.value
                }))
              }
              required
            />
          </Field>
          <Field label="טלפון">
            <Input
              value={newGuest.phoneNumber}
              dir="ltr"
              onChange={(event) =>
                setNewGuest((current) => ({
                  ...current,
                  phoneNumber: event.target.value
                }))
              }
              required
            />
          </Field>
          <Field label="הערות">
            <Input
              value={newGuest.notes}
              onChange={(event) =>
                setNewGuest((current) => ({
                  ...current,
                  notes: event.target.value
                }))
              }
            />
          </Field>
          <div className="self-end">
            <Button type="submit" icon={<UserPlus size={17} aria-hidden="true" />}>
              הוספה
            </Button>
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 transition hover:bg-slate-50">
            <FileUp size={17} aria-hidden="true" />
            ייבוא CSV
            <input type="file" accept=".csv,text/csv" onChange={onCsvChange} className="sr-only" />
          </label>
          <Button
            variant="ghost"
            icon={<UsersRound size={17} aria-hidden="true" />}
            onClick={pickContacts}
          >
            אנשי קשר
          </Button>
          <div className="flex flex-wrap gap-1">
            {statuses.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  filter === status
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {filterLabels[status]}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
            {error}
          </div>
        ) : null}
        {notice ? (
          <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
            {notice}
          </div>
        ) : null}
      </section>

      {links.length > 0 ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">קישורי שליחה</h2>
          <div className="mt-3 grid gap-2">
            {links.map((link) => (
              <div
                key={link.guestId}
                className="flex flex-col gap-2 rounded-lg bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-semibold text-slate-900">{link.guestName}</span>
                <div className="flex flex-wrap gap-2">
                  <a
                    className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-bold text-white"
                    href={link.messageUrl}
                    target="_blank"
                  >
                    פתיחת הודעה
                  </a>
                  <a
                    className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200"
                    href={link.inviteUrl}
                    target="_blank"
                  >
                    קישור אישי
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center">
          <div className="text-sm font-bold text-slate-700">
            נבחרו {selectedGuests.length} מתוך {filteredGuests.length}
          </div>
          <Button variant="ghost" onClick={selectFiltered}>
            בחירה במסוננים
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full border-collapse text-right text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="w-12 px-4 py-3"></th>
                <th className="px-4 py-3">שם</th>
                <th className="px-4 py-3">טלפון</th>
                <th className="px-4 py-3">סטטוס</th>
                <th className="px-4 py-3">מתנה</th>
                <th className="px-4 py-3">הערות</th>
                <th className="px-4 py-3">יומן</th>
                <th className="px-4 py-3">שמירה</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGuests.map((guest) => (
                <tr key={guest.id} className="align-top">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(guest.id)}
                      onChange={() => toggleSelected(guest.id)}
                      className="size-4 accent-indigo-600"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-950">{guest.fullName}</div>
                    <div className="mt-1">
                      <StatusBadge status={guest.status} />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600" dir="ltr">
                    {guest.phoneNumber}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={drafts[guest.id]?.status ?? guest.status}
                      onChange={(event) =>
                        updateDraft(guest.id, {
                          status: event.target.value as GuestStatus
                        })
                      }
                      className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"
                    >
                      <option value="pending">{statusLabels.pending}</option>
                      <option value="confirmed">{statusLabels.confirmed}</option>
                      <option value="declined">{statusLabels.declined}</option>
                      <option value="gift_only">{statusLabels.gift_only}</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      min="0"
                      value={drafts[guest.id]?.giftAmount ?? String(guest.giftAmount)}
                      onChange={(event) =>
                        updateDraft(guest.id, { giftAmount: event.target.value })
                      }
                      className="w-28"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Textarea
                      value={drafts[guest.id]?.notes ?? guest.notes ?? ""}
                      onChange={(event) =>
                        updateDraft(guest.id, { notes: event.target.value })
                      }
                      className="min-h-16 w-56"
                    />
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {guest.invitationLogs?.length ? (
                      <div className="grid gap-1">
                        {guest.invitationLogs.map((log) => (
                          <span key={log.id}>
                            {log.channel} · {new Date(log.sentAt).toLocaleDateString("he-IL")}
                          </span>
                        ))}
                      </div>
                    ) : (
                      "אין"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="secondary"
                      icon={<Save size={16} aria-hidden="true" />}
                      onClick={() => saveGuest(guest.id)}
                    >
                      שמירה
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
