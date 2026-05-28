import Link from "next/link";
import { Logo } from "@/components/Logo";

const stats = [
  ["+2M", "d’utilisateurs"],
  ["98%", "de satisfaction"],
  ["24/7", "assistance"],
  ["0 papier", "100% mobile"]
];

const reasons = [
  ["Ouverture rapide", "Un parcours simple, clair et pensé pour passer de l’idée à l’action en quelques minutes."],
  ["Virements fluides", "Des virements plus rapides que ton Wi-Fi du lycée, avec une interface qui reste toujours lisible."],
  ["Pilotage clair", "Un dashboard plus propre que ton bureau avant le rendu, même quand la semaine s’annonce chargée."]
];

const security = [
  "Authentification protégée",
  "Détection des comportements inhabituels",
  "Validation stricte des opérations",
  "Cookies httpOnly et sessions sécurisées"
];

const reviews = [
  ["Camille R.", "J’ai compris mon budget avant même de comprendre le sujet du contrôle."],
  ["Noah B.", "Le dashboard est plus clair que mon cahier de maths."],
  ["Inès M.", "Même mon prof d’info a demandé le repo."]
];

const faqs = [
  ["NovaBank fonctionne sur mobile ?", "Oui, l’expérience est pensée mobile d’abord, avec une navigation rapide et des actions accessibles."],
  ["Puis-je suivre mes dépenses ?", "Oui, le tableau de bord met en avant les mouvements, les tendances et les informations importantes."],
  ["La sécurité est-elle prise au sérieux ?", "Oui, l’interface s’appuie sur une architecture sécurisée et des contrôles côté serveur."]
];

export default function Home() {
  return (
    <main className="overflow-hidden bg-white">
      <header className="sticky top-0 z-40 border-b border-white/50 bg-white/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo />
          <div className="hidden items-center gap-8 text-sm font-semibold text-steel md:flex">
            <a href="#avantages" className="hover:text-night">Avantages</a>
            <a href="#securite" className="hover:text-night">Sécurité</a>
            <a href="#mobile" className="hover:text-night">Mobile</a>
            <a href="#faq" className="hover:text-night">FAQ</a>
          </div>
          <div className="flex gap-2">
            <Link href="/connexion" className="tap rounded-full px-4 py-2 text-sm font-bold text-night hover:bg-mist">
              Se connecter
            </Link>
            <Link href="/inscription" className="tap rounded-full bg-night px-5 py-2 text-sm font-bold text-white shadow-xl shadow-slate-900/15">
              Ouvrir un compte
            </Link>
          </div>
        </nav>
      </header>

      <section className="relative min-h-[760px] bg-[radial-gradient(circle_at_20%_12%,rgba(53,208,255,.22),transparent_30rem),radial-gradient(circle_at_82%_24%,rgba(49,214,160,.18),transparent_28rem),linear-gradient(135deg,#050816_0%,#0b1224_48%,#101828_100%)] text-white">
        <div className="absolute inset-0 soft-grid opacity-70" />
        <div className="absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.04fr_.96fr]">
          <div className="animate-rise pt-8">
            <p className="mb-6 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-cyan shadow-2xl shadow-black/10 backdrop-blur">
              Nouvelle génération bancaire
            </p>
            <h1 className="max-w-4xl text-5xl font-black leading-[1.02] md:text-7xl">
              Le compte qui rend votre argent plus lisible.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/76">
              NovaBank rassemble compte, carte, virements et budget dans une expérience premium, rapide et étonnamment agréable à utiliser.
            </p>
            <p className="mt-5 max-w-2xl text-base font-semibold text-white/90">
              Une banque si rapide que même ton prof d’info va être impressionné.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/inscription" className="tap rounded-full bg-white px-7 py-4 font-black text-night shadow-2xl shadow-cyan/20">
                Ouvrir un compte
              </Link>
              <Link href="/connexion" className="tap rounded-full border border-white/20 bg-white/5 px-7 py-4 font-black text-white backdrop-blur hover:bg-white/10">
                Se connecter
              </Link>
            </div>
            <div className="mt-12 grid max-w-3xl grid-cols-2 gap-3 md:grid-cols-4">
              {stats.map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <div className="text-2xl font-black">{value}</div>
                  <p className="mt-1 text-xs font-semibold text-white/65">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[450px] animate-float lg:mr-0">
            <div className="absolute -inset-8 rounded-[3rem] bg-cyan/20 blur-3xl" />
            <div className="absolute -left-8 top-16 hidden rounded-2xl border border-white/10 bg-white/12 px-5 py-4 text-sm font-bold text-white shadow-2xl backdrop-blur md:block">
              98% de satisfaction
            </div>
            <div className="absolute -right-8 bottom-20 hidden rounded-2xl border border-white/10 bg-white/12 px-5 py-4 text-sm font-bold text-white shadow-2xl backdrop-blur md:block">
              Budget maîtrisé
            </div>
            <div className="relative rounded-[2.5rem] border border-white/20 bg-white/12 p-3 shadow-[0_42px_120px_rgba(0,0,0,.42)] backdrop-blur-xl">
              <div className="rounded-[2rem] bg-[#f7f9fc] p-4 text-night">
                <div className="mx-auto mb-5 h-1.5 w-20 rounded-full bg-slate-300" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase text-steel">Bonjour Sofia</p>
                    <p className="text-xl font-black">Vue d’ensemble</p>
                  </div>
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-night text-sm font-black text-white">N</div>
                </div>
                <div className="relative mt-6">
                  <div className="absolute -inset-5 rounded-[2rem] bg-cyan/30 blur-2xl" />
                  <div className="relative h-52 rounded-[1.65rem] bg-[radial-gradient(circle_at_18%_0%,rgba(53,208,255,.38),transparent_34%),radial-gradient(circle_at_100%_100%,rgba(49,214,160,.22),transparent_30%),linear-gradient(135deg,#050816,#111827_58%,#263241)] p-6 text-white shadow-2xl">
                    <div className="flex items-center justify-between text-sm font-bold text-white/85">
                      <span>NovaBank Black</span>
                      <span>Premium</span>
                    </div>
                    <div className="mt-10 h-10 w-14 rounded-lg bg-gradient-to-br from-amber-200 via-yellow-500 to-amber-700 shadow-lg" />
                    <div className="mt-7 font-mono text-lg tracking-wide">4975 9200 •••• 1890</div>
                    <div className="mt-5 flex justify-between text-xs uppercase text-white/60">
                      <span>Carte active</span>
                      <span>12/29</span>
                    </div>
                  </div>
                </div>
                <div className="mt-5 grid gap-3">
                  {["Virement envoyé", "Objectif atteint", "Carte sécurisée"].map((item) => (
                    <div key={item} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                      <span className="font-bold">{item}</span>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">OK</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="avantages" className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-3xl">
          <p className="font-black text-cyan">Pourquoi choisir NovaBank ?</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight text-night md:text-5xl">Une expérience bancaire claire, rapide et bien dessinée.</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {reasons.map(([title, text]) => (
            <article key={title} className="tap rounded-3xl border border-line bg-white p-8 shadow-[0_18px_60px_rgba(5,8,22,.08)] hover:shadow-[0_28px_90px_rgba(5,8,22,.13)]">
              <div className="mb-6 h-12 w-12 rounded-2xl bg-night shadow-xl shadow-slate-900/20" />
              <h3 className="text-2xl font-black text-night">{title}</h3>
              <p className="mt-4 leading-7 text-steel">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="securite" className="bg-mist px-6 py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <p className="font-black text-cyan">Sécurité avancée</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-night md:text-5xl">Une sécurité sérieuse, sans rendre l’expérience compliquée.</h2>
            <p className="mt-6 text-lg leading-8 text-steel">
              Connexion protégée, contrôles serveur et parcours lisible. NovaBank reste calme, même quand tout le monde rend son projet à 23h58.
            </p>
          </div>
          <div className="premium-panel rounded-[2rem] p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {security.map((item) => (
                <div key={item} className="rounded-2xl bg-white p-5 shadow-sm">
                  <span className="mb-5 block h-2 w-14 rounded-full bg-mint" />
                  <p className="font-black text-night">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="mobile" className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-24 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <div className="rounded-[2rem] bg-night p-5 shadow-[0_36px_110px_rgba(5,8,22,.28)]">
            <div className="rounded-[1.5rem] bg-white p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-night">Application mobile</h3>
                <span className="rounded-full bg-mist px-3 py-1 text-xs font-black text-steel">Live</span>
              </div>
              <div className="mt-8 h-48 rounded-3xl bg-[linear-gradient(135deg,#050816,#1f2937)] p-5 text-white">
                <p className="text-sm text-white/60">Dépenses du mois</p>
                <div className="mt-4 flex h-28 items-end gap-2">
                  {[42, 58, 46, 72, 63, 88, 79].map((height, index) => (
                    <span key={index} className="flex-1 rounded-t-lg bg-gradient-to-t from-cyan to-mint" style={{ height: `${height}%` }} />
                  ))}
                </div>
              </div>
              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl bg-mist p-4 font-bold text-night">Budget transport · stable</div>
                <div className="rounded-2xl bg-mist p-4 font-bold text-night">Objectif épargne · en avance</div>
              </div>
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <p className="font-black text-cyan">Gestion intelligente du budget</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight text-night md:text-5xl">Comprendre son argent devient presque agréable.</h2>
          <p className="mt-6 text-lg leading-8 text-steel">
            Des graphiques clairs, des catégories lisibles et des mouvements faciles à parcourir. Une app pensée pour agir vite, pas pour chercher les boutons.
          </p>
        </div>
      </section>

      <section className="bg-night px-6 py-24 text-white soft-grid">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="font-black text-cyan">Avis utilisateurs</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">Ils gardent le sourire, même devant leurs dépenses.</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {reviews.map(([name, text]) => (
              <article key={name} className="tap rounded-3xl border border-white/10 bg-white/10 p-7 shadow-2xl backdrop-blur hover:bg-white/15">
                <p className="text-lg leading-8 text-white/85">“{text}”</p>
                <p className="mt-6 font-black text-white">{name}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-5xl px-6 py-24">
        <div className="text-center">
          <p className="font-black text-cyan">FAQ</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight text-night md:text-5xl">Les réponses avant la question bonus.</h2>
        </div>
        <div className="mt-10 divide-y divide-line rounded-3xl border border-line bg-white shadow-[0_24px_80px_rgba(5,8,22,.08)]">
          {faqs.map(([question, answer]) => (
            <details key={question} className="group p-6 open:bg-mist/50">
              <summary className="cursor-pointer list-none text-lg font-black text-night">{question}</summary>
              <p className="mt-4 leading-7 text-steel">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-[radial-gradient(circle_at_20%_0%,rgba(53,208,255,.22),transparent_26rem),linear-gradient(135deg,#050816,#111827)] p-10 text-center text-white shadow-[0_34px_120px_rgba(5,8,22,.28)] md:p-16">
          <h2 className="text-4xl font-black tracking-tight md:text-5xl">Prêt à découvrir NovaBank ?</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/72">
            Une interface rapide, un design soigné et des outils clairs pour gérer son quotidien avec plus de sérénité.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/inscription" className="tap rounded-full bg-white px-7 py-4 font-black text-night shadow-2xl shadow-cyan/20">
              Ouvrir un compte
            </Link>
            <Link href="/connexion" className="tap rounded-full border border-white/20 px-7 py-4 font-black text-white">
              Se connecter
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
