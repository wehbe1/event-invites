"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck } from "lucide-react";
import { Button } from "@/components/Button";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            ux_mode: "redirect";
            login_uri: string;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with";
              shape?: "rectangular" | "pill" | "circle" | "square";
              width?: number;
            }
          ) => void;
        };
      };
    };
  }
}

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function LoginPage() {
  const router = useRouter();
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState("");
  const [demoLoading, setDemoLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "google") {
      setError("לא הצלחנו להשלים את הכניסה עם Google. נסו שוב בעוד רגע.");
    }
  }, []);

  function renderGoogleButton() {
    if (!googleClientId || !window.google || !googleButtonRef.current) {
      setGoogleReady(false);
      return;
    }

    const loginUri = `${window.location.origin}/api/auth/google/redirect`;

    googleButtonRef.current.innerHTML = "";
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      ux_mode: "redirect",
      login_uri: loginUri
    });
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: "outline",
      size: "large",
      text: "signin_with",
      shape: "rectangular",
      width: 320
    });
    setGoogleReady(true);
  }

  async function loginDemo() {
    setDemoLoading(true);
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "demo@example.com",
        password: "password123",
        name: "מארגן/ת לדוגמה"
      })
    });

    setDemoLoading(false);

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.error ?? "לא הצלחנו להיכנס לדמו");
      return;
    }

    router.replace("/dashboard");
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={renderGoogleButton}
      />
      <main className="grid min-h-screen place-items-center px-4 py-10">
        <section className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl md:grid-cols-[1fr_1.1fr]">
          <div className="bg-slate-950 p-8 text-white md:p-10">
            <div className="inline-grid size-12 place-items-center rounded-lg bg-indigo-500">
              <CalendarCheck size={25} aria-hidden="true" />
            </div>
            <h1 className="mt-8 text-3xl font-bold leading-tight">
              ניהול הזמנות לאירוע
            </h1>
            <div className="mt-8 grid gap-3 text-sm text-slate-200">
              <div className="rounded-lg bg-white/10 p-4">
                אירוע של נועה ועידו בתאריך 04.09 במקום גן אורנים
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-emerald-500/20 p-3 text-center">
                  128
                  <span className="block text-xs text-emerald-100">מאשרים</span>
                </div>
                <div className="rounded-lg bg-amber-500/20 p-3 text-center">
                  42
                  <span className="block text-xs text-amber-100">ממתינים</span>
                </div>
                <div className="rounded-lg bg-sky-500/20 p-3 text-center">
                  ₪18K
                  <span className="block text-xs text-sky-100">מתנות</span>
                </div>
              </div>
            </div>
          </div>

          <section className="grid content-center gap-5 p-6 md:p-10">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">כניסה</h2>
              <p className="mt-2 text-sm text-slate-500">
                התחברות מאובטחת באמצעות חשבון Google.
              </p>
            </div>

            {error ? (
              <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                {error}
              </div>
            ) : null}

            <div className="grid justify-items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-4">
              <div ref={googleButtonRef} />
              {!googleClientId ? (
                <div className="text-sm font-semibold text-rose-700">
                  חסר NEXT_PUBLIC_GOOGLE_CLIENT_ID בהגדרות הסביבה.
                </div>
              ) : !googleReady ? (
                <div className="text-sm font-semibold text-slate-500">
                  טוען כפתור Google...
                </div>
              ) : null}
            </div>

            <Button
              variant="ghost"
              disabled={demoLoading}
              onClick={loginDemo}
              className="w-full"
            >
              {demoLoading ? "נכנס..." : "כניסת דמו מקומית"}
            </Button>
          </section>
        </section>
      </main>
    </>
  );
}
