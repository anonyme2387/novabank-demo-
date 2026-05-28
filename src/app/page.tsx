import Link from "next/link";
import { Logo } from "@/components/Logo";

const benefits = [
  {
    title: "Ouverture fluide",
    text: "Un parcours clair, rapide et pensé pour aller droit au but."
  },
  {
    title: "Virements instantanés",
    text: "Des virements plus rapides que ton Wi-Fi du lycée."
  },
  {
    title: "Dashboard impeccable",
    text: "Un dashboard plus propre que ton bureau avant le rendu."
  }
];

const stats = [
  ["2M+", "utilisateurs satisfaits"],
  ["98%", "de satisfaction"],
  ["24/7", "services disponibles"],
  ["4,9/5", "expérience mobile"]
];

export default function Home() {
  return (
    <main className="overflow-hidden bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Logo />
        <div className="flex gap-3">
          <Link href="/connexion" className="tap rounded-lg px-4 py-2 font-semibold text-night hover:bg-mist">
            Se connecter
          </Link>
          <Link href="/inscription" className="tap rounded-lg bg-night px-4 py-2 font-semibold text-white shadow-lg shadow-slate-900/10">
            Ouvrir un compte
          </Link>
        </div>
      </nav>

      <section className="relative bg-night text-white soft-grid">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-cyan/10 to-transparent" />
        <div className="relative mx-auto grid min-h-[720px] max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.05fr_.95fr]">
          <div className="animate-rise">
            <p className="mb-5 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-cyan">
              Nouvelle génération bancaire
            </p>
            <h1 className="max-w-4xl text-5xl font-black leading-tight md:text-7xl">
              La banque mobile qui garde une longueur d’avance.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">
              NovaBank réunit compte, carte, virements et pilotage financier dans une expérience rapide, élégante et rassurante.
            </p>
            <p className="mt-5 max-w-2xl text-base font-semibold text-white/85">
              Une banque si rapide que même ton prof d’info va être impressionné.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/inscription" className="tap rounded-lg bg-white px-6 py-3 font-bold text-night shadow-xl shadow-black/20">
                Ouvrir un compte
              </Link>
              <Link href="/connexion" className="tap rounded-lg border border-white/20 px-6 py-3 font-bold text-white">
                Se connecter
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[430px] animate-rise lg:mr-0">
            <div className="absolute -left-10 top-12 hidden rounded-2xl bg-white/10 px-5 py-4 text-sm font-semibold text-white shadow-2xl backdrop-blur md:block">
              98% de satisfaction, les 2% restants ont oublié leur mot de passe
            </div>
            <div className="rounded-[2.4rem] border border-white/15 bg-white/10 p-3 shadow-premium backdrop-blur">
              <div className="rounded-[2rem] bg-[#f8fafc] p-4 text-night">
                <div className="mx-auto mb-4 h-1.5 w-20 rounded-full bg-slate-300" />
                <div className="rounded-3xl bg-night p-5 text-white shadow-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">NovaBank</span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">Premium</span>
                  </div>
                  <div className="mt-10 h-24 rounded-2xl bg-[radial-gradient(circle_at_20%_0%,rgba(53,208,255,.38),transparent_32%),linear-gradient(135deg,#111827,#050816)] p-4">
                    <div className="text-xs text-white/60">Carte Nova Black</div>
                    <div className="mt-8 font-mono tracking-wide">•••• 1890</div>
                  </div>
                </div>
                <div className="mt-4 grid gap-3">
                  {["Virement envoyé", "Carte active", "Budget maîtrisé"].map((item) => (
                    <div key={item} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                      <span className="font-semibold">{item}</span>
                      <span className="h-2.5 w-2.5 rounded-full bg-mint" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-4 md:grid-cols-4">
          {stats.map(([value, label]) => (
            <div key={label} className="tap rounded-2xl border border-line bg-white p-6 shadow-sm hover:shadow-xl hover:shadow-slate-900/10">
              <div className="text-4xl font-black text-night">{value}</div>
              <p className="mt-2 text-sm font-semibold text-steel">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-mist px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="font-bold text-cyan">Avantages</p>
            <h2 className="mt-2 text-4xl font-black text-night">Tout ce qu’il faut, sans friction.</h2>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {benefits.map((item) => (
              <article key={item.title} className="tap rounded-2xl border border-line bg-white p-7 shadow-sm hover:shadow-xl hover:shadow-slate-900/10">
                <h3 className="text-xl font-black text-night">{item.title}</h3>
                <p className="mt-3 leading-7 text-steel">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-20 lg:grid-cols-2">
        <div>
          <p className="font-bold text-cyan">Sécurité</p>
          <h2 className="mt-2 text-4xl font-black text-night">Une sécurité sérieuse, une expérience légère.</h2>
          <p className="mt-5 text-lg leading-8 text-steel">
            Connexion protégée, validation robuste et parcours clair. NovaBank, la banque qui ne dort jamais, contrairement aux élèves en cours de 8h.
          </p>
        </div>
        <div className="premium-panel rounded-3xl p-6">
          <div className="grid gap-4">
            {["Authentification sécurisée", "Protection anti-bots", "Alertes en temps réel", "Données sensibles protégées"].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-2xl bg-white px-5 py-4 shadow-sm">
                <span className="font-bold text-night">{item}</span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">Actif</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-night px-6 py-20 text-white soft-grid">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-5 shadow-premium backdrop-blur">
            <div className="rounded-[1.5rem] bg-white p-5 text-night">
              <div className="h-56 rounded-3xl bg-[radial-gradient(circle_at_15%_0%,rgba(53,208,255,.32),transparent_35%),linear-gradient(135deg,#050816,#111827_60%,#263241)] p-6 text-white shadow-2xl">
                <div className="flex justify-between text-sm font-semibold text-white/80">
                  <span>NovaBank Black</span>
                  <span>World Elite</span>
                </div>
                <div className="mt-16 font-mono text-xl tracking-wide">4975 9200 •••• 1890</div>
                <div className="mt-8 flex justify-between text-xs uppercase text-white/60">
                  <span>Carte premium</span>
                  <span>12/29</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <p className="font-bold text-cyan">Carte bancaire</p>
            <h2 className="mt-2 text-4xl font-black">Une carte élégante, pensée pour le quotidien.</h2>
            <p className="mt-5 text-lg leading-8 text-white/75">
              Gérez votre carte, suivez vos mouvements et gardez le contrôle depuis une interface limpide.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-20 lg:grid-cols-2">
        <div>
          <p className="font-bold text-cyan">Application mobile</p>
          <h2 className="mt-2 text-4xl font-black text-night">Une app qui donne envie d’ouvrir son budget.</h2>
          <p className="mt-5 text-lg leading-8 text-steel">
            Navigation rapide, actions claires et informations utiles au bon moment. Même le lundi matin.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-900/10">
            <div className="text-sm font-bold text-steel">Marketing</div>
            <div className="mt-3 text-3xl font-black text-night">Plus de 2M</div>
            <p className="mt-2 text-sm leading-6 text-steel">d’utilisateurs satisfaits.</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-900/10">
            <div className="text-sm font-bold text-steel">Performance</div>
            <div className="mt-3 text-3xl font-black text-night">Ultra rapide</div>
            <p className="mt-2 text-sm leading-6 text-steel">Parce que personne n’aime attendre une page qui charge.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
