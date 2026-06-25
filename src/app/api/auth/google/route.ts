import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { jsonError } from "@/lib/http";
import { setSessionCookie } from "@/lib/auth";
import { createGoogleSession } from "@/lib/google-session";

export const runtime = "nodejs";

const googleLoginSchema = z.object({
  credential: z.string().min(20)
});

export async function POST(request: NextRequest) {
  try {
    const { credential } = googleLoginSchema.parse(await request.json());
    const { user, token } = await createGoogleSession(credential);

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name }
    });
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
