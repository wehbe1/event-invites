import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { eventSchema } from "@/lib/validators";
import { jsonError, notFound } from "@/lib/http";
import { serializeEvent } from "@/lib/serializers";
import { normalizeEventLocation } from "@/lib/location";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    const event = await prisma.event.findFirst({
      where: { id, userId: user.id },
      include: {
        guests: {
          include: {
            invitationLogs: {
              orderBy: { sentAt: "desc" },
              take: 5
            }
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!event) {
      return notFound("האירוע לא נמצא");
    }

    return NextResponse.json({ event: serializeEvent(event) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    const existing = await prisma.event.findFirst({
      where: { id, userId: user.id }
    });

    if (!existing) {
      return notFound("האירוע לא נמצא");
    }

    const data = eventSchema.partial().parse(await request.json());
    const location = normalizeEventLocation({
      location: data.location ?? existing.location,
      locationName: data.locationName ?? existing.locationName,
      address: data.address ?? existing.address,
      latitude: data.latitude === undefined ? existing.latitude : data.latitude,
      longitude:
        data.longitude === undefined ? existing.longitude : data.longitude,
      googleMapsUrl: data.googleMapsUrl ?? existing.googleMapsUrl,
      wazeUrl: data.wazeUrl ?? existing.wazeUrl
    });
    const event = await prisma.event.update({
      where: { id },
      data: {
        title: data.title,
        date: data.date ? new Date(`${data.date}T12:00:00.000Z`) : undefined,
        time: data.time,
        location: location.location,
        locationName: location.locationName,
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        googleMapsUrl: location.googleMapsUrl,
        wazeUrl: location.wazeUrl,
        description: data.description,
        organizerName: data.organizerName
      },
      include: { guests: true }
    });

    return NextResponse.json({ event: serializeEvent(event) });
  } catch (error) {
    return jsonError(error);
  }
}
