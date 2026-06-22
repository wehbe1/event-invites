import { z } from "zod";

const optionalNumber = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().optional()
);

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6),
  name: z.string().trim().min(2).optional()
});

export const eventSchema = z.object({
  title: z.string().trim().min(2),
  date: z.string().min(1),
  time: z.string().trim().min(1),
  location: z.string().trim().optional().default(""),
  locationName: z.string().trim().optional().default(""),
  address: z.string().trim().optional().default(""),
  latitude: optionalNumber.refine(
    (value) => value === undefined || (value >= -90 && value <= 90),
    "Invalid latitude"
  ),
  longitude: optionalNumber.refine(
    (value) => value === undefined || (value >= -180 && value <= 180),
    "Invalid longitude"
  ),
  googleMapsUrl: z.string().trim().optional().default(""),
  wazeUrl: z.string().trim().optional().default(""),
  description: z.string().trim().optional().default(""),
  organizerName: z.string().trim().min(2)
});

export const guestStatusSchema = z.enum([
  "pending",
  "confirmed",
  "declined",
  "gift_only"
]);

export const guestSchema = z.object({
  fullName: z.string().trim().min(2),
  phoneNumber: z.string().trim().min(7),
  notes: z.string().trim().optional().default("")
});

export const updateGuestSchema = z.object({
  fullName: z.string().trim().min(2).optional(),
  phoneNumber: z.string().trim().min(7).optional(),
  status: guestStatusSchema.optional(),
  giftAmount: z.coerce.number().min(0).optional(),
  notes: z.string().trim().optional()
});

export const importGuestsSchema = z.object({
  guests: z.array(guestSchema).min(1).max(1000)
});

export const sendInvitationsSchema = z.object({
  guestIds: z.array(z.string().min(1)).min(1),
  channel: z.enum(["sms", "whatsapp"])
});

export const inviteResponseSchema = z.object({
  status: z.enum(["confirmed", "declined", "gift_only"])
});
