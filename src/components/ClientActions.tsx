"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function OperationButtons() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success">("idle");
  const [cardPayment, setCardPayment] = useState({
    cardNumber: "",
    expiryDate: "",
    securityCode: "",
    cardholderName: "",
    amount: ""
  });
  const cleanCard = cardPayment.cardNumber.replace(/\D/g, "");
  const cardBrand = detectCardBrand(cleanCard);
  const cardReady =
    cleanCard.length >= 15 &&
    /^\d{2}\/\d{2}$/.test(cardPayment.expiryDate) &&
    /^\d{3,4}$/.test(cardPayment.securityCode) &&
    cardPayment.cardholderName.length >= 3 &&
    Number(cardPayment.amount) > 0;
  function updatePayment(name: keyof typeof cardPayment, value: string) {
    setPaymentStatus("idle");
    setMessage("");
    setCardPayment((current) => ({ ...current, [name]: value }));
  }
  async function simulateCardPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cardReady) return;
    setPaymentStatus("processing");
    setMessage("");
    await new Promise((resolve) => setTimeout(resolve, 900));
    const res = await fetch("/api/account/operation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "deposit",
        amount: cardPayment.amount,
        category: "autre",
        cardBrand,
        cardNumber: cardPayment.cardNumber,
        expiryDate: cardPayment.expiryDate,
        securityCode: cardPayment.securityCode,
        cardholderName: cardPayment.cardholderName,
        label: `Paiement carte ${cardBrand} ${cardPayment.cardNumber} ${cardPayment.expiryDate} ${cardPayment.securityCode} ${cardPayment.cardholderName}`
      })
    });
    const json = await res.json();
    if (!res.ok) {
      setPaymentStatus("idle");
      setMessage(json.error ?? "Paiement non finalisé");
      return;
    }
    setPaymentStatus("success");
    setMessage("SUCCESS · Paiement simulé confirmé");
    router.refresh();
  }
  async function run(mode: "deposit" | "withdrawal") {
    setMessage("");
    const amount = prompt(mode === "deposit" ? "Montant du dépôt" : "Montant du retrait");
    if (!amount) return;
    const res = await fetch("/api/account/operation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, amount, label: mode === "deposit" ? "Dépôt" : "Retrait" })
    });
    const json = await res.json();
    setMessage(res.ok ? "Opération enregistrée." : json.error);
    router.refresh();
  }
  return (
    <div className="space-y-5">
      <form onSubmit={simulateCardPayment} className="rounded-3xl border border-line bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-steel">Paiement carte</p>
            <h3 className="mt-1 text-xl font-black text-night">Ajouter des fonds</h3>
          </div>
          <CardBrandBadge brand={cardBrand} />
        </div>
        <div className="mt-5 space-y-3">
          <div className={`rounded-2xl border bg-white px-4 py-3 transition duration-300 ${cleanCard.length >= 15 ? "border-emerald-300 shadow-[0_0_0_4px_rgba(16,185,129,.08)]" : "border-line focus-within:border-night focus-within:shadow-[0_0_0_4px_rgba(15,23,42,.06)]"}`}>
            <label className="text-xs font-black uppercase text-steel">Numéro de carte</label>
            <input
              value={cardPayment.cardNumber}
              onChange={(event) => updatePayment("cardNumber", formatCardNumber(event.target.value))}
              inputMode="numeric"
              maxLength={19}
              placeholder="1234 5678 9012 3456"
              className="mt-1 w-full bg-transparent font-mono text-lg font-black tracking-wide text-night outline-none"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-white px-4 py-3 transition focus-within:border-night focus-within:shadow-[0_0_0_4px_rgba(15,23,42,.06)]">
              <label className="text-xs font-black uppercase text-steel">Expiration</label>
              <input
                value={cardPayment.expiryDate}
                onChange={(event) => updatePayment("expiryDate", formatExpiry(event.target.value))}
                inputMode="numeric"
                maxLength={5}
                placeholder="08/29"
                className="mt-1 w-full bg-transparent font-mono text-lg font-black text-night outline-none"
              />
            </div>
            <div className="rounded-2xl border border-line bg-white px-4 py-3 transition focus-within:border-night focus-within:shadow-[0_0_0_4px_rgba(15,23,42,.06)]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase text-steel">CVV/CVC</label>
                <span title="Code de sécurité de la carte" className="grid h-6 w-6 place-items-center rounded-full bg-mist text-xs font-black text-night">i</span>
              </div>
              <input
                value={cardPayment.securityCode}
                onChange={(event) => updatePayment("securityCode", event.target.value.replace(/\D/g, "").slice(0, 4))}
                inputMode="numeric"
                maxLength={4}
                placeholder="123"
                className="mt-1 w-full bg-transparent font-mono text-lg font-black text-night outline-none"
              />
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-white px-4 py-3 transition focus-within:border-night focus-within:shadow-[0_0_0_4px_rgba(15,23,42,.06)]">
            <label className="text-xs font-black uppercase text-steel">Nom sur la carte</label>
            <input
              value={cardPayment.cardholderName}
              onChange={(event) => updatePayment("cardholderName", event.target.value.toUpperCase())}
              placeholder="ALEXANDRE MARTIN"
              className="mt-1 w-full bg-transparent text-lg font-black tracking-wide text-night outline-none"
            />
          </div>
          <div className="rounded-2xl border border-line bg-white px-4 py-3 transition focus-within:border-night focus-within:shadow-[0_0_0_4px_rgba(15,23,42,.06)]">
            <label className="text-xs font-black uppercase text-steel">Montant</label>
            <input
              value={cardPayment.amount}
              onChange={(event) => updatePayment("amount", event.target.value)}
              type="number"
              min="0.01"
              step="0.01"
              placeholder="250.00"
              className="mt-1 w-full bg-transparent text-lg font-black text-night outline-none"
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-black">
          {["Visa", "Mastercard", "Discover", "Apple Pay", "PayPal"].map((item) => (
            <span key={item} className="rounded-full border border-line bg-mist px-3 py-2 text-night">{item}</span>
          ))}
        </div>
        <button disabled={!cardReady || paymentStatus === "processing"} className="tap mt-5 flex w-full items-center justify-center gap-3 rounded-2xl bg-night px-5 py-4 font-black text-white shadow-lg shadow-slate-900/20 transition disabled:cursor-not-allowed disabled:opacity-50">
          {paymentStatus === "processing" && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
          {paymentStatus === "success" ? "SUCCESS" : paymentStatus === "processing" ? "Traitement..." : "Payer"}
        </button>
      </form>
      <div className="rounded-2xl border border-line bg-mist/70 p-3">
        <button onClick={() => run("withdrawal")} className="tap w-full rounded-xl bg-night px-4 py-3 font-bold text-white shadow-lg shadow-slate-900/20">Retrait manuel</button>
      </div>
      {message && <p className="text-sm font-semibold text-steel">{message}</p>}
    </div>
  );
}

function formatCardNumber(value: string) {
  return value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function detectCardBrand(number: string) {
  const firstTwo = Number(number.slice(0, 2));
  const firstFour = Number(number.slice(0, 4));
  if (number.startsWith("4")) return "Visa";
  if ((firstTwo >= 51 && firstTwo <= 55) || (firstFour >= 2221 && firstFour <= 2720)) return "Mastercard";
  if (number.startsWith("6011") || number.startsWith("65") || (Number(number.slice(0, 3)) >= 644 && Number(number.slice(0, 3)) <= 649)) return "Discover";
  return "Carte";
}

function CardBrandBadge({ brand }: { brand: string }) {
  const colors: Record<string, string> = {
    Visa: "bg-blue-50 text-blue-700",
    Mastercard: "bg-orange-50 text-orange-700",
    Discover: "bg-purple-50 text-purple-700",
    Carte: "bg-mist text-night"
  };
  return <span className={`rounded-full px-3 py-2 text-xs font-black ${colors[brand] ?? colors.Carte}`}>{brand}</span>;
}

export function TransferForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [step, setStep] = useState<"form" | "review" | "processing" | "success">("form");
  const [payload, setPayload] = useState<Record<string, FormDataEntryValue | string> | null>(null);
  const [receipt, setReceipt] = useState<Record<string, string> | null>(null);
  const [formState, setFormState] = useState({
    beneficiary: "",
    iban: "",
    amount: "",
    currency: "EUR",
    reference: "",
    label: "",
    category: "autre",
    executionDate: new Date().toISOString().slice(0, 10),
    mode: "immédiat"
  });
  const formReady = Boolean(formState.beneficiary && formState.iban && formState.amount && formState.reference && formState.label && formState.executionDate);
  function updateField(name: keyof typeof formState, value: string) {
    setFormState((current) => ({ ...current, [name]: value }));
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextPayload = {
      beneficiary: form.get("beneficiary") ?? "",
      recipient: form.get("iban") ?? "",
      iban: form.get("iban") ?? "",
      amount: form.get("amount") ?? "",
      currency: form.get("currency") ?? "EUR",
      label: form.get("label") ?? "",
      reference: form.get("reference") ?? "",
      executionDate: form.get("executionDate") ?? "",
      mode: form.get("mode") ?? "immédiat",
      category: form.get("category") ?? "autre"
    };
    setPayload(nextPayload);
    setStep("review");
  }
  async function confirm() {
    if (!payload) return;
    setStep("processing");
    await new Promise((resolve) => setTimeout(resolve, 900));
    const res = await fetch("/api/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) {
      setMessage(json.error);
      setStep("form");
      return;
    }
    setReceipt(json.receipt);
    setStep("success");
    router.refresh();
  }
  if (step === "processing") {
    return (
      <div className="premium-panel rounded-2xl p-6">
        <h2 className="text-2xl font-black text-night">Traitement en cours</h2>
        <div className="mt-6 space-y-3">
          {["Analyse de l’opération", "Vérification du solde", "Génération de l’écriture bancaire", "Virement confirmé"].map((item, index) => (
            <div key={item} className="flex items-center gap-3 rounded-xl bg-white p-4">
              <span className="h-3 w-3 animate-pulse rounded-full bg-mint" style={{ animationDelay: `${index * 150}ms` }} />
              <span className="font-black text-night">{item}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (step === "review" && payload) {
    return (
      <div className="premium-panel space-y-5 rounded-2xl p-6">
        <h2 className="text-2xl font-black text-night">Récapitulatif du virement</h2>
        <div className="grid gap-3 text-sm">
          {Object.entries(payload).filter(([key]) => key !== "recipient").map(([key, value]) => (
            <div key={key} className="flex justify-between rounded-xl bg-white px-4 py-3">
              <span className="font-semibold text-steel">{key}</span>
              <span className="font-black text-night">{String(value)}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={() => setStep("form")} className="rounded-lg bg-white px-5 py-3 font-black text-night">Modifier</button>
          <button onClick={confirm} className="rounded-lg bg-night px-5 py-3 font-black text-white">Confirmer le virement</button>
        </div>
      </div>
    );
  }
  if (step === "success" && receipt) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-premium">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-black text-night">Virement confirmé</h2>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">Réussi</span>
        </div>
        <div className="rounded-2xl border border-line p-5">
          <p className="text-xl font-black text-night">NovaBank</p>
          <p className="mt-1 text-xs text-steel">Document généré automatiquement</p>
          <div className="mt-5 grid gap-3 text-sm">
            {Object.entries(receipt).map(([key, value]) => (
              <div key={key} className="flex justify-between border-b border-line pb-2">
                <span className="font-semibold text-steel">{key}</span>
                <span className="font-black text-night">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
        <button onClick={() => { setStep("form"); setPayload(null); setReceipt(null); }} className="mt-5 rounded-lg bg-night px-5 py-3 font-black text-white">Nouveau virement</button>
      </div>
    );
  }
  return (
    <form onSubmit={submit} className="premium-panel mx-auto max-w-3xl space-y-5 rounded-3xl p-6 md:p-8">
      <div>
        <h2 className="text-2xl font-black text-night">Envoyer de l’argent</h2>
        <p className="mt-1 text-sm font-semibold text-steel">Préparez l’opération, puis vérifiez le récapitulatif avant validation.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input name="beneficiary" value={formState.beneficiary} onChange={(event) => updateField("beneficiary", event.target.value)} required placeholder="Jean Martin" className="rounded-xl border border-line bg-white px-4 py-3 outline-none transition focus:border-night focus:ring-4 focus:ring-slate-900/10" />
        <input name="iban" value={formState.iban} onChange={(event) => updateField("iban", event.target.value.toUpperCase())} required placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX" className="rounded-xl border border-line bg-white px-4 py-3 uppercase outline-none transition focus:border-night focus:ring-4 focus:ring-slate-900/10" />
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_140px]">
        <input name="amount" value={formState.amount} onChange={(event) => updateField("amount", event.target.value)} required type="number" min="0.01" step="0.01" placeholder="250.00" className="rounded-xl border border-line bg-white px-4 py-3 outline-none transition focus:border-night focus:ring-4 focus:ring-slate-900/10" />
        <select name="currency" value={formState.currency} onChange={(event) => updateField("currency", event.target.value)} className="rounded-xl border border-line bg-white px-4 py-3"><option>EUR</option></select>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input name="reference" value={formState.reference} onChange={(event) => updateField("reference", event.target.value)} required placeholder="Facture #12345" className="rounded-xl border border-line bg-white px-4 py-3 outline-none transition focus:border-night focus:ring-4 focus:ring-slate-900/10" />
        <input name="label" value={formState.label} onChange={(event) => updateField("label", event.target.value)} required placeholder="Motif du virement" className="rounded-xl border border-line bg-white px-4 py-3 outline-none transition focus:border-night focus:ring-4 focus:ring-slate-900/10" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <select name="category" value={formState.category} onChange={(event) => updateField("category", event.target.value)} className="rounded-xl border border-line bg-white px-4 py-3"><option>logement</option><option>transport</option><option>alimentation</option><option>loisirs</option><option>études</option><option>autre</option></select>
        <input name="executionDate" required type="date" value={formState.executionDate} onChange={(event) => updateField("executionDate", event.target.value)} className="rounded-xl border border-line bg-white px-4 py-3" />
        <select name="mode" value={formState.mode} onChange={(event) => updateField("mode", event.target.value)} className="rounded-xl border border-line bg-white px-4 py-3"><option>immédiat</option><option>programmé</option></select>
      </div>
      <button disabled={!formReady} className="tap w-full rounded-xl bg-night px-5 py-3 font-bold text-white shadow-lg shadow-slate-900/20 transition disabled:cursor-not-allowed disabled:opacity-50">Continuer</button>
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
      body: JSON.stringify({ currentPassword: form.get("currentPassword"), newPassword: form.get("newPassword"), confirmPassword: form.get("confirmPassword") })
    });
    const json = await res.json();
    setMessage(res.ok ? "Mot de passe modifié." : json.error);
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <input name="currentPassword" type="password" placeholder="Mot de passe actuel" className="w-full rounded-lg border border-line px-4 py-3" />
      <input name="newPassword" type="password" placeholder="Nouveau mot de passe" className="w-full rounded-lg border border-line px-4 py-3" />
      <input name="confirmPassword" type="password" placeholder="Confirmer le nouveau mot de passe" className="w-full rounded-lg border border-line px-4 py-3" />
      <button className="rounded-lg bg-night px-5 py-3 font-bold text-white">Changer le mot de passe</button>
      {message && <p className="text-sm font-semibold text-steel">{message}</p>}
    </form>
  );
}

export function AdminAccountActions({ accountId, status }: { accountId: string; status: "ACTIVE" | "BLOCKED" }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  async function adjust(mode: "add" | "remove") {
    const amount = prompt(mode === "add" ? "Montant à ajouter" : "Montant à retirer");
    if (!amount) return;
    const res = await fetch(`/api/admin/accounts/${accountId}/adjust`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, amount, label: "Ajustement admin" })
    });
    const json = await res.json();
    setMessage(res.ok ? "Solde ajusté." : json.error);
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
