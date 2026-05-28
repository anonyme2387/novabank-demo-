import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { TransferForm } from "@/components/ClientActions";
import { requireUser } from "@/lib/auth";

export default async function TransfersPage() {
  const user = await requireUser();
  if (!user?.account) redirect("/connexion");
  return (
    <AppShell isAdmin={user.role === "ADMIN"}>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-4xl font-black text-night">Virements fictifs</h1>
        <p className="mt-3 text-steel">Envoyez de l’argent virtuel à un autre utilisateur par email ou IBAN NovaBank fictif.</p>
        <div className="mt-8"><TransferForm /></div>
      </div>
    </AppShell>
  );
}
