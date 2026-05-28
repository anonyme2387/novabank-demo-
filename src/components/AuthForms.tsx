"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Turnstile } from "@/components/Turnstile";

type Mode = "login" | "register";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
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

  const demos = [
    ["Alexandre", "alexandre.martin@novabank-app.com", "AxM#Secure2026!Bank"],
    ["Clara", "clara.dubois@novabank-app.com", "Clara$Vault2026!NB"],
    ["Yanis", "yanis.benali@novabank-app.com", "YB!Finance2026#Safe"],
    ["Admin", "admin@novabank-app.com", "NovaAdmin#Ultra2026!"]
  ];

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
      if (!res.ok) return setError(json.error ?? (mode === "login" ? "Connexion impossible pour le moment" : "Erreur"));
      router.push(json.role === "ADMIN" ? "/admin" : "/dashboard");
      router.refresh();
    } catch {
      setLoading(false);
      setError(mode === "login" ? "Connexion impossible pour le moment" : "Erreur");
    }
  }

  return (
    <form onSubmit={submit} className="glass mx-auto w-full max-w-lg space-y-4 rounded-2xl p-6 shadow-premium">
      {mode === "register" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <input name="firstName" required placeholder="Prénom" className="rounded-lg border border-line px-4 py-3" />
          <input name="lastName" required placeholder="Nom" className="rounded-lg border border-line px-4 py-3" />
        </div>
      )}
      {mode === "login" && (
        <div className="rounded-2xl bg-mist p-4">
          <p className="mb-3 text-sm font-black text-night">Comptes de présentation</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {demos.map(([label, demoEmail, demoPassword]) => (
              <button
                key={demoEmail}
                type="button"
                onClick={() => {
                  setEmail(demoEmail);
                  setPassword(demoPassword);
                }}
                className="tap rounded-lg bg-white px-3 py-2 text-left text-xs font-bold text-night shadow-sm"
              >
                Se connecter comme {label}
              </button>
            ))}
          </div>
        </div>
      )}
      <input name="email" value={email} onChange={(event) => setEmail(event.target.value)} required type="email" placeholder="Email" className="w-full rounded-lg border border-line px-4 py-3" />
      <div className="relative">
        <input name="password" value={password} onChange={(event) => setPassword(event.target.value)} required type={showPassword ? "text" : "password"} placeholder="Mot de passe" className="w-full rounded-lg border border-line px-4 py-3 pr-28" />
        <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-2 rounded-md bg-mist px-3 py-2 text-xs font-black text-night">
          {showPassword ? "Masquer" : "Afficher"}
        </button>
      </div>
      {mode === "register" && (
        <div className="grid grid-cols-5 gap-2">
          {[0, 1, 2, 3, 4].map((item) => <span key={item} className={`h-2 rounded-full ${item < score ? "bg-mint" : "bg-line"}`} />)}
        </div>
      )}
      {mode === "register" && (
        <input name="confirmPassword" required type="password" placeholder="Confirmer le mot de passe" className="w-full rounded-lg border border-line px-4 py-3" />
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
      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
      <button disabled={loading} className="tap w-full rounded-lg bg-night px-5 py-3 font-bold text-white shadow-lg shadow-slate-900/20 transition disabled:cursor-wait disabled:opacity-60">
        {loading ? "Sécurisation..." : mode === "register" ? "Ouvrir mon compte" : "Se connecter"}
      </button>
    </form>
  );
}
