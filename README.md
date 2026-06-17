# diddymmo 🏠

> SOURISSEAU Maël, JAUDINOT Martin, MICHAUX Nicolas
## Infra: https://gitlab.com/lsblk2exa_1/infra_diddymmo

**Plateforme immobilière** pour la gestion de biens en location et à la vente
## Fonctionnalités

- **Vitrine publique** : liste des biens disponibles (achat / location), filtres, fiche détail avec photos, DPE/GES, caractéristiques et coordonnées de l'agent
- **Comptes & vérification email** : inscription, connexion par JWT, validation de l'adresse par code envoyé par email (via [Resend](https://resend.com/))
- **Espace client** : « Mes biens » avec fiche détaillée par bien — **prochain paiement** (loyer + charges et échéance), caractéristiques, gestionnaire, documents du bien
- **Panneau admin** :
  - **Biens** : création / édition / suppression, avec **upload de photos** (téléversement de fichier servi en statique, ou ajout par URL)
  - **Utilisateurs** : gestion des comptes et des rôles (`USER`, `EMPLOYEE`, `ADMINISTRATOR`)
  - **Assignation** d'un bien à un locataire / acheteur
  - **Documents** et **tickets** : suivi et traitement

## Prérequis

- [Bun](https://bun.sh/)
- Docker + Docker Compose (pour PostgreSQL)

## Installation

```bash
git clone git@github.com:maelsrs/diddymmo-dev.git
cd diddymmo-dev
```

### 1. Base de données

PostgreSQL via Docker :

```bash
docker compose up -d
```

> [!NOTE]
> Le projet utilisait MongoDB à l'origine, migré vers **PostgreSQL** car MongoDB 5.0+ exige le jeu d'instructions AVX, absent de certains processeurs de serveur.

### 2. Backend

```bash
cd backend
bun install
cp .env.example .env
bun run db:push        # creer le schéma dans Postgres
bun run dev            # http://localhost:3000
```

Variables d'environnement (`backend/.env`) :

```env
DATABASE_URL=postgresql://diddymmo:diddymmo@localhost:5432/diddymmo?schema=public
JWT_SECRET=change-me
RESEND_API_KEY=re_xxx              # clé Resend pour l'envoi des emails de vérification
PUBLIC_URL=http://localhost:3000
```

### 3. Frontend

```bash
cd front
bun install
bun run dev            # http://localhost:5173
```

L'URL de l'API est configurable via `VITE_API_URL` (par défaut `http://localhost:3000`).

## Structure

```
.
├── backend/
│   ├── src/
│   │   ├── index.ts                  # Bootstrap Elysia + montage des routes
│   │   ├── routes/                   # auth, user, real-estate, document, ticket, upload
│   │   └── lib/
│   │       ├── auth.ts               # JWT, authPlugin, requireAuth / requireRole
│   │       ├── prisma.ts             # Client Prisma
│   │       └── resend.ts             # Envoi des emails (codes de vérification)
│   ├── prisma/schema.prisma          # Modèles : User, RealEstate, Document, Ticket…
│   └── uploads/                      # Photos téléversées (servies en statique)
├── front/
│   └── src/
│       ├── App.tsx                   # Routes (public / espace-client / admin)
│       ├── pages/
│       │   ├── (public)              # Home, Buy, Rent, Sell, Contact, PropertyPage
│       │   ├── client/               # Dashboard, PropertyDetail, Documents, Tickets
│       │   └── admin/                # Users, Properties (CRUD), Documents, Tickets
│       ├── components/               # layout, sections, property, ui, guards
│       ├── hooks/useApi.ts           # Wrapper fetch (get/post/put/del/upload + token)
│       └── lib/                      # api.ts, propertyMapper.ts
└── docker-compose.yml                # PostgreSQL
```

## Technologies

- **Frontend** : [React 19](https://react.dev/) / [TypeScript](https://www.typescriptlang.org/) / [Vite](https://vite.dev/) / [React Router 7](https://reactrouter.com/)
- **Backend** : [Bun](https://bun.sh/) / [Elysia](https://elysiajs.com/) / [Prisma](https://www.prisma.io/) / [@elysiajs/jwt](https://elysiajs.com/plugins/jwt.html)
- **DB** : [PostgreSQL](https://www.postgresql.org/)
- **Email** : [Resend](https://resend.com/)
- **Déploiement** : [Docker](https://www.docker.com/)
