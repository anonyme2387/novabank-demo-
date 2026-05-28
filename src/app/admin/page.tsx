import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { AdminAccountActions } from "@/components/ClientActions";
import { requireAdmin } from "@/lib/auth";
import { euro } from "@/lib/banking";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const debitTypes = new Set(["WITHDRAWAL", "TRANSFER_OUT"]);

export default async function AdminPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/dashboard");

  const [users, accounts, transactions, logs] = await Promise.all([
    prisma.user.findMany({
      include: { account: { include: { card: true } }, loginLogs: { orderBy: { createdAt: "desc" }, take: 1 } },
      orderBy: { createdAt: "asc" }
    }),
    prisma.account.findMany({ include: { user: true, card: true }, orderBy: { createdAt: "asc" } }),
    prisma.transaction.findMany({
      include: { account: { include: { user: true } }, relatedAccount: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
      take: 80
    }),
    prisma.loginLog.findMany({ include: { user: true }, orderBy: { createdAt: "desc" }, take: 30 })
  ]);

  const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance), 0);
  const totalVolume = transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
  const lastActivity = transactions[0]?.createdAt ?? logs[0]?.createdAt;
  const categoryTotals = ["logement", "transport", "alimentation", "loisirs", "études", "autre"].map((category) => ({
    category,
    total: transactions.filter((tx) => tx.category === category).reduce((sum, tx) => sum + Number(tx.amount), 0)
  }));
  const maxCategory = Math.max(1, ...categoryTotals.map((item) => item.total));
  const entries = buildEntries(transactions);

  return (
    <AppShell isAdmin>
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-semibold text-steel">Espace administrateur</p>
            <h1 className="mt-1 text-4xl font-black text-night">Pilotage des données simulées</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/virements" className="rounded-xl bg-night px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-900/20">Virements</Link>
            <Link href="/admin/ecritures" className="rounded-xl bg-white px-5 py-3 text-sm font-black text-night shadow-sm">Écritures</Link>
          </div>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <Stat label="Utilisateurs" value={String(users.length)} />
          <Stat label="Comptes" value={String(accounts.length)} />
          <Stat label="Volume total" value={euro(totalVolume)} />
          <Stat label="Solde total" value={euro(totalBalance)} />
          <Stat label="Transactions" value={String(transactions.length)} />
          <Stat label="Écritures" value={String(entries.length)} />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <div className="premium-panel rounded-3xl p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black text-night">Vue globale</h2>
                <p className="mt-1 text-sm text-steel">Données dynamiques lues depuis PostgreSQL via Prisma.</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700">Actif</span>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Info label="Dernière activité" value={lastActivity ? formatDateTime(lastActivity) : "Aucune activité"} />
              <Info label="Compte suivi" value="Alexandre Martin" />
              <Info label="Admin" value={admin.email} />
              <Info label="Mise à jour" value="Au rechargement de la page" />
            </div>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-premium">
            <h2 className="text-2xl font-black text-night">Graphique catégories</h2>
            <div className="mt-5 space-y-4">
              {categoryTotals.map((item) => (
                <div key={item.category}>
                  <div className="flex justify-between text-sm font-bold">
                    <span className="capitalize text-steel">{item.category}</span>
                    <span>{euro(item.total)}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-mist">
                    <div className="h-2 rounded-full bg-night" style={{ width: `${Math.max(6, (item.total / maxCategory) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Panel title="Utilisateurs">
          <Table>
            <thead className="bg-mist text-xs uppercase text-steel">
              <tr><Th>Nom</Th><Th>Email</Th><Th>Rôle</Th><Th>Création</Th><Th>Statut</Th><Th>Dernière connexion</Th><Th>Pays</Th><Th>Appareil</Th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((user) => {
                const lastLog = user.loginLogs[0];
                return (
                  <tr key={user.id} className="hover:bg-mist/50">
                    <Td className="font-black text-night">{user.firstName} {user.lastName}</Td>
                    <Td>{user.email}</Td>
                    <Td><Badge tone={user.role === "ADMIN" ? "night" : "blue"}>{user.role}</Badge></Td>
                    <Td>{formatDate(user.createdAt)}</Td>
                    <Td><Badge tone={user.account?.status === "ACTIVE" ? "green" : "red"}>{user.account?.status ?? "-"}</Badge></Td>
                    <Td>{lastLog ? formatDateTime(lastLog.createdAt) : "-"}</Td>
                    <Td>{lastLog?.country ?? "-"}</Td>
                    <Td>{lastLog?.device ?? "-"}</Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Panel>

        <Panel title="Comptes">
          <Table>
            <thead className="bg-mist text-xs uppercase text-steel">
              <tr><Th>Titulaire</Th><Th>IBAN simulé</Th><Th>Solde</Th><Th>Devise</Th><Th>Statut</Th><Th>Carte</Th><Th>Actions</Th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {accounts.map((account) => (
                <tr key={account.id} className="hover:bg-mist/50">
                  <Td className="font-black text-night">{account.user.firstName} {account.user.lastName}</Td>
                  <Td>{account.ibanFake}</Td>
                  <Td className="font-black">{euro(account.balance.toString())}</Td>
                  <Td>{account.currency}</Td>
                  <Td><Badge tone={account.status === "ACTIVE" ? "green" : "red"}>{account.status}</Badge></Td>
                  <Td>{account.card?.cardNumberFake ?? "-"}</Td>
                  <Td><AdminAccountActions accountId={account.id} status={account.status} /></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Panel>

        <Panel title="Transactions simulées">
          <Table>
            <thead className="bg-mist text-xs uppercase text-steel">
              <tr><Th>Date</Th><Th>Émetteur</Th><Th>Bénéficiaire</Th><Th>Montant</Th><Th>Motif</Th><Th>Référence</Th><Th>Statut</Th><Th>Catégorie</Th><Th>Type</Th><Th>Détail</Th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {transactions.slice(0, 20).map((tx) => (
                <tr key={tx.id} className="hover:bg-mist/50">
                  <Td>{formatDateTime(tx.createdAt)}</Td>
                  <Td>{tx.account.user.firstName} {tx.account.user.lastName}</Td>
                  <Td>{tx.beneficiaryName ?? tx.relatedAccount?.user.email ?? "-"}</Td>
                  <Td className="font-black">{euro(tx.amount.toString())}</Td>
                  <Td>{tx.label}</Td>
                  <Td>{tx.reference}</Td>
                  <Td><Badge tone="green">{tx.status}</Badge></Td>
                  <Td className="capitalize">{tx.category}</Td>
                  <Td>{tx.type}</Td>
                  <Td><Link href={`/admin/virements/${tx.id}`} className="font-black text-night underline underline-offset-4">Voir</Link></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Panel>

        <Panel title="Écritures bancaires simulées">
          <Table>
            <thead className="bg-mist text-xs uppercase text-steel">
              <tr><Th>Numéro</Th><Th>Date comptable</Th><Th>Date valeur</Th><Th>Compte débité</Th><Th>Compte crédité</Th><Th>Carte / IBAN</Th><Th>Débit</Th><Th>Crédit</Th><Th>Solde après</Th><Th>Référence</Th><Th>Statut</Th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {entries.slice(0, 20).map((entry) => (
                <tr key={entry.id} className="hover:bg-mist/50">
                  <Td className="font-black text-night">{entry.number}</Td>
                  <Td>{formatDate(entry.createdAt)}</Td>
                  <Td>{formatDate(entry.valueDate)}</Td>
                  <Td>{entry.debited}</Td>
                  <Td>{entry.credited}</Td>
                  <Td>{entry.beneficiaryIban}</Td>
                  <Td className="font-black text-red-600">{entry.debit ? euro(entry.debit) : "-"}</Td>
                  <Td className="font-black text-emerald-700">{entry.credit ? euro(entry.credit) : "-"}</Td>
                  <Td className="font-black">{euro(entry.balanceAfter)}</Td>
                  <Td>{entry.reference}</Td>
                  <Td><Badge tone="green">{entry.status}</Badge></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Panel>

        <Panel title="Logs de connexion">
          <Table>
            <thead className="bg-mist text-xs uppercase text-steel">
              <tr><Th>Utilisateur</Th><Th>Date</Th><Th>IP</Th><Th>Pays</Th><Th>Navigateur</Th><Th>Appareil</Th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-mist/50">
                  <Td className="font-black text-night">{log.user.email}</Td>
                  <Td>{formatDateTime(log.createdAt)}</Td>
                  <Td>{log.ipAddress}</Td>
                  <Td>{log.country}</Td>
                  <Td>{log.browser}</Td>
                  <Td>{log.device}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Panel>
      </main>
    </AppShell>
  );
}

function buildEntries(transactions: Array<any>) {
  const running = new Map<string, number>();
  return [...transactions].reverse().map((tx) => {
    const accountId = tx.accountId as string;
    const previous = running.get(accountId) ?? Number(tx.account.balance);
    const amount = Number(tx.amount);
    const debit = debitTypes.has(tx.type) ? amount : 0;
    const credit = debit ? 0 : amount;
    const balanceAfter = debit ? previous - amount : previous + amount;
    running.set(accountId, balanceAfter);
    return {
      id: tx.id,
      number: `ECR-${tx.reference.replace(/[^A-Z0-9]/gi, "").toUpperCase()}`,
      createdAt: tx.createdAt,
      valueDate: tx.executionDate ?? tx.createdAt,
      debited: debit ? `${tx.account.user.firstName} ${tx.account.user.lastName}` : "-",
      credited: tx.beneficiaryName ?? tx.relatedAccount?.user.email ?? `${tx.account.user.firstName} ${tx.account.user.lastName}`,
      beneficiaryIban: tx.beneficiaryIban ?? tx.relatedAccount?.ibanFake ?? tx.account.ibanFake,
      debit,
      credit,
      balanceAfter,
      reference: tx.reference,
      status: tx.status
    };
  }).reverse();
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase text-steel">{label}</p><p className="mt-3 text-2xl font-black text-night">{value}</p></div>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-white/80 p-4"><p className="text-xs font-black uppercase text-steel">{label}</p><p className="mt-2 font-black text-night">{value}</p></div>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mt-8 overflow-hidden rounded-3xl bg-white shadow-premium"><div className="border-b border-line px-6 py-5"><h2 className="text-2xl font-black text-night">{title}</h2></div><div className="overflow-x-auto">{children}</div></section>;
}

function Table({ children }: { children: React.ReactNode }) {
  return <table className="min-w-[1080px] w-full text-left text-sm">{children}</table>;
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-5 py-4 font-black">{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-5 py-4 align-top text-steel ${className}`}>{children}</td>;
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "green" | "red" | "blue" | "night" }) {
  const styles = {
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    blue: "bg-sky-50 text-sky-700",
    night: "bg-night text-white"
  };
  return <span className={`rounded-full px-3 py-1 text-xs font-black ${styles[tone]}`}>{children}</span>;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
