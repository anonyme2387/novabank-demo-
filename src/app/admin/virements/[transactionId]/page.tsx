import Link from "next/link";
import { redirect } from "next/navigation";
import { ReceiptActions } from "@/components/ReceiptActions";
import { AppShell } from "@/components/AppShell";
import { requireAdmin } from "@/lib/auth";
import { euro } from "@/lib/banking";
import { maskIban } from "@/lib/security";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const debitTypes = new Set(["WITHDRAWAL", "TRANSFER_OUT"]);

export default async function AdminTransferDetailPage({ params }: { params: { transactionId: string } }) {
  const admin = await requireAdmin();
  if (!admin) redirect("/dashboard");
  const tx = await prisma.transaction.findUnique({
    where: { id: params.transactionId },
    include: { account: { include: { user: true } }, relatedAccount: { include: { user: true } } }
  });
  if (!tx) redirect("/admin/virements");

  const amount = Number(tx.amount);
  const debit = debitTypes.has(tx.type) ? amount : 0;
  const credit = debit ? 0 : amount;
  const entryNumber = `ECR-${tx.reference.replace(/[^A-Z0-9]/gi, "").slice(0, 12).toUpperCase()}`;
  const valueDate = tx.executionDate ?? tx.createdAt;
  const balanceAfter = Number(tx.account.balance);
  const balanceBefore = debit ? balanceAfter + amount : balanceAfter - amount;

  return (
    <AppShell isAdmin>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-semibold text-steel">Détail administrateur</p>
            <h1 className="mt-1 text-4xl font-black text-night">Virement {tx.reference}</h1>
          </div>
          <Link href="/admin/virements" className="rounded-xl bg-white px-5 py-3 text-sm font-black text-night shadow-sm">Retour aux virements</Link>
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-3xl bg-white p-6 shadow-premium">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-night">Toutes les données de l’opération</h2>
                <p className="mt-1 text-sm text-steel">Lecture directe de la transaction stockée en base.</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700">{tx.status}</span>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Info label="Émetteur" value={`${tx.account.user.firstName} ${tx.account.user.lastName}`} />
              <Info label="Bénéficiaire" value={tx.beneficiaryName ?? tx.relatedAccount?.user.email ?? "-"} />
              <Info label="IBAN masqué" value={tx.beneficiaryIban ?? maskIban(tx.relatedAccount?.ibanFake ?? tx.account.ibanFake)} />
              <Info label="Montant" value={euro(tx.amount.toString())} />
              <Info label="Devise" value={tx.account.currency} />
              <Info label="Motif" value={tx.label} />
              <Info label="Référence" value={tx.reference} />
              <Info label="Date" value={formatDateTime(tx.createdAt)} />
              <Info label="Catégorie" value={tx.category} />
              <Info label="Type" value={tx.type} />
              <Info label="Numéro écriture" value={entryNumber} />
              <Info label="Date de valeur" value={formatDate(valueDate)} />
              <Info label="Compte débité" value={debit ? `${tx.account.user.firstName} ${tx.account.user.lastName}` : "-"} />
              <Info label="Compte crédité" value={tx.beneficiaryName ?? tx.relatedAccount?.user.email ?? "-"} />
              <Info label="Solde avant" value={euro(balanceBefore)} />
              <Info label="Solde après" value={euro(balanceAfter)} />
            </div>
          </div>

          <aside className="rounded-3xl bg-night p-6 text-white shadow-premium">
            <p className="text-sm font-semibold text-white/60">Reçu professionnel</p>
            <h2 className="mt-2 text-3xl font-black">NovaBank</h2>
            <div className="mt-8 space-y-4 text-sm">
              <ReceiptRow label="Référence" value={tx.reference} />
              <ReceiptRow label="Écriture" value={entryNumber} />
              <ReceiptRow label="Montant" value={euro(tx.amount.toString())} />
              <ReceiptRow label="Statut" value={tx.status} />
              <ReceiptRow label="Date" value={formatDateTime(tx.createdAt)} />
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <ReceiptActions filename={`admin-recu-${tx.reference}.txt`} />
            </div>
            <Link href={`/recu/${tx.id}`} className="mt-4 inline-flex rounded-xl bg-white/10 px-5 py-3 text-sm font-black text-white">Voir reçu utilisateur</Link>
          </aside>
        </section>
      </main>
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-mist p-4"><p className="text-xs font-black uppercase text-steel">{label}</p><p className="mt-2 break-words font-black text-night">{value}</p></div>;
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4 border-b border-white/10 pb-3"><span className="text-white/60">{label}</span><span className="text-right font-black">{value}</span></div>;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).format(date);
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short" }).format(date);
}
