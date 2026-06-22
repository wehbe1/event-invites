import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { UnauthorizedError } from "@/lib/auth";

export function jsonError(error: unknown) {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ error: "נדרשת התחברות" }, { status: 401 });
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "הנתונים שנשלחו אינם תקינים", details: error.flatten() },
      { status: 400 }
    );
  }

  if (process.env.NODE_ENV === "development" && error instanceof Error) {
    const message = `${error.name} ${error.message}`;

    if (
      message.includes("Can't reach database server") ||
      message.includes("ECONNREFUSED") ||
      message.includes("P1001")
    ) {
      return NextResponse.json(
        {
          error:
            "מסד הנתונים לא זמין. להרצה מקומית הפעילו npm run db:pglite, ואז npm run db:push ו-npm run db:seed."
        },
        { status: 500 }
      );
    }

    if (message.includes("prepared statement") && message.includes("already exists")) {
      return NextResponse.json(
        {
          error:
            "חיבור Prisma ל-PGlite צריך לכלול pgbouncer=true ב-DATABASE_URL."
        },
        { status: 500 }
      );
    }
  }

  console.error(error);
  return NextResponse.json(
    { error: "משהו השתבש. נסו שוב בעוד רגע." },
    { status: 500 }
  );
}

export function notFound(message = "לא נמצא") {
  return NextResponse.json({ error: message }, { status: 404 });
}
