import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { TransferForm } from "@/components/ClientActions";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function TransfersPage() {
  const user = await requireUser();
  if (!user?.account) redirect("/connexion");
  return (
    <AppShell isAdmin={user.role === "ADMIN"}>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="text-center">
          <p className="font-semibold text-steel">Opération sécurisée</p>
          <h1 className="mt-2 text-4xl font-black text-night">Virement par carte</h1>
          <p className="mx-auto mt-3 max-w-2xl text-steel">Validez un paiement carte avec contrôle du solde, écriture bancaire et reçu professionnel.</p>
        </div>
        <div className="mt-8"><TransferForm /></div>
      </div>
    </AppShell>
  );
}
