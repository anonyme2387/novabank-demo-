"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function AutoLogout() {
  const router = useRouter();
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/connexion");
      }, 15 * 60 * 1000);
    };
    reset();
    ["click", "keydown", "mousemove", "touchstart"].forEach((event) => window.addEventListener(event, reset));
    return () => {
      clearTimeout(timer);
      ["click", "keydown", "mousemove", "touchstart"].forEach((event) => window.removeEventListener(event, reset));
    };
  }, [router]);
  return null;
}

export function SuspiciousActivityButton() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  async function report() {
    setLoading(true);
    const response = await fetch("/api/security/report", { method: "POST" });
    setSent(response.ok);
    setLoading(false);
  }
  return (
    <button onClick={report} disabled={loading || sent} className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700 disabled:opacity-70">
      {sent ? "Signalement enregistré" : loading ? "Enregistrement..." : "Signaler une activité suspecte"}
    </button>
  );
}
