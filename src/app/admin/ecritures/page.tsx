import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { requireAdmin } from "@/lib/auth";
import { euro } from "@/lib/banking";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const debitTypes = new Set(["WITHDRAWAL", "TRANSFER_OUT"]);

export default async function AdminEntriesPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/dashboard");
  const transactions = await prisma.transaction.findMany({
    include: { account: { include: { user: true } }, relatedAccount: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
    take: 150
  });
  const entries = transactions.map((tx) => {
    const amount = Number(tx.amount);
    const debit = debitTypes.has(tx.type) ? amount : 0;
    const credit = debit ? 0 : amount;
    return {
      id: tx.id,
      number: `ECR-${tx.reference.replace(/[^A-Z0-9]/gi, "").slice(0, 10).toUpperCase()}`,
      accountingDate: tx.createdAt,
      valueDate: tx.executionDate ?? tx.createdAt,
      debited: debit ? `${tx.account.user.firstName} ${tx.account.user.lastName}` : "-",
      credited: tx.beneficiaryName ?? tx.relatedAccount?.user.email ?? `${tx.account.user.firstName} ${tx.account.user.lastName}`,
      debit,
      credit,
      reference: tx.reference,
      status: tx.status
    };
  });

  return (
    <AppShell isAdmin>
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-semibold text-steel">Journal admin</p>
            <h1 className="mt-1 text-4xl font-black text-night">Écritures bancaires</h1>
          </div>
          <Link href="/admin" className="rounded-xl bg-white px-5 py-3 text-sm font-black text-night shadow-sm">Retour admin</Link>
        </div>
        <section className="mt-8 overflow-hidden rounded-3xl bg-white shadow-premium">
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full text-left text-sm">
              <thead className="bg-mist text-xs uppercase text-steel">
                <tr><Th>Numéro écriture</Th><Th>Date comptable</Th><Th>Date valeur</Th><Th>Compte débité</Th><Th>Compte crédité</Th><Th>Débit</Th><Th>Crédit</Th><Th>Référence</Th><Th>Statut</Th><Th>Détail</Th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-mist/50">
                    <Td className="font-black text-night">{entry.number}</Td>
                    <Td>{formatDate(entry.accountingDate)}</Td>
                    <Td>{formatDate(entry.valueDate)}</Td>
                    <Td>{entry.debited}</Td>
                    <Td>{entry.credited}</Td>
                    <Td className="font-black text-red-600">{entry.debit ? euro(entry.debit) : "-"}</Td>
                    <Td className="font-black text-emerald-700">{entry.credit ? euro(entry.credit) : "-"}</Td>
                    <Td>{entry.reference}</Td>
                    <Td><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{entry.status}</span></Td>
                    <Td><Link href={`/admin/virements/${entry.id}`} className="font-black text-night underline underline-offset-4">Voir</Link></Td>
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
  return <td className={`px-5 py-4 align-top text-steel ${className}`}>{children}</td>;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}
