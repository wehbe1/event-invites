import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { eventSchema } from "@/lib/validators";
import { jsonError } from "@/lib/http";
import { serializeEvent } from "@/lib/serializers";
import { normalizeEventLocation } from "@/lib/location";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const events = await prisma.event.findMany({
      where: { userId: user.id },
      include: { guests: true },
      orderBy: { date: "asc" }
    });

    return NextResponse.json({
      events: events.map(serializeEvent)
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const data = eventSchema.parse(await request.json());
    const location = normalizeEventLocation(data);

    const event = await prisma.event.create({
      data: {
        userId: user.id,
        title: data.title,
        date: new Date(`${data.date}T12:00:00.000Z`),
        time: data.time,
        location: location.location,
        locationName: location.locationName,
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        googleMapsUrl: location.googleMapsUrl,
        wazeUrl: location.wazeUrl,
        bitPhoneNumber: data.bitPhoneNumber,
        description: data.description,
        organizerName: data.organizerName
      },
      include: { guests: true }
    });

    return NextResponse.json({ event: serializeEvent(event) }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
