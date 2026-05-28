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

export function PrivacyToggle() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("privacy-mode", enabled);
  }, [enabled]);
  return (
    <button onClick={() => setEnabled((value) => !value)} className="rounded-lg bg-mist px-4 py-3 text-sm font-black text-night">
      {enabled ? "Désactiver le mode confidentialité" : "Activer le mode confidentialité"}
    </button>
  );
}

export function SuspiciousActivityButton() {
  const [sent, setSent] = useState(false);
  return (
    <button onClick={() => setSent(true)} className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700">
      {sent ? "Signalement enregistré" : "Signaler une activité suspecte"}
    </button>
  );
}
