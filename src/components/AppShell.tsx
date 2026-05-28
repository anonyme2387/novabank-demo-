import Link from "next/link";
import { Logo } from "@/components/Logo";

const nav = [
  ["Dashboard", "/dashboard"],
  ["Virements", "/virements"],
  ["Historique", "/historique"],
  ["Profil", "/profil"]
];

export function AppShell({ children, isAdmin = false }: { children: React.ReactNode; isAdmin?: boolean }) {
  return (
    <div className="min-h-screen bg-mist pb-20 md:pb-0">
      <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-line bg-white px-6 py-6 md:block">
        <Logo />
        <nav className="mt-10 space-y-2">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="block rounded-lg px-4 py-3 text-sm font-semibold text-steel hover:bg-mist hover:text-night">
              {label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" className="block rounded-lg px-4 py-3 text-sm font-semibold text-night hover:bg-mist">
              Administration
            </Link>
          )}
        </nav>
      </aside>
      <main className="md:ml-72">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 z-20 grid grid-cols-4 border-t border-line bg-white px-2 py-2 text-center text-xs font-semibold text-steel md:hidden">
        {nav.map(([label, href]) => (
          <Link key={href} href={href} className="rounded-lg px-2 py-2 hover:bg-mist hover:text-night">
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
