import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {
      name: "מארגן/ת לדוגמה",
      passwordHash
    },
    create: {
      email: "demo@example.com",
      name: "מארגן/ת לדוגמה",
      passwordHash
    }
  });

  const event = await prisma.event.upsert({
    where: { id: "demo-event" },
    update: {
      location: "גן אורנים, השרון",
      locationName: "גן אורנים",
      address: "השרון",
      latitude: 32.173247,
      longitude: 34.843512,
      googleMapsUrl: "https://www.google.com/maps?q=32.173247,34.843512",
      wazeUrl: "https://waze.com/ul?ll=32.173247,34.843512&navigate=yes",
      bitPhoneNumber: "050-000-0000"
    },
    create: {
      id: "demo-event",
      userId: user.id,
      title: "אירוע של נועה ועידו",
      date: new Date("2026-09-04T12:00:00.000Z"),
      time: "19:30",
      location: "גן אורנים, השרון",
      locationName: "גן אורנים",
      address: "השרון",
      latitude: 32.173247,
      longitude: 34.843512,
      googleMapsUrl: "https://www.google.com/maps?q=32.173247,34.843512",
      wazeUrl: "https://waze.com/ul?ll=32.173247,34.843512&navigate=yes",
      bitPhoneNumber: "050-000-0000",
      description: "קבלת פנים, חופה וריקודים",
      organizerName: "נועה ועידו"
    }
  });

  const guests = [
    {
      fullName: "דנה כהן",
      phoneNumber: "050-123-4567",
      status: "confirmed" as const,
      giftAmount: "500",
      inviteToken: "demo-dana"
    },
    {
      fullName: "איתי לוי",
      phoneNumber: "052-555-9876",
      status: "pending" as const,
      giftAmount: "0",
      inviteToken: "demo-itay"
    },
    {
      fullName: "מאיה ישראלי",
      phoneNumber: "054-222-1111",
      status: "gift_only" as const,
      giftAmount: "360",
      inviteToken: "demo-maya"
    },
    {
      fullName: "רועי בר",
      phoneNumber: "053-987-6543",
      status: "declined" as const,
      giftAmount: "0",
      inviteToken: "demo-roy"
    }
  ];

  for (const guest of guests) {
    await prisma.guest.upsert({
      where: { inviteToken: guest.inviteToken },
      update: {
        status: guest.status,
        giftAmount: guest.giftAmount
      },
      create: {
        eventId: event.id,
        fullName: guest.fullName,
        phoneNumber: guest.phoneNumber,
        status: guest.status,
        giftAmount: guest.giftAmount,
        inviteToken: guest.inviteToken,
        notes: "נתוני דמו"
      }
    });
  }

  await prisma.invitationLog.createMany({
    data: [
      {
        guestId: (
          await prisma.guest.findUniqueOrThrow({
            where: { inviteToken: "demo-dana" }
          })
        ).id,
        channel: "whatsapp",
        status: "link_generated"
      },
      {
        guestId: (
          await prisma.guest.findUniqueOrThrow({
            where: { inviteToken: "demo-itay" }
          })
        ).id,
        channel: "sms",
        status: "link_generated"
      }
    ],
    skipDuplicates: true
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
