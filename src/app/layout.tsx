import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "NovaBank - Banque mobile nouvelle génération",
  description: "Interface de néobanque moderne, fluide et sécurisée."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        {children}
        <footer className="border-t border-line bg-white px-6 py-7 text-center text-xs text-steel">
          <Link href="/conditions-utilisation" className="font-semibold text-night">
            Mentions légales
          </Link>
          <span className="mx-2">·</span>
          Projet scolaire — simulation technique.
        </footer>
      </body>
    </html>
  );
}
