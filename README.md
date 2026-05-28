# NovaBank Demo

NovaBank est une application web fictive de néobanque construite avec Next.js, TypeScript, Tailwind CSS, PostgreSQL, Prisma, bcrypt, JWT en cookies httpOnly, Zod et Cloudflare Turnstile.

Important : aucun argent réel, aucun paiement réel, aucun service bancaire réel, aucune vraie carte et aucun vrai IBAN ne sont utilisés. Toutes les données bancaires sont virtuelles et servent uniquement à une démonstration technique et visuelle.

## Fonctionnalités

- Landing page moderne en français
- Inscription avec Zod, bcrypt, CAPTCHA Turnstile et acceptation obligatoire des conditions
- Connexion avec CAPTCHA, limitation des tentatives et cookie sécurisé httpOnly
- Création automatique d’un compte fictif, solde virtuel de 1000 €, IBAN fictif et carte virtuelle fictive
- Dashboard avec solde, statistiques, transactions, IBAN et carte réaliste
- Dépôts, retraits et virements fictifs entre utilisateurs
- Historique filtrable par type de transaction
- Profil avec dernière connexion, IP masquée, pays approximatif, navigateur et appareil
- Panel admin réservé au rôle `ADMIN`
- Middleware de protection des pages privées
- Headers de sécurité et validation backend

## Données de démonstration

Le seed Prisma crée :

- Admin : `admin@novabank.demo`
- Mot de passe : `Admin123!`
- Utilisateurs fictifs : `alice@novabank.demo` et `yanis@novabank.demo`
- Mot de passe utilisateurs : `Demo123!`

## Installation locale

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Variables requises :

```bash
DATABASE_URL=
JWT_SECRET=
TURNSTILE_SECRET_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
```

En développement, si les clés Turnstile ne sont pas définies, un jeton de démonstration local est utilisé. En production, configurez les clés Cloudflare Turnstile.

## Scripts

```bash
npm run dev
npm run build
npm run start
npx prisma migrate dev
npx prisma db seed
```

## Déploiement Railway

1. Créer ou ouvrir le projet Railway `novabank-demo`.
2. Ajouter un service PostgreSQL Railway.
3. Vérifier que `DATABASE_URL` est exposée automatiquement au service web.
4. Ajouter :
   - `JWT_SECRET`
   - `TURNSTILE_SECRET_KEY`
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
5. Déployer depuis le repo GitHub `novabank-demo`.
6. Lancer les migrations :

```bash
npx prisma migrate deploy
npx prisma db seed
```

Le build Railway utilise :

```bash
npm run build
npm run start
```

## Confidentialité

NovaBank ne demande jamais d’adresse réelle, de GPS, de ville précise ou de données de paiement réelles. Les logs de connexion conservent seulement l’IP masquée, le pays approximatif, le navigateur, l’appareil et la date afin de sécuriser les comptes fictifs et limiter les abus.
