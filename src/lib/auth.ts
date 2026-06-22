import { jwtVerify, SignJWT } from "jose";
import type { NextRequest, NextResponse } from "next/server";

export const SESSION_COOKIE = "event_invites_session";
const maxAgeSeconds = 60 * 60 * 24 * 14;

export type SessionUser = {
  id: string;
  email: string;
  name: string;
};

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

function getSecret() {
  const secret =
    process.env.AUTH_SECRET ??
    "development-only-secret-change-me-before-production";
  return new TextEncoder().encode(secret);
}

export async function signSession(user: SessionUser) {
  return new SignJWT({
    email: user.email,
    name: user.name
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSeconds}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret());

    if (!payload.sub || !payload.email || !payload.name) {
      return null;
    }

    return {
      id: payload.sub,
      email: String(payload.email),
      name: String(payload.name)
    } satisfies SessionUser;
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

export async function requireUser(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    throw new UnauthorizedError();
  }

  return session;
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}
