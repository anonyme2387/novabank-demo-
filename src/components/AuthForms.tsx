"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Turnstile } from "@/components/Turnstile";

type Mode = "login" | "register";

export function AuthForm({ mode, initialError = "" }: { mode: Mode; initialError?: string }) {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const score = useMemo(() => [
    password.length >= 10,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password)
  ].filter(Boolean).length, [password]);

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
            confirmPassword: data.get("confirmPassword"),
            acceptedTerms: data.get("acceptedTerms") === "on",
            turnstileToken: token
          }
        : { email: data.get("email"), password: data.get("password"), turnstileToken: token };
    try {
      const res = await fetch(`/api/auth/${mode === "register" ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      setLoading(false);
      if (!res.ok) return setError(json.error ?? (mode === "login" ? "Service momentanément indisponible" : "Erreur"));
      router.push(json.role === "ADMIN" ? "/admin" : "/dashboard");
      router.refresh();
    } catch {
      setLoading(false);
      setError(mode === "login" ? "Service momentanément indisponible" : "Erreur");
    }
  }

  return (
    <form onSubmit={submit} className="glass animate-rise mx-auto w-full max-w-lg space-y-4 rounded-[1.6rem] p-6 shadow-premium md:p-8">
      {mode === "register" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <input name="firstName" required placeholder="Prénom" className="rounded-xl border border-line bg-white/90 px-4 py-3 outline-none transition focus:border-night focus:ring-4 focus:ring-slate-900/10" />
          <input name="lastName" required placeholder="Nom" className="rounded-xl border border-line bg-white/90 px-4 py-3 outline-none transition focus:border-night focus:ring-4 focus:ring-slate-900/10" />
        </div>
      )}
      <input name="email" value={email} onChange={(event) => setEmail(event.target.value)} required type="email" placeholder="Email" className="w-full rounded-xl border border-line bg-white/90 px-4 py-3 outline-none transition focus:border-night focus:ring-4 focus:ring-slate-900/10" />
      <div className="relative">
        <input name="password" value={password} onChange={(event) => setPassword(event.target.value)} required type={showPassword ? "text" : "password"} placeholder="Mot de passe" className="w-full rounded-xl border border-line bg-white/90 px-4 py-3 pr-28 outline-none transition focus:border-night focus:ring-4 focus:ring-slate-900/10" />
        <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-2 rounded-lg bg-mist px-3 py-2 text-xs font-black text-night transition hover:bg-slate-200">
          {showPassword ? "Cacher" : "Afficher"}
        </button>
      </div>
      {mode === "register" && (
        <div className="grid grid-cols-5 gap-2">
          {[0, 1, 2, 3, 4].map((item) => <span key={item} className={`h-2 rounded-full ${item < score ? "bg-mint" : "bg-line"}`} />)}
        </div>
      )}
      {mode === "register" && (
        <input name="confirmPassword" required type="password" placeholder="Confirmer le mot de passe" className="w-full rounded-xl border border-line bg-white/90 px-4 py-3 outline-none transition focus:border-night focus:ring-4 focus:ring-slate-900/10" />
      )}
      {mode === "register" && (
        <p className="rounded-xl bg-mist px-4 py-3 text-xs font-semibold leading-5 text-steel">
          Minimum 10 caractères avec majuscule, minuscule, chiffre et caractère spécial.
        </p>
      )}
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
      {error && <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 shadow-sm">{error}</p>}
      <button disabled={loading} className="tap flex w-full items-center justify-center gap-3 rounded-xl bg-night px-5 py-3 font-bold text-white shadow-lg shadow-slate-900/20 transition disabled:cursor-wait disabled:opacity-70">
        {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
        {loading ? "Connexion..." : mode === "register" ? "Ouvrir mon compte" : "Se connecter"}
      </button>
    </form>
  );
}
