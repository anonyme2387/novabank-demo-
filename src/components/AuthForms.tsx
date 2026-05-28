"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Turnstile } from "@/components/Turnstile";

type Mode = "login" | "register";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const data = new FormData(event.currentTarget);
    const payload =
      mode === "register"
        ? {
            firstName: data.get("firstName"),
            lastName: data.get("lastName"),
            email: data.get("email"),
            password: data.get("password"),
            acceptedTerms: data.get("acceptedTerms") === "on",
            turnstileToken: token
          }
        : { email: data.get("email"), password: data.get("password"), turnstileToken: token };
    const res = await fetch(`/api/auth/${mode === "register" ? "register" : "login"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) return setError(json.error ?? "Erreur");
    router.push(json.role === "ADMIN" ? "/admin" : "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="glass mx-auto w-full max-w-lg space-y-4 rounded-2xl p-6 shadow-premium">
      {mode === "register" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <input name="firstName" required placeholder="Prénom" className="rounded-lg border border-line px-4 py-3" />
          <input name="lastName" required placeholder="Nom" className="rounded-lg border border-line px-4 py-3" />
        </div>
      )}
      <input name="email" required type="email" placeholder="Email" className="w-full rounded-lg border border-line px-4 py-3" />
      <input name="password" required type="password" placeholder="Mot de passe" className="w-full rounded-lg border border-line px-4 py-3" />
      {mode === "register" && (
        <label className="flex gap-3 text-sm text-steel">
          <input name="acceptedTerms" type="checkbox" required className="mt-1" />
          <span>
            J’accepte les{" "}
            <Link href="/conditions-utilisation" className="font-semibold text-night underline">
              conditions d’utilisation
            </Link>
            .
          </span>
        </label>
      )}
      <Turnstile onVerify={setToken} />
      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
      <button disabled={loading} className="tap w-full rounded-lg bg-night px-5 py-3 font-bold text-white shadow-lg shadow-slate-900/20 transition disabled:cursor-wait disabled:opacity-60">
        {loading ? "Sécurisation..." : mode === "register" ? "Ouvrir mon compte" : "Se connecter"}
      </button>
    </form>
  );
}
