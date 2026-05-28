import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-mist px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <Logo />
        <article className="mt-10 rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-4xl font-black text-night">Conditions d’utilisation</h1>
          <div className="mt-8 space-y-6 leading-7 text-steel">
            <section><h2 className="text-xl font-black text-night">Projet scolaire</h2><p>NovaBank est un projet scolaire conçu pour présenter une simulation technique d’interface bancaire moderne.</p></section>
            <section><h2 className="text-xl font-black text-night">Aucune opération réelle</h2><p>Aucune opération bancaire réelle n’existe sur ce site. Aucune vraie somme d’argent n’est utilisée, aucun paiement réel n’est effectué et aucune banque réelle n’est connectée.</p></section>
            <section><h2 className="text-xl font-black text-night">Données enregistrées</h2><p>Le service conserve l’email, les logs de connexion, l’adresse IP de connexion, le pays approximatif, le navigateur et le type d’appareil. Aucune adresse réelle, aucune ville précise, aucun GPS et aucune donnée de paiement réelle ne sont demandés.</p></section>
            <section><h2 className="text-xl font-black text-night">Finalité</h2><p>Ces données servent uniquement à sécuriser les comptes, empêcher les abus, limiter les bots et tester le fonctionnement technique global du projet.</p></section>
            <section><h2 className="text-xl font-black text-night">Interdictions</h2><p>NovaBank n’utilise pas Stripe, PayPal, de vraie carte bancaire, de vrais IBAN, de vrais paiements ou de connexion à une vraie banque.</p></section>
          </div>
          <Link href="/" className="mt-8 inline-flex rounded-lg bg-night px-5 py-3 font-bold text-white">Retour</Link>
        </article>
      </div>
    </main>
  );
}
