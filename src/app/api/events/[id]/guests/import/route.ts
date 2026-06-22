import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { importGuestsSchema } from "@/lib/validators";
import { jsonError, notFound } from "@/lib/http";
import { createInviteToken } from "@/lib/tokens";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    const event = await prisma.event.findFirst({
      where: { id, userId: user.id }
    });

    if (!event) {
      return notFound("האירוע לא נמצא");
    }

    const { guests } = importGuestsSchema.parse(await request.json());
    const created = await prisma.$transaction(
      guests.map((guest) =>
        prisma.guest.create({
          data: {
            eventId: id,
            fullName: guest.fullName,
            phoneNumber: guest.phoneNumber,
            notes: guest.notes,
            inviteToken: createInviteToken()
          }
        })
      )
    );

    return NextResponse.json({ imported: created.length }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
