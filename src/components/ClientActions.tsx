"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function OperationButtons() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  async function run(mode: "deposit" | "withdrawal") {
    setMessage("");
    const amount = prompt(mode === "deposit" ? "Montant du dépôt fictif" : "Montant du retrait fictif");
    if (!amount) return;
    const res = await fetch("/api/account/operation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, amount, label: mode === "deposit" ? "Dépôt fictif" : "Retrait fictif" })
    });
    const json = await res.json();
    setMessage(res.ok ? "Opération virtuelle enregistrée." : json.error);
    router.refresh();
  }
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <button onClick={() => run("deposit")} className="rounded-lg bg-mint px-4 py-3 font-bold text-night">Dépôt fictif</button>
        <button onClick={() => run("withdrawal")} className="rounded-lg bg-night px-4 py-3 font-bold text-white">Retrait fictif</button>
      </div>
      {message && <p className="text-sm font-semibold text-steel">{message}</p>}
    </div>
  );
}

export function TransferForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipient: form.get("recipient"), amount: form.get("amount"), label: form.get("label") || "Virement fictif" })
    });
    const json = await res.json();
    setMessage(res.ok ? "Virement fictif envoyé." : json.error);
    if (res.ok) event.currentTarget.reset();
    router.refresh();
  }
  return (
    <form onSubmit={submit} className="glass space-y-4 rounded-2xl p-6 shadow-premium">
      <input name="recipient" required placeholder="Email ou IBAN fictif du destinataire" className="w-full rounded-lg border border-line px-4 py-3" />
      <input name="amount" required type="number" min="0.01" step="0.01" placeholder="Montant virtuel" className="w-full rounded-lg border border-line px-4 py-3" />
      <input name="label" placeholder="Libellé" className="w-full rounded-lg border border-line px-4 py-3" />
      <button className="w-full rounded-lg bg-night px-5 py-3 font-bold text-white">Envoyer le virement fictif</button>
      {message && <p className="text-sm font-semibold text-steel">{message}</p>}
    </form>
  );
}

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
      className="rounded-lg bg-night px-5 py-3 font-bold text-white"
    >
      Déconnexion
    </button>
  );
}

export function PasswordForm() {
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/profile/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: form.get("currentPassword"), newPassword: form.get("newPassword") })
    });
    const json = await res.json();
    setMessage(res.ok ? "Mot de passe modifié." : json.error);
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <input name="currentPassword" type="password" placeholder="Mot de passe actuel" className="w-full rounded-lg border border-line px-4 py-3" />
      <input name="newPassword" type="password" placeholder="Nouveau mot de passe" className="w-full rounded-lg border border-line px-4 py-3" />
      <button className="rounded-lg bg-night px-5 py-3 font-bold text-white">Changer le mot de passe</button>
      {message && <p className="text-sm font-semibold text-steel">{message}</p>}
    </form>
  );
}

export function AdminAccountActions({ accountId, status }: { accountId: string; status: "ACTIVE" | "BLOCKED" }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  async function adjust(mode: "add" | "remove") {
    const amount = prompt(mode === "add" ? "Montant virtuel à ajouter" : "Montant virtuel à retirer");
    if (!amount) return;
    const res = await fetch(`/api/admin/accounts/${accountId}/adjust`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, amount, label: "Ajustement admin fictif" })
    });
    const json = await res.json();
    setMessage(res.ok ? "Solde virtuel ajusté." : json.error);
    router.refresh();
  }
  async function toggle() {
    const next = status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    const res = await fetch(`/api/admin/accounts/${accountId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next })
    });
    const json = await res.json();
    setMessage(res.ok ? "Statut mis à jour." : json.error);
    router.refresh();
  }
  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={() => adjust("add")} className="rounded-md bg-mint px-3 py-2 text-xs font-bold text-night">Ajouter</button>
      <button onClick={() => adjust("remove")} className="rounded-md bg-mist px-3 py-2 text-xs font-bold text-night">Retirer</button>
      <button onClick={toggle} className="rounded-md bg-night px-3 py-2 text-xs font-bold text-white">{status === "ACTIVE" ? "Bloquer" : "Débloquer"}</button>
      {message && <span className="text-xs font-semibold text-steel">{message}</span>}
    </div>
  );
}
