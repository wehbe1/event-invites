"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { CalendarCheck, LogIn } from "lucide-react";
import { Button } from "@/components/Button";
import { firebaseAuth, googleProvider } from "@/lib/firebase/client";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  async function loginWithGoogle() {
    setLoading(true);
    setError("");

    try {
      const credential = await signInWithPopup(firebaseAuth, googleProvider);
      const idToken = await credential.user.getIdToken();

      const response = await fetch("/api/auth/firebase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken })
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "לא הצלחנו להיכנס עם Google");
      }

      router.replace("/dashboard");
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "לא הצלחנו להיכנס עם Google"
      );
    } finally {
      setLoading(false);
    }
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

          <Button
            icon={<LogIn size={18} aria-hidden="true" />}
            disabled={loading}
            onClick={loginWithGoogle}
            className="w-full"
          >
            {loading ? "מתחבר..." : "כניסה עם Google"}
          </Button>

          {process.env.NODE_ENV === "development" ? (
            <Button
              variant="ghost"
              disabled={demoLoading}
              onClick={loginDemo}
              className="w-full"
            >
              {demoLoading ? "נכנס..." : "כניסת דמו מקומית"}
            </Button>
          ) : null}
        </section>
      </section>
    </main>
  );
}
