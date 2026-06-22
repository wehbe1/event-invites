import bcrypt from "bcryptjs";
import { NextResponse, type NextRequest } from "next/server";
import { loginSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { setSessionCookie, signSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);
    const email = data.email.toLowerCase();

    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      if (!user.passwordHash) {
        return NextResponse.json(
          { error: "החשבון הזה מחובר דרך Google" },
          { status: 401 }
        );
      }

      const passwordMatches = await bcrypt.compare(
        data.password,
        user.passwordHash
      );

      if (!passwordMatches) {
        return NextResponse.json(
          { error: "הסיסמה אינה תואמת לחשבון הזה" },
          { status: 401 }
        );
      }
    } else {
      const passwordHash = await bcrypt.hash(data.password, 12);
      user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name: data.name ?? email.split("@")[0]
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
