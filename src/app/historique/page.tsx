import Link from "next/link";
import { redirect } from "next/navigation";
import type { TransactionType } from "@prisma/client";
import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import { euro } from "@/lib/banking";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const filters: [string, string][] = [["Tous", ""], ["Dépôt", "DEPOSIT"], ["Retrait", "WITHDRAWAL"], ["Virement entrant", "TRANSFER_IN"], ["Virement sortant", "TRANSFER_OUT"]];

export default async function HistoryPage({ searchParams }: { searchParams: { type?: TransactionType } }) {
  const user = await requireUser();
  if (!user?.account) redirect("/connexion");
  const account = user.account;
  const txs = await prisma.transaction.findMany({
    where: { accountId: account.id, ...(searchParams.type ? { type: searchParams.type } : {}) },
    include: { relatedAccount: true },
    orderBy: { createdAt: "desc" }
  });
  return (
    <AppShell isAdmin={user.role === "ADMIN"}>
      <div className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-4xl font-black text-night">Historique</h1>
        <div className="mt-6 flex flex-wrap gap-2">{filters.map(([label, type]) => <Link key={label} href={type ? `/historique?type=${type}` : "/historique"} className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-night shadow-sm">{label}</Link>)}</div>
        <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
          {txs.map((tx) => (
            <div key={tx.id} className="grid gap-2 border-b border-line p-5 md:grid-cols-[1fr_180px_140px] md:items-center">
              <div><p className="font-black text-night">{tx.label}</p><p className="text-sm text-steel">{new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(tx.createdAt)}</p><p className="mt-1 text-xs font-semibold text-steel">Carte / IBAN: {tx.beneficiaryIban ?? tx.relatedAccount?.ibanFake ?? account.ibanFake}</p></div>
              <span className="font-semibold text-steel">{tx.type}</span>
              <span className="text-right font-black">{euro(tx.amount.toString())}</span>
              <div className="flex gap-2 md:col-start-2">
                <span className="rounded-full bg-mist px-3 py-1 text-xs font-bold text-steel">{tx.status === "SUCCESS" ? "réussi" : tx.status === "PENDING" ? "en attente" : "refusé"}</span>
                <Link href={`/recu/${tx.id}`} className="rounded-full bg-night px-3 py-1 text-xs font-bold text-white">Reçu</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
