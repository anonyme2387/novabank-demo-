import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { MoneyCard } from "@/components/MoneyCard";
import { OperationButtons } from "@/components/ClientActions";
import { requireUser } from "@/lib/auth";
import { euro } from "@/lib/banking";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const user = await requireUser();
  if (!user?.account) redirect("/connexion");
  const transactions = await prisma.transaction.findMany({ where: { accountId: user.account.id }, orderBy: { createdAt: "desc" }, take: 5 });
  const income = transactions.filter((t) => t.type === "DEPOSIT" || t.type === "TRANSFER_IN").reduce((sum, t) => sum + Number(t.amount), 0);
  const out = transactions.filter((t) => t.type === "WITHDRAWAL" || t.type === "TRANSFER_OUT").reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <AppShell isAdmin={user.role === "ADMIN"}>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-semibold text-steel">Bonjour {user.firstName}</p>
            <h1 className="mt-1 text-4xl font-black text-night">Dashboard</h1>
          </div>
          <div className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-steel">IBAN fictif: <span className="text-night">{user.account.ibanFake}</span></div>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
          <section className="grid gap-6">
            <div className="glass rounded-2xl p-6 shadow-premium">
              <p className="text-sm font-bold text-steel">Solde virtuel disponible</p>
              <div className="mt-3 text-5xl font-black text-night">{euro(user.account.balance.toString())}</div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <Stat label="Entrées récentes" value={euro(income)} />
                <Stat label="Sorties récentes" value={euro(out)} />
                <Stat label="Statut" value={user.account.status === "ACTIVE" ? "Actif" : "Bloqué"} />
              </div>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-night">Dernières transactions</h2>
              <div className="mt-4 divide-y divide-line">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-4">
                    <div><p className="font-bold">{tx.label}</p><p className="text-sm text-steel">{tx.type} · {tx.status}</p></div>
                    <span className="font-black">{euro(tx.amount.toString())}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <aside className="space-y-6">
            <MoneyCard name={`${user.firstName} ${user.lastName}`} number={user.account.card?.cardNumberFake ?? "4975 9200 0000 0000"} expiry={user.account.card?.expiryDate ?? "12/29"} balance={euro(user.account.balance.toString())} />
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-black text-night">Actions rapides</h2>
              <OperationButtons />
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-mist p-4"><p className="text-xs font-bold uppercase text-steel">{label}</p><p className="mt-2 text-lg font-black text-night">{value}</p></div>;
}
