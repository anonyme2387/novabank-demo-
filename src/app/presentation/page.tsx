import Link from "next/link";
import { Logo } from "@/components/Logo";

const blocks = [
  ["Stack technique", "Next.js App Router, TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL, JWT sécurisé, cookies httpOnly, bcrypt et validation Zod."],
  ["Architecture", "Pages publiques, espace authentifié, routes API serveur, middleware de session, composants client pour les interactions et modèles Prisma relationnels."],
  ["Sécurité", "Politique de mot de passe forte, limitation des tentatives, CAPTCHA, en-têtes CSP, X-Frame-Options, cookies httpOnly et nettoyage des entrées."],
  ["Transactions", "Chaque opération met à jour les comptes avec Prisma, crée des lignes débit/crédit, génère une référence et conserve un historique consultable."],
  ["Écritures", "La page dédiée présente une vue comptable: numéro d’écriture, date de valeur, débit, crédit, solde après opération et statut."],
  ["Déploiement", "Configuration compatible Railway avec lecture automatique de DATABASE_URL et scripts npm de production."],
  ["Responsive design", "Landing, dashboard, navigation latérale desktop et barre mobile sont conçus pour une expérience fluide sur téléphone et ordinateur."],
  ["Objectifs pédagogiques", "Montrer la conception d’un produit complet: UI premium, base de données, authentification, validation serveur et parcours utilisateur cohérent."]
];

export default function PresentationPage() {
  return (
    <main className="min-h-screen bg-night text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-night/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo />
          <Link href="/" className="rounded-full bg-white px-5 py-2 text-sm font-black text-night">Retour</Link>
        </div>
      </header>
      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="font-black uppercase tracking-[0.18em] text-sky-300">Présentation technique</p>
          <h1 className="mt-5 text-5xl font-black leading-tight md:text-7xl">NovaBank, projet fintech complet.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
            Cette page résume les choix techniques, l’architecture et les points de sécurité à présenter au professeur.
            L’application reste un environnement scolaire isolé, sans opération bancaire réelle ni connexion à une banque.
          </p>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-[0_30px_100px_rgba(56,189,248,.22)] backdrop-blur">
          <div className="grid gap-4 sm:grid-cols-2">
            {["Next.js", "Prisma", "PostgreSQL", "Railway", "JWT", "Zod"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/10 p-5">
                <p className="text-2xl font-black">{item}</p>
                <p className="mt-2 text-sm text-white/60">Intégré au parcours complet.</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-5 px-6 pb-20 md:grid-cols-2">
        {blocks.map(([title, text]) => (
          <article key={title} className="rounded-3xl border border-white/10 bg-white p-6 text-night shadow-premium">
            <h2 className="text-2xl font-black">{title}</h2>
            <p className="mt-3 leading-7 text-steel">{text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
