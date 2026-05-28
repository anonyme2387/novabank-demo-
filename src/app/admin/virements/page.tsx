import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { requireAdmin } from "@/lib/auth";
import { euro } from "@/lib/banking";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminTransfersPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const admin = await requireAdmin();
  if (!admin) redirect("/dashboard");

  const transactions = await prisma.transaction.findMany({
    where: {
      type: searchParams.type ? (searchParams.type as any) : undefined,
      status: searchParams.status ? (searchParams.status as any) : undefined,
      category: searchParams.category || undefined,
      amount: searchParams.amount ? { gte: Number(searchParams.amount) } : undefined,
      OR: searchParams.q ? [
        { label: { contains: searchParams.q, mode: "insensitive" } },
        { reference: { contains: searchParams.q, mode: "insensitive" } },
        { beneficiaryName: { contains: searchParams.q, mode: "insensitive" } },
        { account: { user: { email: { contains: searchParams.q, mode: "insensitive" } } } }
      ] : undefined
    },
    include: { account: { include: { user: true } }, relatedAccount: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
    take: 120
  });

  return (
    <AppShell isAdmin>
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-semibold text-steel">Administration</p>
            <h1 className="mt-1 text-4xl font-black text-night">Virements et transactions</h1>
          </div>
          <Link href="/admin" className="rounded-xl bg-white px-5 py-3 text-sm font-black text-night shadow-sm">Retour admin</Link>
        </div>

        <form className="mt-8 grid gap-3 rounded-3xl bg-white p-5 shadow-sm md:grid-cols-6">
          <input name="q" defaultValue={searchParams.q ?? ""} placeholder="Recherche" className="rounded-xl border border-line px-4 py-3 outline-none focus:border-night" />
          <select name="type" defaultValue={searchParams.type ?? ""} className="rounded-xl border border-line px-4 py-3">
            <option value="">Tous types</option>
            <option value="DEPOSIT">Dépôt</option>
            <option value="WITHDRAWAL">Retrait</option>
            <option value="TRANSFER_IN">Entrant</option>
            <option value="TRANSFER_OUT">Sortant</option>
          </select>
          <select name="status" defaultValue={searchParams.status ?? ""} className="rounded-xl border border-line px-4 py-3">
            <option value="">Tous statuts</option>
            <option value="SUCCESS">Réussi</option>
            <option value="PENDING">En attente</option>
            <option value="FAILED">Refusé</option>
          </select>
          <select name="category" defaultValue={searchParams.category ?? ""} className="rounded-xl border border-line px-4 py-3">
            <option value="">Catégorie</option>
            <option>logement</option><option>transport</option><option>alimentation</option><option>loisirs</option><option>études</option><option>autre</option>
          </select>
          <input name="amount" defaultValue={searchParams.amount ?? ""} type="number" min="0" step="0.01" placeholder="Montant min." className="rounded-xl border border-line px-4 py-3" />
          <button className="rounded-xl bg-night px-5 py-3 font-black text-white">Filtrer</button>
        </form>

        <section className="mt-8 overflow-hidden rounded-3xl bg-white shadow-premium">
          <div className="overflow-x-auto">
            <table className="min-w-[1180px] w-full text-left text-sm">
              <thead className="bg-mist text-xs uppercase text-steel">
                <tr><Th>Date</Th><Th>Émetteur</Th><Th>Bénéficiaire</Th><Th>IBAN masqué</Th><Th>Montant</Th><Th>Devise</Th><Th>Motif</Th><Th>Référence</Th><Th>Catégorie</Th><Th>Statut</Th><Th>Action</Th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-mist/50">
                    <Td>{formatDateTime(tx.createdAt)}</Td>
                    <Td>{tx.account.user.firstName} {tx.account.user.lastName}</Td>
                    <Td>{tx.beneficiaryName ?? tx.relatedAccount?.user.email ?? "-"}</Td>
                    <Td>{tx.beneficiaryIban ?? "••••"}</Td>
                    <Td className="font-black text-night">{euro(tx.amount.toString())}</Td>
                    <Td>{tx.account.currency}</Td>
                    <Td>{tx.label}</Td>
                    <Td>{tx.reference}</Td>
                    <Td className="capitalize">{tx.category}</Td>
                    <Td><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{tx.status}</span></Td>
                    <Td><Link href={`/admin/virements/${tx.id}`} className="font-black text-night underline underline-offset-4">Voir détail</Link></Td>
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

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
