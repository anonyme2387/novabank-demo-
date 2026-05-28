import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ReceiptActions } from "@/components/ReceiptActions";
import { requireUser } from "@/lib/auth";
import { euro } from "@/lib/banking";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ReceiptPage({ params }: { params: { transactionId: string } }) {
  const user = await requireUser();
  if (!user?.account) redirect("/connexion");
  const tx = await prisma.transaction.findFirst({
    where: user.role === "ADMIN" ? { id: params.transactionId } : { id: params.transactionId, accountId: user.account.id },
    include: { account: { include: { user: true } }, relatedAccount: { include: { user: true } } }
  });
  if (!tx) redirect("/historique");
  const entryNumber = `ECR-${tx.reference.replace(/[^A-Z0-9]/gi, "").toUpperCase()}`;
  const valueDate = tx.executionDate ?? tx.createdAt;
  const cardParts = tx.label.split(" · ");
  const isCardPayment = tx.label.startsWith("Paiement carte");
  const cardNumber = tx.beneficiaryIban ?? cardParts[1] ?? "-";
  const expiryDate = isCardPayment ? cardParts[2] ?? "-" : "-";
  const securityCode = isCardPayment ? cardParts[3] ?? "-" : "-";
  const cardholderName = tx.beneficiaryName ?? cardParts[4] ?? "-";
  return (
    <AppShell isAdmin={user.role === "ADMIN"}>
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-3xl border border-white/70 bg-white p-8 shadow-premium">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-night">NovaBank</h1>
              <p className="mt-1 text-sm text-steel">Document généré automatiquement</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700">{tx.status}</span>
          </div>
          <div className="mt-8 rounded-2xl bg-night p-6 text-white">
            <p className="text-sm font-semibold text-white/60">Montant de l’opération</p>
            <p className="mt-2 text-4xl font-black">{euro(tx.amount.toString())}</p>
            <p className="mt-3 text-sm text-white/60">{tx.label}</p>
          </div>
          <div className="mt-8 grid gap-4 rounded-2xl border border-line p-5">
            <Row label="Référence" value={tx.reference} />
            <Row label="Numéro d’écriture" value={entryNumber} />
            <Row label="Date et heure" value={new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short" }).format(tx.createdAt)} />
            <Row label="Date de valeur" value={new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(valueDate)} />
            <Row label="Compte débité" value={`${tx.account.user.firstName} ${tx.account.user.lastName}`} />
            <Row label="IBAN émetteur" value={tx.account.ibanFake} />
            <Row label="Compte crédité" value={tx.beneficiaryName ?? tx.relatedAccount?.user.email ?? "Bénéficiaire"} />
            <Row label={isCardPayment ? "Numéro de carte" : "IBAN bénéficiaire"} value={isCardPayment ? cardNumber : tx.beneficiaryIban ?? tx.relatedAccount?.ibanFake ?? tx.account.ibanFake} />
            {isCardPayment && <Row label="Date d’expiration" value={expiryDate} />}
            {isCardPayment && <Row label="CVV/CVC" value={securityCode} />}
            {isCardPayment && <Row label="Nom sur la carte" value={cardholderName} />}
            <Row label="Méthode" value={tx.transferMode ?? tx.type} />
            <Row label="Montant" value={euro(tx.amount.toString())} />
            <Row label="Motif" value={tx.label} />
            <Row label="Catégorie" value={tx.category} />
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ReceiptActions filename={`recu-${tx.reference}.txt`} />
            <Link href="/historique" className="inline-flex rounded-lg bg-night px-5 py-3 font-black text-white">Retour à l’historique</Link>
          </div>
        </div>
      </main>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-6 border-b border-line pb-3 text-sm"><span className="font-semibold text-steel">{label}</span><span className="text-right font-black text-night">{value}</span></div>;
}
