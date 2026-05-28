import Link from "next/link";
import { AuthForm } from "@/components/AuthForms";
import { Logo } from "@/components/Logo";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-mist px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <Logo />
        <div className="mt-12 text-center">
          <h1 className="text-4xl font-black text-night">Créer un compte démo</h1>
          <p className="mt-3 text-steel">Argent virtuel, carte fictive et IBAN NovaBank fictif générés automatiquement.</p>
        </div>
        <div className="mt-8"><AuthForm mode="register" /></div>
        <p className="mt-6 text-center text-sm text-steel">Déjà inscrit ? <Link href="/connexion" className="font-bold text-night">Se connecter</Link></p>
      </div>
    </main>
  );
}
