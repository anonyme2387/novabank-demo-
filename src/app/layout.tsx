import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "NovaBank - Banque fictive de démonstration",
  description: "Prototype Next.js de néobanque fictive avec argent virtuel uniquement."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <div className="bg-night px-4 py-2 text-center text-xs font-medium text-white md:text-sm">
          NovaBank est un projet fictif utilisant uniquement de l’argent virtuel. Aucun service bancaire réel n’est proposé.
        </div>
        {children}
        <footer className="border-t border-line bg-white px-6 py-8 text-center text-sm text-steel">
          <Link href="/conditions-utilisation" className="font-semibold text-night">
            Conditions d’utilisation
          </Link>
          <span className="mx-2">·</span>
          Prototype technique fictif, sans paiement réel.
        </footer>
      </body>
    </html>
  );
}
