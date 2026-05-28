import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import { euro } from "@/lib/banking";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const debitTypes = new Set(["WITHDRAWAL", "TRANSFER_OUT"]);

export default async function EntriesPage() {
  const user = await requireUser();
  if (!user?.account) redirect("/connexion");

  const transactions = await prisma.transaction.findMany({
    where: { accountId: user.account.id },
    orderBy: { createdAt: "desc" },
    take: 80
  });

  let runningBalance = Number(user.account.balance);
  const entries = transactions.map((tx) => {
    const amount = Number(tx.amount);
    const debit = debitTypes.has(tx.type) ? amount : 0;
    const credit = debitTypes.has(tx.type) ? 0 : amount;
    const balanceAfter = runningBalance;
    runningBalance += debit - credit;
    return { tx, debit, credit, balanceAfter };
  });

  return (
    <AppShell isAdmin={user.role === "ADMIN"}>
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-semibold text-steel">Suivi comptable</p>
            <h1 className="mt-1 text-4xl font-black text-night">Écritures bancaires</h1>
          </div>
          <div className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-steel shadow-sm">
            Solde disponible: <span className="sensitive text-night">{euro(user.account.balance.toString())}</span>
          </div>
        </div>

        <section className="mt-8 overflow-hidden rounded-3xl bg-white shadow-premium">
          <div className="border-b border-line px-6 py-5">
            <h2 className="text-xl font-black text-night">Journal des dernières opérations</h2>
            <p className="mt-1 text-sm text-steel">Numérotation, dates comptables, débits, crédits et soldes après opération.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full text-left text-sm">
              <thead className="bg-mist text-xs uppercase text-steel">
                <tr>
                  <Th>Date</Th>
                  <Th>Référence</Th>
                  <Th>Libellé</Th>
                  <Th>Débit</Th>
                  <Th>Crédit</Th>
                  <Th>Solde</Th>
                  <Th>Statut</Th>
                  <Th>Reçu</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {entries.map(({ tx, debit, credit, balanceAfter }) => (
                  <tr key={tx.id} className="hover:bg-mist/60">
                    <Td>
                      <span className="font-bold text-night">{new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(tx.createdAt)}</span>
                      <span className="block text-xs text-steel">Valeur: {new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(tx.executionDate ?? tx.createdAt)}</span>
                    </Td>
                    <Td>
                      <span className="font-black text-night">ECR-{tx.reference.replace(/[^A-Z0-9]/gi, "").slice(0, 10).toUpperCase()}</span>
                      <span className="block text-xs text-steel">{tx.reference}</span>
                    </Td>
                    <Td>
                      <span className="font-bold text-night">{tx.label}</span>
                      <span className="block text-xs capitalize text-steel">{tx.category}</span>
                    </Td>
                    <Td className="font-black text-red-600">{debit ? euro(debit) : "-"}</Td>
                    <Td className="font-black text-emerald-700">{credit ? euro(credit) : "-"}</Td>
                    <Td className="sensitive font-black text-night">{euro(balanceAfter)}</Td>
                    <Td><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{tx.status}</span></Td>
                    <Td><Link href={`/recu/${tx.id}`} className="font-black text-night underline underline-offset-4">Voir</Link></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </AppShell>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-5 py-4 font-black">{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-5 py-4 align-top ${className}`}>{children}</td>;
}
