import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { AdminAccountActions } from "@/components/ClientActions";
import { requireAdmin } from "@/lib/auth";
import { euro } from "@/lib/banking";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/dashboard");
  const users = await prisma.user.findMany({ include: { account: true }, orderBy: { createdAt: "desc" } });
  const logs = await prisma.loginLog.findMany({ include: { user: true }, orderBy: { createdAt: "desc" }, take: 20 });
  return (
    <AppShell isAdmin>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-4xl font-black text-night">Administration</h1>
        <p className="mt-3 text-steel">Gestion des utilisateurs, comptes fictifs, soldes virtuels et logs de connexion.</p>
        <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="grid bg-night px-5 py-3 text-sm font-bold text-white md:grid-cols-[1fr_160px_120px_100px_260px]">
            <span>Utilisateur</span><span>Solde</span><span>Statut</span><span>Rôle</span><span>Actions</span>
          </div>
          {users.map((user) => (
            <div key={user.id} className="grid gap-2 border-b border-line px-5 py-4 text-sm md:grid-cols-[1fr_160px_120px_100px_260px]">
              <span className="font-bold">{user.firstName} {user.lastName}<br /><span className="font-normal text-steel">{user.email}</span></span>
              <span>{user.account ? euro(user.account.balance.toString()) : "-"}</span>
              <span>{user.account?.status ?? "-"}</span>
              <span>{user.role}</span>
              <span>{user.account && <AdminAccountActions accountId={user.account.id} status={user.account.status} />}</span>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">Logs de connexion</h2>
          <div className="mt-4 divide-y divide-line">
            {logs.map((log) => (
              <div key={log.id} className="grid gap-2 py-3 text-sm md:grid-cols-[1fr_140px_160px_180px]">
                <span className="font-bold">{log.user.email}</span><span>{log.ipAddress}</span><span>{log.country}</span><span>{log.browser} · {log.device}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
