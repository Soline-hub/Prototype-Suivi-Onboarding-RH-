# Suivi Onboarding RH

Prototype d'outil web pour piloter les points de suivi RH d'onboarding chez WeFiiT :
**S+1**, **M+2**, **M+4** (tripartite RH/PAD/CPL) et **M+6** (RH + collaborateur),
calculés automatiquement à partir de la date d'embauche de chaque collaborateur.

## Stack technique

- **Next.js 16** (App Router) + **TypeScript** — frontend et API dans un seul projet
- **Tailwind CSS** — style sobre et neutre
- **Prisma + PostgreSQL** — stockage (statuts, notes, référentiel collaborateurs). PostgreSQL
  est nécessaire dès qu'on sort du poste local : un fichier SQLite ne survit pas à un
  hébergement serverless (Vercel, Netlify…) dont le système de fichiers est en lecture
  seule ou éphémère — toute création/import y échouerait silencieusement.
- Aucune authentification (accès partagé, pas de portefeuille cloisonné par HRBP)

## Démarrage rapide

Il faut une base PostgreSQL accessible (locale via Docker/Postgres.app, ou un service
gratuit type [Neon](https://neon.tech) / [Supabase](https://supabase.com) / Vercel Postgres).

```bash
npm install
cp .env.example .env      # renseigner DATABASE_URL avec votre connexion PostgreSQL
npx prisma migrate deploy # crée les tables
npm run seed               # charge 15 collaborateurs de démonstration
npm run dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).

> Le jeu de données de démonstration couvre volontairement tous les cas de figure :
> points en retard, déjà faits (avec notes), à venir, et un collaborateur parti dont
> les points restants ont été annulés.

### Réinitialiser les données

```bash
npx prisma migrate reset --skip-seed
npm run seed
```

### Déployer sur Vercel

1. Dans le projet Vercel : onglet **Storage** → **Create Database** → **Postgres**, puis
   **Connect** au projet (ajoute automatiquement la variable d'environnement `DATABASE_URL`).
2. Redéployer. Les migrations doivent être appliquées une fois sur cette base (depuis votre
   poste, avec `DATABASE_URL` pointée sur la base Vercel) :
   ```bash
   DATABASE_URL="<url copiée depuis Vercel>" npx prisma migrate deploy
   DATABASE_URL="<url copiée depuis Vercel>" npm run seed   # optionnel, données de démo
   ```

## Vues de l'application

1. **Prochaines échéances** (`/`) — bandeau de stats (retards, échéances sous 7 jours,
   répartition par type) puis liste chronologique des points sur un horizon glissant de
   90 jours ; les points en retard restent toujours visibles même hors de cette fenêtre.
   Filtres par type de point et recherche libre par nom. Action rapide "Marquer fait"
   avec saisie des notes structurées (ressenti, points d'alerte, actions à suivre).
2. **Fiche individuelle** (`/collaborateurs/[id]`) — infos du collaborateur et parcours
   complet de ses 4 points avec statuts et notes. Permet aussi de marquer le
   collaborateur comme "parti" (les points non réalisés sont alors annulés
   automatiquement).
3. **Nouveau collaborateur** (`/collaborateurs/nouveau`) — formulaire de création manuelle
   d'un nouvel arrivant (nom, date d'embauche, type de contrat, poste/équipe/BU,
   manager/PAD). C'est le chemin normal pour ajouter les arrivées au fil de l'eau : les
   4 points de suivi sont générés automatiquement, puis on est redirigé vers sa fiche.
4. **Import Excel/CSV** (`/import`) — dépôt d'un fichier Excel (`.xlsx`) ou CSV pour
   importer en masse un référentiel collaborateurs existant, mapping des colonnes (avec
   auto-détection), aperçu, puis import. Les 4 points de suivi sont générés
   automatiquement pour chaque collaborateur importé. Des fichiers d'exemple sont
   disponibles dans l'écran d'import (`public/sample-import.xlsx` et `.csv`).

## Règles de calcul des échéances

- S+1 = date d'embauche + 7 jours calendaires
- M+2 / M+4 / M+6 = date d'embauche + 2 / 4 / 6 mois calendaires (même jour du mois)
- Chaque date est ensuite décalée au **prochain jour ouvré** si elle tombe un week-end
  ou un jour férié français (fixes + mobiles : Lundi de Pâques, Ascension, Lundi de
  Pentecôte, calculés via l'algorithme de Meeus/Jones/Butcher — voir `src/lib/dates.ts`)

Un point est affiché "en retard" dès que sa date prévue est dépassée sans avoir été
marqué "fait" ou "annulé" — ce statut est calculé à l'affichage (`src/lib/checkpoints.ts`),
sans job planifié.

## Abstraction de la source de données

Le reste de l'application ne dépend jamais directement d'un format de fichier ou de
données figées : elle consomme l'interface `CollaborateurSource` (`src/lib/datasource/types.ts`) :

```ts
interface CollaborateurSource {
  readonly label: string;
  fetchCollaborateurs(): Promise<CollaborateurInput[]>;
}
```

Deux implémentations existent aujourd'hui :

- `src/lib/datasource/csv.ts` + `src/lib/datasource/spreadsheet.ts` — parsing et mapping
  de colonnes pour un fichier Excel (`.xlsx`) ou CSV (utilisé par l'écran d'import)
- `src/lib/datasource/demo.ts` — jeu de données de démonstration (utilisé par `prisma/seed.ts`)

Le point d'entrée d'un nouveau collaborateur au quotidien reste la création manuelle
(`/collaborateurs/nouveau`, route `POST /api/collaborateurs`) ; l'import Excel/CSV sert
aux imports en masse ponctuels. Si une source externe (type API RH) devait être branchée
plus tard, il suffirait d'écrire une nouvelle implémentation de cette même interface,
sans modifier le reste du code (génération des points de suivi, écrans, routes API).

## Modèle de données

- **Collaborateur** : identité, date d'embauche, type de contrat, poste/équipe/BU,
  manager/CPL, PAD référent, statut (actif/parti) + date de départ
- **Checkpoint** (point de suivi) : type (S1/M2/M4/M6), date prévue, statut
  (à venir/fait/annulé — "en retard" est dérivé à l'affichage), date de réalisation,
  et notes structurées (ressenti, points d'alerte, actions à suivre) une fois "fait"

Cycle de vie d'un point : les 4 points sont générés automatiquement à la création ou à
l'import d'un collaborateur. S'il est marqué "parti" avant d'avoir terminé son parcours,
ses points non réalisés passent automatiquement en "annulé" (ils restent visibles dans
l'historique, rien n'est masqué ni supprimé).

## Structure du projet

```
prisma/
  schema.prisma        modèle de données (Collaborateur, Checkpoint)
  seed.ts               jeu de données de démonstration
src/
  app/
    page.tsx                          vue "Prochaines échéances"
    collaborateurs/[id]/page.tsx      fiche individuelle
    collaborateurs/nouveau/page.tsx   création manuelle d'un collaborateur
    import/page.tsx                   écran d'import Excel/CSV
    api/                              routes API (checkpoints, collaborateurs, stats, import)
  components/           composants UI (badges, tableau, filtres, formulaires)
  lib/
    dates.ts             jours fériés FR + calcul des jours ouvrés
    checkpoints.ts        génération des points, statut dérivé, cycle de vie
    labels.ts             libellés et styles partagés (client + API)
    datasource/            abstraction de la source de données collaborateurs (CSV, Excel, démo)
```

## Ce qui n'est pas dans ce prototype (v1)

- Connexion directe à une API RH externe (seule l'abstraction `CollaborateurSource` est prête)
- Génération d'invitations Outlook/calendrier
- Notifications push/email automatiques
- Portefeuilles HRBP cloisonnés
- Authentification utilisateur
