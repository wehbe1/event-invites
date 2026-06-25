export type GuestStatus = "pending" | "confirmed" | "declined" | "gift_only";
export type InvitationChannel = "sms" | "whatsapp";

export type SerializedInvitationLog = {
  id: string;
  guestId: string;
  channel: InvitationChannel;
  sentAt: string;
  status: string;
};

export type SerializedGuest = {
  id: string;
  eventId: string;
  fullName: string;
  phoneNumber: string;
  status: GuestStatus;
  giftAmount: number;
  notes: string | null;
  inviteToken: string;
  createdAt: string;
  updatedAt: string;
  invitationLogs?: SerializedInvitationLog[];
};

export type EventStats = {
  totalInvited: number;
  pending: number;
  confirmed: number;
  declined: number;
  giftOnly: number;
  totalGiftMoney: number;
};

export type SerializedEvent = {
  id: string;
  userId: string;
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
  createdAt: string;
  updatedAt: string;
  guests: SerializedGuest[];
  stats: EventStats;
};

export type InvitationLink = {
  guestId: string;
  guestName: string;
  inviteUrl: string;
  messageUrl: string;
};
