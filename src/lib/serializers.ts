import type { Event, Guest, InvitationLog } from "@prisma/client";

export type GuestWithLogs = Guest & {
  invitationLogs?: InvitationLog[];
};

export function serializeGuest(guest: GuestWithLogs) {
  return {
    ...guest,
    giftAmount: Number(guest.giftAmount),
    invitationLogs: guest.invitationLogs?.map((log) => ({
      ...log,
      sentAt: log.sentAt.toISOString()
    })),
    createdAt: guest.createdAt.toISOString(),
    updatedAt: guest.updatedAt.toISOString()
  };
}

export function getGuestStats(guests: Guest[]) {
  return {
    totalInvited: guests.length,
    pending: guests.filter((guest) => guest.status === "pending").length,
    confirmed: guests.filter((guest) => guest.status === "confirmed").length,
    declined: guests.filter((guest) => guest.status === "declined").length,
    giftOnly: guests.filter((guest) => guest.status === "gift_only").length,
    totalGiftMoney: guests.reduce(
      (sum, guest) => sum + Number(guest.giftAmount),
      0
    )
  };
}

export function serializeEvent(event: Event & { guests: GuestWithLogs[] }) {
  return {
    ...event,
    date: event.date.toISOString(),
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
    guests: event.guests.map(serializeGuest),
    stats: getGuestStats(event.guests)
  };
}
