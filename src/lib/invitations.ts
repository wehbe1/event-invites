export type InvitationMessageInput = {
  guestName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  googleMapsUrl?: string | null;
  wazeUrl?: string | null;
  organizerName: string;
  inviteUrl: string;
};

export function normalizePhoneForWaMe(phoneNumber: string) {
  let digits = phoneNumber.replace(/\D/g, "");

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  if (digits.startsWith("0")) {
    digits = `972${digits.slice(1)}`;
  }

  return digits;
}

export function buildInvitationMessage(input: InvitationMessageInput) {
  const lines = [
    `שלום ${input.guestName},`,
    `נשמח להזמין אותך אל ${input.eventTitle}.`,
    `מתי: ${input.eventDate} בשעה ${input.eventTime}`,
    `איפה: ${input.eventLocation}`,
  ];

  if (input.googleMapsUrl) {
    lines.push(`Google Maps: ${input.googleMapsUrl}`);
  }

  if (input.wazeUrl) {
    lines.push(`Waze: ${input.wazeUrl}`);
  }

  lines.push(`אישור הגעה אישי: ${input.inviteUrl}`);
  lines.push(`תודה, ${input.organizerName}`);

  return lines.join("\n");
}

export function buildWhatsAppUrl(phoneNumber: string, message: string) {
  const phone = normalizePhoneForWaMe(phoneNumber);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function buildSmsUrl(phoneNumber: string, message: string) {
  return `sms:${phoneNumber}?&body=${encodeURIComponent(message)}`;
}
