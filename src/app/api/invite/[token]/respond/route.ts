import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { inviteResponseSchema } from "@/lib/validators";
import { jsonError, notFound } from "@/lib/http";
import { BitBusinessPlaceholder } from "@/lib/integrations";
import { serializeGuest } from "@/lib/serializers";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { token } = await params;
    const data = inviteResponseSchema.parse(await request.json());
    const guest = await prisma.guest.findUnique({
      where: { inviteToken: token },
      include: { event: true }
    });

    if (!guest) {
      return notFound("ההזמנה לא נמצאה");
    }

    const updated = await prisma.guest.update({
      where: { id: guest.id },
      data: { status: data.status }
    });

    const payment =
      data.status === "gift_only"
        ? await new BitBusinessPlaceholder().createPaymentLink({
            guestId: guest.id,
            eventId: guest.eventId
          })
        : null;

    return NextResponse.json({
      guest: serializeGuest(updated),
      paymentUrl: payment?.url ?? null
    });
  } catch (error) {
    return jsonError(error);
  }
}
