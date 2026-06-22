import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, notFound } from "@/lib/http";
import { serializeGuest } from "@/lib/serializers";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { token } = await params;
    const guest = await prisma.guest.findUnique({
      where: { inviteToken: token },
      include: {
        event: true
      }
    });

    if (!guest) {
      return notFound("ההזמנה לא נמצאה");
    }

    return NextResponse.json({
      guest: serializeGuest(guest),
      event: {
        ...guest.event,
        date: guest.event.date.toISOString(),
        createdAt: guest.event.createdAt.toISOString(),
        updatedAt: guest.event.updatedAt.toISOString()
      }
    });
  } catch (error) {
    return jsonError(error);
  }
}
