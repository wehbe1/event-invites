import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { guestSchema } from "@/lib/validators";
import { jsonError, notFound } from "@/lib/http";
import { serializeGuest } from "@/lib/serializers";
import { createInviteToken } from "@/lib/tokens";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getOwnedEvent(id: string, userId: string) {
  return prisma.event.findFirst({ where: { id, userId } });
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    const event = await getOwnedEvent(id, user.id);

    if (!event) {
      return notFound("האירוע לא נמצא");
    }

    const guests = await prisma.guest.findMany({
      where: { eventId: id },
      include: {
        invitationLogs: {
          orderBy: { sentAt: "desc" },
          take: 3
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ guests: guests.map(serializeGuest) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    const event = await getOwnedEvent(id, user.id);

    if (!event) {
      return notFound("האירוע לא נמצא");
    }

    const data = guestSchema.parse(await request.json());
    const guest = await prisma.guest.create({
      data: {
        eventId: id,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        notes: data.notes,
        inviteToken: createInviteToken()
      }
    });

    return NextResponse.json(
      { guest: serializeGuest(guest) },
      { status: 201 }
    );
  } catch (error) {
    return jsonError(error);
  }
}
