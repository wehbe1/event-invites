import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { sendInvitationsSchema } from "@/lib/validators";
import { jsonError, notFound } from "@/lib/http";
import {
  buildInvitationMessage,
  buildSmsUrl,
  buildWhatsAppUrl
} from "@/lib/invitations";
import { formatDate } from "@/lib/format";
import { formatLocationText } from "@/lib/location";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    const data = sendInvitationsSchema.parse(await request.json());
    const event = await prisma.event.findFirst({
      where: { id, userId: user.id },
      include: {
        guests: {
          where: { id: { in: data.guestIds } }
        }
      }
    });

    if (!event) {
      return notFound("האירוע לא נמצא");
    }

    const logs = await prisma.$transaction(
      event.guests.map((guest) =>
        prisma.invitationLog.create({
          data: {
            guestId: guest.id,
            channel: data.channel,
            status: "link_generated"
          }
        })
      )
    );

    const links = event.guests.map((guest) => {
      const inviteUrl = `${request.nextUrl.origin}/invite/${guest.inviteToken}`;
      const message = buildInvitationMessage({
        guestName: guest.fullName,
        eventTitle: event.title,
        eventDate: formatDate(event.date),
        eventTime: event.time,
        eventLocation: formatLocationText(event),
        googleMapsUrl: event.googleMapsUrl,
        wazeUrl: event.wazeUrl,
        organizerName: event.organizerName,
        inviteUrl
      });

      return {
        guestId: guest.id,
        guestName: guest.fullName,
        inviteUrl,
        messageUrl:
          data.channel === "whatsapp"
            ? buildWhatsAppUrl(guest.phoneNumber, message)
            : buildSmsUrl(guest.phoneNumber, message)
      };
    });

    return NextResponse.json({
      channel: data.channel,
      status: "link_generated",
      createdLogs: logs.length,
      links
    });
  } catch (error) {
    return jsonError(error);
  }
}
