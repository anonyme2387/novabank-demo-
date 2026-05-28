import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function Home() {
  return (
    <main className="bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Logo />
        <div className="flex gap-3">
          <Link href="/connexion" className="rounded-lg px-4 py-2 font-semibold text-night hover:bg-mist">Se connecter</Link>
          <Link href="/inscription" className="rounded-lg bg-night px-4 py-2 font-semibold text-white">Créer un compte démo</Link>
        </div>
      </nav>
      <section className="overflow-hidden bg-night text-white soft-grid">
        <div className="mx-auto grid min-h-[620px] max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-[1.05fr_.95fr]">
          <div className="animate-rise">
            <p className="mb-5 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-cyan">Prototype fictif premium</p>
            <h1 className="max-w-3xl text-5xl font-black leading-tight md:text-7xl">NovaBank</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">
              Une expérience de néobanque moderne pour tester un dashboard, des cartes virtuelles, des virements fictifs et la sécurité applicative sans argent réel.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/inscription" className="rounded-lg bg-white px-6 py-3 font-bold text-night">Créer un compte démo</Link>
              <Link href="/connexion" className="rounded-lg border border-white/20 px-6 py-3 font-bold text-white">Se connecter</Link>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-5 shadow-premium">
            <div className="rounded-2xl bg-white p-5 text-night">
              <div className="flex items-center justify-between">
                <span className="font-bold">Solde virtuel</span>
                <span className="rounded-full bg-mist px-3 py-1 text-xs font-bold">EUR fictif</span>
              </div>
              <div className="mt-6 text-5xl font-black">1 000,00 €</div>
              <div className="mt-8 grid grid-cols-3 gap-3 text-center text-sm">
                {["Compte fictif", "Carte virtuelle", "Virements fictifs"].map((item) => (
                  <div key={item} className="rounded-xl bg-mist p-4 font-semibold">{item}</div>
                ))}
              </div>
              <div className="mt-5 h-28 rounded-xl bg-gradient-to-r from-night via-slate-800 to-cyan p-4 text-white">
                <div className="text-xs opacity-70">NovaBank Virtual</div>
                <div className="mt-8 font-mono">4975 9200 0000 1890</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-4 px-6 py-16 md:grid-cols-4">
        {["Compte fictif", "Carte virtuelle", "Virements fictifs", "Statistiques"].map((title) => (
          <article key={title} className="rounded-2xl border border-line bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-night">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-steel">Module réaliste destiné à la démonstration technique avec données virtuelles uniquement.</p>
          </article>
        ))}
      </section>
    </main>
  );
}
