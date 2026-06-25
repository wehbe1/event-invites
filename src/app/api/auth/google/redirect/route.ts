import { NextResponse, type NextRequest } from "next/server";
import { jsonError } from "@/lib/http";
import { setSessionCookie } from "@/lib/auth";
import { createGoogleSession } from "@/lib/google-session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const credential = formData.get("credential");

    if (typeof credential !== "string" || credential.length < 20) {
      return NextResponse.redirect(new URL("/login?error=google", request.url));
    }

    const { token } = await createGoogleSession(credential);
    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.redirect(new URL("/login?error=google", request.url));
    }

    return jsonError(error);
  }
}
