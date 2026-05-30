import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const highRisk = new Set(["HIGH", "CRITICAL"]);

export default async function AdminSecurityPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/dashboard?error=admin");

  const logs = await prisma.securityLog.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 250
  });

  const failedLogins = logs.filter((log) => log.event.includes("LOGIN") && log.event !== "LOGIN_SUCCESS");
  const deniedAccess = logs.filter((log) => log.event.includes("ACCESS_DENIED") || log.event.includes("INVALID_TOKEN"));
  const adminActions = logs.filter((log) => log.event.startsWith("ADMIN_"));
  const fraudAlerts = logs.filter((log) => log.event.includes("TRANSFER") || log.event.includes("PAYMENT"));
  const suspiciousIps = [...new Set(logs.filter((log) => highRisk.has(log.level)).map((log) => log.ipAddress))];

  return (
    <AppShell isAdmin>
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-semibold text-steel">Administration</p>
            <h1 className="mt-1 text-4xl font-black text-night">Centre sécurité</h1>
            <p className="mt-2 max-w-2xl text-sm text-steel">Journal dynamique des accès, limites, opérations sensibles et alertes anti-fraude.</p>
          </div>
          <Link href="/admin" className="rounded-xl bg-white px-5 py-3 text-sm font-black text-night shadow-sm">Retour admin</Link>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <Stat label="Logs sécurité" value={String(logs.length)} />
          <Stat label="Connexions échouées" value={String(failedLogins.length)} />
          <Stat label="Accès refusés" value={String(deniedAccess.length)} />
          <Stat label="Actions admin" value={String(adminActions.length)} />
          <Stat label="Alertes anti-fraude" value={String(fraudAlerts.length)} />
          <Stat label="IP suspectes" value={String(suspiciousIps.length)} />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
          <div className="rounded-3xl bg-night p-6 text-white shadow-premium">
            <p className="text-sm font-semibold text-white/60">Niveau de risque global</p>
            <h2 className="mt-3 text-4xl font-black">{logs.some((log) => log.level === "CRITICAL") ? "Critique" : logs.some((log) => log.level === "HIGH") ? "Élevé" : "Stable"}</h2>
            <div className="mt-6 space-y-3 text-sm">
              {suspiciousIps.slice(0, 6).map((ip) => (
                <div key={ip} className="rounded-2xl bg-white/10 px-4 py-3 font-black">{ip}</div>
              ))}
              {!suspiciousIps.length && <div className="rounded-2xl bg-white/10 px-4 py-3 font-black">Aucune IP suspecte récente</div>}
            </div>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-premium">
            <h2 className="text-2xl font-black text-night">Alertes récentes</h2>
            <div className="mt-5 grid gap-3">
              {logs.slice(0, 6).map((log) => (
                <div key={log.id} className="rounded-2xl bg-mist p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-black text-night">{log.message}</p>
                    <Risk level={log.level} />
                  </div>
                  <p className="mt-2 text-sm text-steel">{log.event} · {log.email ?? log.user?.email ?? "Utilisateur inconnu"} · {formatDateTime(log.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-3xl bg-white shadow-premium">
          <div className="border-b border-line px-6 py-5">
            <h2 className="text-2xl font-black text-night">Journal complet</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[1180px] w-full text-left text-sm">
              <thead className="bg-mist text-xs uppercase text-steel">
                <tr><Th>Date</Th><Th>Niveau</Th><Th>Événement</Th><Th>Utilisateur</Th><Th>IP</Th><Th>Pays</Th><Th>Navigateur</Th><Th>Appareil</Th><Th>Message</Th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-mist/50">
                    <Td>{formatDateTime(log.createdAt)}</Td>
                    <Td><Risk level={log.level} /></Td>
                    <Td className="font-black text-night">{log.event}</Td>
                    <Td>{log.email ?? log.user?.email ?? "-"}</Td>
                    <Td>{log.ipAddress}</Td>
                    <Td>{log.country}</Td>
                    <Td>{log.browser}</Td>
                    <Td>{log.device}</Td>
                    <Td>{log.message}</Td>
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

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase text-steel">{label}</p><p className="mt-3 text-2xl font-black text-night">{value}</p></div>;
}

function Risk({ level }: { level: string }) {
  const tone = level === "CRITICAL" ? "bg-red-100 text-red-800" : level === "HIGH" ? "bg-orange-100 text-orange-800" : level === "MEDIUM" ? "bg-amber-100 text-amber-800" : "bg-emerald-50 text-emerald-700";
  return <span className={`rounded-full px-3 py-1 text-xs font-black ${tone}`}>{level}</span>;
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
