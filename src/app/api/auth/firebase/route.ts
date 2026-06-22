import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { setSessionCookie, signSession } from "@/lib/auth";
import { verifyFirebaseIdToken } from "@/lib/firebase/admin";

export const runtime = "nodejs";

const firebaseLoginSchema = z.object({
  idToken: z.string().min(20)
});

export async function POST(request: NextRequest) {
  try {
    const { idToken } = firebaseLoginSchema.parse(await request.json());
    const decodedToken = await verifyFirebaseIdToken(idToken);

    if (!decodedToken.uid || !decodedToken.email) {
      return NextResponse.json(
        { error: "חשבון Google חייב לכלול כתובת מייל" },
        { status: 400 }
      );
    }

    const email = decodedToken.email.toLowerCase();
    const name = decodedToken.name ?? email.split("@")[0];

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ firebaseUid: decodedToken.uid }, { email }]
      }
    });

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          firebaseUid: decodedToken.uid,
          email,
          name
        }
      });
    } else {
      user = await prisma.user.create({
        data: {
          firebaseUid: decodedToken.uid,
          email,
          name
        }
      });
    }

    const token = await signSession({
      id: user.id,
      email: user.email,
      name: user.name
    });

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name }
    });
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
