import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { jsonError, notFound } from "@/lib/http";
import { statusLabels } from "@/lib/format";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function csvCell(value: string | number | null | undefined) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    const event = await prisma.event.findFirst({
      where: { id, userId: user.id },
      include: { guests: { orderBy: { fullName: "asc" } } }
    });

    if (!event) {
      return notFound("האירוע לא נמצא");
    }

    const rows = [
      ["שם מלא", "טלפון", "סטטוס", "סכום מתנה", "הערות", "קישור אישי"],
      ...event.guests.map((guest) => [
        guest.fullName,
        guest.phoneNumber,
        statusLabels[guest.status],
        Number(guest.giftAmount),
        guest.notes ?? "",
        `${request.nextUrl.origin}/invite/${guest.inviteToken}`
      ])
    ];

    const csv = `\uFEFF${rows
      .map((row) => row.map(csvCell).join(","))
      .join("\n")}`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${event.title}-guests.csv"`
      }
    });
  } catch (error) {
    return jsonError(error);
  }
}
