# MaintInsight

MaintInsight est une application web de **suivi de maintenance industrielle**. Elle centralise les sites industriels, les unités de production, les ateliers, les équipements et les campagnes d’inspection afin d’aider les équipes à détecter les dérives, prioriser les actions et produire des rapports quotidiens.

## Objectifs du projet

- Structurer le référentiel des sites industriels et de leurs équipements.
- Réaliser des inspections terrain avec mesures et diagnostics.
- Suivre l’état de santé des équipements : bon, acceptable, alerte, alarme, arrêté ou non surveillé.
- Visualiser les indicateurs de maintenance grâce à des tableaux, graphiques et cartes de synthèse.
- Générer et télécharger des rapports journaliers par site.
- Contrôler l’accès aux fonctionnalités selon les rôles utilisateurs.

## Fonctionnalités principales

### Tableau de bord global

- Vue consolidée des sites industriels.
- Cartes de synthèse et indicateurs clés.
- Suivi des équipements critiques et des alarmes.
- Historique des statuts et tendances de mesures.
- Répartition des équipements par usine, atelier et état.
- Mode de personnalisation de la grille du dashboard.

### Gestion des sites et unités

- Création et recherche de villes/sites industriels.
- Navigation par site, usine, atelier et équipement.
- Gestion des plantes/unités de production.
- Gestion des ateliers et de leurs descriptions.

### Gestion des équipements

- Création, modification et suppression d’équipements.
- Classification par type : pompe, ventilateur, agitateur, broyeur, convoyeur, etc.
- Gestion du périmètre de suivi : équipement individuel (`ENTITY`) ou partagé au niveau du site (`SITE`).
- Suivi des équipements critiques.
- Historique des inspections et des changements de statut.

### Inspections

- Création d’une inspection quotidienne ou d’une campagne.
- Statuts d’inspection : brouillon, terminée et validée.
- Sélection des équipements à inspecter.
- Saisie du statut, du diagnostic, de la recommandation et des notes.
- Saisie de mesures de vibration, température, ultrasons, pression, vitesse, courant et tension.
- Consultation de l’historique et des détails d’une inspection.

### Rapports

- Génération manuelle ou automatique de rapports par site.
- Périodes disponibles : journée courante ou dernières 24 heures.
- Sections configurables : synthèse, graphiques, usines, équipements critiques, inspections, mesures et alertes.
- Export et téléchargement des rapports PDF.
- Stockage des fichiers générés via Vercel Blob.
- Envoi éventuel du rapport par e-mail.

### Authentification et administration

- Authentification avec Better Auth.
- Connexion par e-mail et mot de passe.
- Liens de connexion et récupération de mot de passe.
- Gestion du profil, de l’avatar, du mot de passe et des sessions.
- Support des passkeys.
- Onboarding utilisateur.
- Administration des utilisateurs et des sessions.
- Rôles et permissions pour les administrateurs, managers et inspecteurs.

## Pages et navigation

### Pages publiques et authentification

- `/` : page d’accueil.
- `/login` : connexion.
- `/forgot-password` : demande de récupération du mot de passe.
- `/forgot-password/success` : confirmation d’envoi.
- `/reset-password` : réinitialisation du mot de passe.
- `/onboarding` : configuration initiale du compte.
- `/goodbye` : page de sortie après suppression ou déconnexion du compte.

### Pages du dashboard

- `/dashboard` : liste des sites industriels.
- `/dashboard/cities/[cityId]` : synthèse d’un site.
- `/dashboard/cities/[cityId]/plants` : liste des unités de production.
- `/dashboard/cities/[cityId]/plants/[plantId]` : détail d’une unité.
- `/dashboard/cities/[cityId]/plants/[plantId]/workshops` : ateliers d’une unité.
- `/dashboard/cities/[cityId]/equipments` : équipements d’un site.
- `/dashboard/cities/[cityId]/equipments/[equipmentId]` : détail d’un équipement.
- `/dashboard/cities/[cityId]/inspections` : liste des inspections.
- `/dashboard/cities/[cityId]/inspections/[inspectionId]` : détail et suivi d’une inspection.
- `/dashboard/cities/[cityId]/reports` : rapports du site.

### Pages d’administration

- `/admin` : vue d’administration.
- `/admin/users` : gestion des utilisateurs.
- `/admin/sessions` : gestion et consultation des sessions.

## Architecture technique

Le projet utilise une architecture Next.js App Router organisée par domaines fonctionnels.

```text
src/
├── app/                    # Routes, layouts et endpoints API
│   ├── (auth)/             # Parcours d’authentification
│   ├── (dashboard)/        # Espace métier protégé
│   ├── (admin)/            # Administration
│   ├── (public)/           # Pages publiques
│   └── api/                # Route handlers
├── components/ui/          # Composants UI réutilisables
├── features/
│   ├── auth/               # Authentification, profil et sécurité
│   ├── city/               # Sites industriels
│   ├── dashboard/          # Dashboard et visualisations globales
│   ├── equipments/         # Équipements
│   ├── global/             # Widgets transverses du dashboard
│   ├── inspection/         # Inspections et mesures
│   ├── plant/              # Unités de production
│   ├── report/             # Rapports
│   └── workshop/            # Ateliers
├── lib/                    # Auth, Prisma, permissions et utilitaires
└── styles/                 # Styles globaux
prisma/
├── schema/                 # Schémas Prisma auth et métier
├── migrations/             # Historique des migrations
├── generated/              # Client Prisma généré
└── seed-data/               # Données sources d’initialisation
```

### Principes d’architecture

- Les pages sont organisées avec les route groups App Router de Next.js.
- Les fonctionnalités métier sont isolées dans `src/features`.
- Les opérations d’écriture utilisent principalement des Server Actions.
- Les lectures et mutations de données passent par Prisma.
- Les paramètres de recherche, filtres et périodes sont gérés au niveau des routes et des composants dédiés.
- Les tableaux utilisent des composants réutilisables avec tri, filtrage, pagination et sélection de colonnes.
- Les graphiques sont construits avec Recharts.
- Les accès sont protégés par `src/proxy.ts` et vérifiés avec le système de permissions.

## Modèle de données

Le domaine métier repose sur les entités suivantes :

```text
User
 ├── Inspection
 └── Report

City
 ├── Plant
 └── Report

Plant
 └── Workshop
      └── Equipment
           └── InspectionEquipment
                └── Measurement
```

Les principaux enums sont :

- `EquipmentStatus` : `GOOD`, `ACCEPTABLE`, `ALERT`, `ALARM`, `STOPPED`, `NOT_MONITORED`.
- `InspectionStatus` : `DRAFT`, `COMPLETED`, `VALIDATED`.
- `MeasurementType` : vibration, température, ultrasons, pression, vitesse, courant, tension ou autre.
- `ReportStatus` : génération, terminé ou échoué.
- `ReportTrigger` : manuel ou automatique.

## Stack technique

- **Framework** : Next.js 16 avec App Router.
- **Langage** : TypeScript.
- **UI** : React 19, Tailwind CSS 4 et composants shadcn/ui.
- **Icônes** : Lucide React.
- **Base de données** : PostgreSQL.
- **ORM** : Prisma 7 avec adaptateur PostgreSQL.
- **Authentification** : Better Auth.
- **Graphiques** : Recharts.
- **Formulaires et validation** : React Hook Form et Zod.
- **Tableaux** : TanStack Table.
- **Drag and drop** : dnd-kit.
- **Stockage de fichiers** : Vercel Blob.
- **E-mails** : React Email et Resend.
- **PDF** : `@react-pdf/renderer`.
- **Import de données** : XLSX.

## Installation

### Prérequis

- Node.js compatible avec Next.js 16.
- PostgreSQL accessible depuis l’environnement de développement.
- Variables d’environnement configurées.

### Installer les dépendances

```bash
npm install
```

### Configurer les variables d’environnement

Créer un fichier `.env.development.local` à la racine du projet. Les variables principales utilisées par l’application sont :

```env
DATABASE_URL="..."
DATABASE_URL_UNPOOLED="..."
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="http://localhost:3000"
BLOB_READ_WRITE_TOKEN="..."
RESEND_API_KEY="..."
EMAIL_FROM="..."
```

Ne jamais commiter de secret ou de valeur sensible dans le dépôt.

### Initialiser la base de données

```bash
npx prisma migrate deploy
npx prisma generate
```

Pour initialiser les données de démonstration ou les données sources lorsqu’un seed est prévu :

```bash
npx prisma db seed
```

### Lancer le projet

```bash
npm run dev
```

L’application est disponible sur [http://localhost:3000](http://localhost:3000).

## Scripts disponibles

| Script | Description |
| --- | --- |
| `npm run dev` | Lance le serveur de développement. |
| `npm run build` | Applique les migrations, génère Prisma et construit l’application. |
| `npm run start` | Lance l’application compilée. |
| `npm run lint` | Vérifie la qualité du code avec ESLint. |
| `npx prisma studio` | Ouvre l’interface d’exploration de la base de données. |

## Sécurité et permissions

Les routes sensibles sont protégées par l’authentification et le proxy applicatif. Les permissions sont regroupées par ressource :

- `city` : gestion des sites.
- `plant` : gestion des unités.
- `workshop` : gestion des ateliers.
- `equipment` : gestion des équipements.
- `inspection` : création, lecture, modification et validation des inspections.
- `report` : lecture, génération, téléchargement et suppression des rapports.
- `dashboard` : accès aux indicateurs.

Toute nouvelle Server Action doit valider ses entrées avec Zod, vérifier la session de l’utilisateur et appliquer les permissions appropriées.

## API et automatisations

Les principaux endpoints se trouvent dans `src/app/api` :

- `/api/auth/[...all]` : endpoints Better Auth.
- `/api/cities` : accès aux sites.
- `/api/cities/[cityId]/plants` : unités d’un site.
- `/api/cities/[cityId]/critical-equipments` : équipements critiques.
- `/api/plants/[plantId]/critical-equipments` : équipements critiques d’une unité.
- `/api/plants/[plantId]/workshops` : ateliers d’une unité.
- `/api/avatar/upload` : upload d’avatar.
- `/api/cron/daily-reports` : génération automatisée des rapports quotidiens.

## Évolutions possibles

- Ajouter une gestion explicite des plans de maintenance préventive.
- Ajouter des seuils de mesure configurables par type d’équipement.
- Ajouter des notifications temps réel pour les alarmes critiques.
- Ajouter un historique d’audit des modifications.
- Ajouter des vues dédiées aux actions correctives et au suivi de leur résolution.
- Ajouter des tests automatisés unitaires, d’intégration et end-to-end.
- Ajouter des indicateurs de disponibilité, MTBF et MTTR.
- Ajouter l’import automatisé de nouvelles sources industrielles.

## Contribution

1. Créer une branche dédiée à la fonctionnalité.
2. Respecter l’organisation par feature dans `src/features`.
3. Ajouter la validation des entrées et les contrôles d’autorisation nécessaires.
4. Vérifier le lint et le build avant de proposer une modification.
5. Décrire clairement le changement dans la pull request.

## Licence

La licence du projet doit être précisée par les mainteneurs de MaintInsight.

## Auteur

Projet développé pour la supervision et l’analyse de la maintenance industrielle.
