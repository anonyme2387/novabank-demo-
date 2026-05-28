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
        <footer className="border-t border-line bg-white px-6 py-8 text-sm text-steel">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
            <Link href="/" className="font-black text-night">NovaBank</Link>
            <nav className="flex gap-5">
              <Link href="/conditions-utilisation" className="font-semibold hover:text-night">Conditions</Link>
              <Link href="/#securite" className="font-semibold hover:text-night">Sécurité</Link>
              <a href="mailto:contact@novabank.demo" className="font-semibold hover:text-night">Contact</a>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
