"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");

  // Sin token no hay que llamar al API: estado de error directamente.
  useEffect(() => {
    if (!token) {
      return;
    }
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => {
        if (res.ok) {
          setState("ok");
          setTimeout(() => router.push("/"), 1500);
        } else {
          setState("error");
        }
      })
      .catch(() => setState("error"));
  }, [token, router]);

  if (!token) {
    return (
      <main className="mx-auto flex w-full max-w-sm flex-col items-center gap-4 px-5 py-14 text-center">
        <h1 className="text-2xl font-black text-red-400">Invalid or expired link</h1>
        <Link href="/login" className="text-sm text-neutral-300 underline hover:text-neutral-100">
          Go to login
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col items-center gap-4 px-5 py-14 text-center">
      {state === "loading" && <p className="text-neutral-400">Verifying…</p>}
      {state === "ok" && (
        <>
          <h1 className="text-2xl font-black text-emerald-400">Email verified</h1>
          <p className="text-sm text-neutral-400">You can now vote. Redirecting…</p>
        </>
      )}
      {state === "error" && (
        <>
          <h1 className="text-2xl font-black text-red-400">Invalid or expired link</h1>
          <Link href="/login" className="text-sm text-neutral-300 underline hover:text-neutral-100">
            Go to login
          </Link>
        </>
      )}
    </main>
  );
}