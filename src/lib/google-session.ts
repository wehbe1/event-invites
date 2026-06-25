import { prisma } from "@/lib/prisma";
import { signSession } from "@/lib/auth";
import { verifyGoogleIdToken } from "@/lib/firebase/admin";

export async function createGoogleSession(credential: string) {
  const decodedToken = await verifyGoogleIdToken(credential);

  if (!decodedToken.uid || !decodedToken.email) {
    throw new Error("חשבון Google חייב לכלול כתובת מייל");
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

  return { user, token };
}
