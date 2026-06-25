import { createRemoteJWKSet, jwtVerify } from "jose";

const firebaseJwks = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
  )
);
const googleJwks = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs")
);

export async function verifyFirebaseIdToken(idToken: string) {
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (!projectId) {
    throw new Error("Firebase is not configured. Set FIREBASE_PROJECT_ID.");
  }

  const { payload } = await jwtVerify(idToken, firebaseJwks, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId
  });

  return {
    uid: payload.sub,
    email: typeof payload.email === "string" ? payload.email : undefined,
    name: typeof payload.name === "string" ? payload.name : undefined
  };
}

export async function verifyGoogleIdToken(idToken: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error("Google login is not configured. Set GOOGLE_CLIENT_ID.");
  }

  const { payload } = await jwtVerify(idToken, googleJwks, {
    issuer: ["https://accounts.google.com", "accounts.google.com"],
    audience: clientId
  });

  return {
    uid: payload.sub,
    email: typeof payload.email === "string" ? payload.email : undefined,
    name: typeof payload.name === "string" ? payload.name : undefined
  };
}
