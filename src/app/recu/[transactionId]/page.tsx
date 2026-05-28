import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import { euro } from "@/lib/banking";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ReceiptPage({ params }: { params: { transactionId: string } }) {
  const user = await requireUser();
  if (!user?.account) redirect("/connexion");
  const tx = await prisma.transaction.findFirst({
    where: { id: params.transactionId, accountId: user.account.id },
    include: { relatedAccount: { include: { user: true } } }
  });
  if (!tx) redirect("/historique");
  return (
    <AppShell isAdmin={user.role === "ADMIN"}>
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-3xl bg-white p-8 shadow-premium">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-night">NovaBank</h1>
              <p className="mt-1 text-sm text-steel">Document généré automatiquement</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700">{tx.status}</span>
          </div>
          <div className="mt-8 grid gap-4">
            <Row label="Référence" value={tx.reference} />
            <Row label="Date et heure" value={new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short" }).format(tx.createdAt)} />
            <Row label="Compte débité" value={`${user.firstName} ${user.lastName}`} />
            <Row label="Compte crédité" value={tx.beneficiaryName ?? tx.relatedAccount?.user.email ?? "Bénéficiaire"} />
            <Row label="IBAN bénéficiaire" value={tx.beneficiaryIban ?? "••••"} />
            <Row label="Montant" value={euro(tx.amount.toString())} />
            <Row label="Motif" value={tx.label} />
            <Row label="Catégorie" value={tx.category} />
          </div>
          <Link href="/historique" className="mt-8 inline-flex rounded-lg bg-night px-5 py-3 font-black text-white">Retour à l’historique</Link>
        </div>
      </main>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-6 border-b border-line pb-3 text-sm"><span className="font-semibold text-steel">{label}</span><span className="text-right font-black text-night">{value}</span></div>;
}
