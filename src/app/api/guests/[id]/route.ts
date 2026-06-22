import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { updateGuestSchema } from "@/lib/validators";
import { jsonError, notFound } from "@/lib/http";
import { serializeGuest } from "@/lib/serializers";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    const data = updateGuestSchema.parse(await request.json());
    const guest = await prisma.guest.findFirst({
      where: {
        id,
        event: { userId: user.id }
      }
    });

    if (!guest) {
      return notFound("האורח/ת לא נמצאו");
    }

    const updated = await prisma.guest.update({
      where: { id },
      data: {
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        status: data.status,
        giftAmount:
          data.giftAmount === undefined ? undefined : data.giftAmount.toString(),
        notes: data.notes
      },
      include: {
        invitationLogs: {
          orderBy: { sentAt: "desc" },
          take: 3
        }
      }
    });

    return NextResponse.json({ guest: serializeGuest(updated) });
  } catch (error) {
    return jsonError(error);
  }
}
