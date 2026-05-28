import Link from "next/link";
import { AuthForm } from "@/components/AuthForms";
import { Logo } from "@/components/Logo";

export default function LoginPage({ searchParams }: { searchParams?: { error?: string } }) {
  const initialError = searchParams?.error === "session" ? "Session expirée" : "";
  return (
    <main className="min-h-screen bg-mist px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <Logo />
        <div className="mt-12 text-center">
          <h1 className="text-4xl font-black text-night">Connexion sécurisée</h1>
          <p className="mt-3 text-steel">Protection CAPTCHA, limitation des tentatives et cookie httpOnly.</p>
        </div>
        <div className="mt-8"><AuthForm mode="login" initialError={initialError} /></div>
        <p className="mt-6 text-center text-sm text-steel">Nouveau ? <Link href="/inscription" className="font-bold text-night">Ouvrir un compte</Link></p>
      </div>
    </main>
  );
}
