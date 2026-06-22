import type { GuestStatus } from "@prisma/client";

export const statusLabels: Record<GuestStatus, string> = {
  pending: "ממתין/ה",
  confirmed: "מאשר/ת",
  declined: "לא מגיע/ה",
  gift_only: "מתנה בלבד"
};

export const statusTone: Record<GuestStatus, string> = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  confirmed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  declined: "bg-rose-50 text-rose-800 ring-rose-200",
  gift_only: "bg-sky-50 text-sky-800 ring-sky-200"
};

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("he-IL", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(date));
}
