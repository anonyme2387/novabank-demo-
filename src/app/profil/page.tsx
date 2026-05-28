import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { LogoutButton, PasswordForm } from "@/components/ClientActions";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser();
  if (!user?.account) redirect("/connexion");
  const lastLogin = await prisma.loginLog.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  return (
    <AppShell isAdmin={user.role === "ADMIN"}>
      <div className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-4xl font-black text-night">Profil</h1>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">Informations utilisateur</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <Row label="Nom" value={`${user.firstName} ${user.lastName}`} />
              <Row label="Email" value={user.email} />
              <Row label="Rôle" value={user.role} />
              <Row label="Compte" value={user.account.status === "ACTIVE" ? "Actif" : "Bloqué"} />
            </dl>
          </section>
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">Dernière connexion</h2>
            {lastLogin ? (
              <dl className="mt-5 space-y-3 text-sm">
                <Row label="IP" value={lastLogin.ipAddress} />
                <Row label="Pays" value={lastLogin.country} />
                <Row label="Navigateur" value={lastLogin.browser} />
                <Row label="Appareil" value={lastLogin.device} />
                <Row label="Date" value={new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(lastLogin.createdAt)} />
              </dl>
            ) : <p className="mt-5 text-steel">Aucune connexion enregistrée.</p>}
          </section>
          <section className="rounded-2xl bg-white p-6 shadow-sm md:col-span-2">
            <h2 className="mb-4 text-xl font-black">Sécurité</h2>
            <PasswordForm />
            <div className="mt-6"><LogoutButton /></div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4 border-b border-line pb-3"><dt className="text-steel">{label}</dt><dd className="font-bold text-night">{value}</dd></div>;
}
