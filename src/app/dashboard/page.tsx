import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { BalanceChart } from "@/components/BalanceChart";
import { MoneyCard } from "@/components/MoneyCard";
import { OperationButtons } from "@/components/ClientActions";
import { requireUser } from "@/lib/auth";
import { euro } from "@/lib/banking";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  if (!user?.account) redirect("/connexion");
  const transactions = await prisma.transaction.findMany({ where: { accountId: user.account.id }, orderBy: { createdAt: "desc" }, take: 5 });
  const monthTransactions = await prisma.transaction.findMany({ where: { accountId: user.account.id }, orderBy: { createdAt: "desc" }, take: 50 });
  const income = transactions.filter((t) => t.type === "DEPOSIT" || t.type === "TRANSFER_IN").reduce((sum, t) => sum + Number(t.amount), 0);
  const out = transactions.filter((t) => t.type === "WITHDRAWAL" || t.type === "TRANSFER_OUT").reduce((sum, t) => sum + Number(t.amount), 0);
  const monthIncome = monthTransactions.filter((t) => t.type === "DEPOSIT" || t.type === "TRANSFER_IN").reduce((sum, t) => sum + Number(t.amount), 0);
  const monthOut = monthTransactions.filter((t) => t.type === "WITHDRAWAL" || t.type === "TRANSFER_OUT").reduce((sum, t) => sum + Number(t.amount), 0);
  const categories = ["logement", "transport", "alimentation", "loisirs", "études", "autre"].map((category) => ({
    category,
    amount: monthTransactions.filter((t) => t.category === category && (t.type === "WITHDRAWAL" || t.type === "TRANSFER_OUT")).reduce((sum, t) => sum + Number(t.amount), 0)
  }));

  return (
    <AppShell isAdmin={user.role === "ADMIN"}>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-semibold text-steel">Bonjour {user.firstName}</p>
            <h1 className="mt-1 text-4xl font-black text-night">Vue d’ensemble</h1>
          </div>
          <div className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-steel shadow-sm">IBAN: <span className="text-night">{user.account.ibanFake}</span></div>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
          <section className="grid gap-6">
            <div className="premium-panel rounded-2xl p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <p className="text-sm font-bold text-steel">Solde disponible</p>
                  <div className="mt-3 text-5xl font-black text-night">{euro(user.account.balance.toString())}</div>
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <Stat label="Revenus du mois" value={euro(monthIncome)} />
                <Stat label="Dépenses du mois" value={euro(monthOut)} />
                <Stat label="Statut" value={user.account.status === "ACTIVE" ? "Actif" : "Bloqué"} />
              </div>
            </div>
            <BalanceChart />
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-black text-night">Dépenses par catégorie</h2>
                <div className="mt-5 space-y-4">
                  {categories.map((item) => (
                    <div key={item.category}>
                      <div className="flex justify-between text-sm font-bold"><span className="capitalize text-steel">{item.category}</span><span>{euro(item.amount)}</span></div>
                      <div className="mt-2 h-2 rounded-full bg-mist"><div className="h-2 rounded-full bg-night" style={{ width: `${Math.min(100, (item.amount / Math.max(1, monthOut)) * 100)}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-black text-night">Objectifs et notifications</h2>
                <div className="mt-5 space-y-3 text-sm">
                  <div className="rounded-xl bg-mist p-4"><b>Limite mensuelle</b><br />Objectif: {euro(1800)} · utilisé: {euro(monthOut)}</div>
                  <div className="rounded-xl bg-mist p-4"><b>Objectif épargne</b><br />Vacances: 68% atteint</div>
                  <div className="rounded-xl bg-emerald-50 p-4 text-emerald-800"><b>Notification</b><br />Aucune activité inhabituelle détectée.</div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-night">Dernières transactions</h2>
              <div className="mt-4 divide-y divide-line">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-4">
                    <div><p className="font-bold">{tx.label}</p><p className="text-sm text-steel">{tx.category} · {tx.status}</p></div>
                    <span className="font-black">{euro(tx.amount.toString())}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-night">Dernières écritures</h2>
              <div className="mt-4 grid gap-3">
                {transactions.slice(0, 3).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between rounded-xl bg-mist p-4">
                    <div>
                      <p className="font-black text-night">ECR-{tx.reference.replace(/[^A-Z0-9]/gi, "").toUpperCase()}</p>
                      <p className="text-sm text-steel">{tx.label}</p>
                    </div>
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
