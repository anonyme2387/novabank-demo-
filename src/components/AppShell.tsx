import Link from "next/link";
import { Logo } from "@/components/Logo";
import { AutoLogout } from "@/components/SecurityClient";

const nav = [
  ["Accueil", "/dashboard"],
  ["Virements", "/virements"],
  ["Écritures", "/ecritures"],
  ["Historique", "/historique"],
  ["Profil", "/profil"]
];

export function AppShell({ children, isAdmin = false }: { children: React.ReactNode; isAdmin?: boolean }) {
  return (
    <div className="min-h-screen bg-mist pb-24 md:pb-0">
      <AutoLogout />
      <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-line bg-white px-6 py-6 md:block">
        <Logo />
        <nav className="mt-10 space-y-2">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="tap block rounded-lg px-4 py-3 text-sm font-semibold text-steel hover:bg-mist hover:text-night">
              {label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" className="tap block rounded-lg px-4 py-3 text-sm font-semibold text-night hover:bg-mist">
              Administration
            </Link>
          )}
        </nav>
      </aside>
      <main className="md:ml-72">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 z-20 grid grid-cols-5 border-t border-line bg-white/95 px-2 pb-5 pt-2 text-center text-[10px] font-semibold text-steel shadow-[0_-18px_40px_rgba(5,8,22,.08)] backdrop-blur md:hidden">
        {nav.map(([label, href]) => (
          <Link key={href} href={href} className="tap rounded-2xl px-2 py-2 hover:bg-mist hover:text-night">
            <span className="mx-auto mb-1 block h-1 w-6 rounded-full bg-line" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
