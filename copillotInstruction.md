# 📋 Analyse du Projet - SAE4 DWeb DI 01 Social PAR COPILOT

## 🎯 Vue d'ensemble
- **Nom**: SAE4 DWeb DI 01 Social (Situation d'apprentissage et d'évaluation)
- **Type**: Application web full-stack avec architecture containerisée Docker
- **État**: En développement (frontend vide, backend à créer)

---

## 🏗️ Architecture Générale

### Infrastructure Docker Compose
L'application est orchestrée via Docker Compose avec 5 services :

```
┌─────────────────────────────────────────────────────┐
│                    NGINX (Reverse Proxy)             │
│          Port 8080 (Backend) | 8090 (Frontend)       │
└────────────┬────────────────────────────┬────────────┘
             │                            │
    ┌────────▼─────┐           ┌─────────▼───────┐
    │ Symfony (PHP) │           │ React + Vite    │
    │ Port 9000     │           │ Port 5173       │
    │ (Backend)     │           │ (Frontend)      │
    └────────┬─────┘           └─────────────────┘
             │
    ┌────────▼─────────────┐
    │  MySQL 8 Database    │
    │  + PhpMyAdmin (8070) │
    └──────────────────────┘
```

---

## 🔵 Frontend (React + Vite + Tailwind CSS)



### Technologies Core
- **Framework**: React 19.2.0 ([Doc officielle Context7](/reactjs/react.dev))
- **Routing**: `react-router-dom` 7.13.1 (Data Router)
- **Build Tool**: Vite 7.3.1
- **Language**: TypeScript (inféré)
- **Node.js**: Version 24
- **Linting**: ESLint 9.39.1 (avec support React hooks)
- **Formatting**: Prettier 3.8.1 + `prettier-plugin-tailwindcss` (tri automatique des classes)
- **HMR**: Activé (Hot Module Replacement)

### Styling & Design System
- **CSS Framework**: Tailwind CSS 4.0.0 ([Doc Context7](/websites/tailwindcss)) - utility-first, zéro runtime
- **Merge Utility**: Tailwind Merge 3.5.0 ([Doc Context7](/dcastil/tailwind-merge)) - fusionne les classes sans conflits
- **Class Composition**: clsx 2.1.1 - pour les conditions de classes
- **Component Variants**: Class Variance Authority (CVA) 0.7.1 - gestion des variants de composants

### Utility Function `cn()`
```typescript
// src/lib/utils.tsx
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
**Utilité**: Combine `clsx` (conditions) + `twMerge` (fusion sans conflits) pour un handling de classes robuste.

### Scripts Available
```json
{
  "dev": "vite",           // Démarrage serveur développement
  "build": "vite build",   // Build production
  "lint": "eslint .",      // Vérification code
  "preview": "vite preview" // Aperçu build production
}
```

### Routing (NOUVEAU - Actif)
- **Système cible**: React Router Data Router (`createBrowserRouter` + `RouterProvider`)
- **Dépendance installée**: `react-router-dom`
- **Structure préparée**: dossier `src/routes/` créé
- **État actuel**:
  - `src/main.tsx` utilise `RouterProvider`
  - redirection de `/` vers `/home`
  - routes actives: `/home`, `/signup`
- **Référence d'implémentation**: `routeInfo.md` (workflow Data Router, loaders, errorElement)

### Configuration Vite (docker-compatible)
- Port: 5173 (strict)
- Host: Configuré pour fonctionner en Docker (`host: true`)
- Origin: `http://localhost:8090`
- Allowed Hosts: `sae-frontend`
- Polling d'observateur: Activé (`CHOKIDAR_USEPOLLING=true`)

### Structure Actuelle
```
frontend/
├── package.json
├── vite.config.js         ✓ Pré-configuré pour Docker
├── eslint.config.js
├── tailwind.config.js     (si présent)
├── index.html
├── src/
│   ├── main.tsx           (point d'entrée)
│   ├── App.tsx            (legacy playground, non utilisé par le router)
│   ├── App.css            
│   ├── index.css          (Design tokens + typo globale Kumbh Sans)
│   ├── routes/
│   │   ├── root.tsx
│   │   ├── home.tsx
│   │   └── signup.tsx
│   ├── components/
│   │   └── ui/            (Composants atomiques)
│   │       ├──Button 
│   ├── lib/
│   │   └── utils.tsx      (Utility function `cn()`)
│   └── assets/
│       └── imageStatic/acceuilNootSki.png
└── public/
```

### Balisage HTML
Je veux que tu utilise des balises sémentique, le moins de div et de span possible.

### Tailwindcss 
N'utilise pas de class tailwind qui ne serve à rien et qui sont complexe tels que tracking ou leading ou des trucs comme ça.

### Mobile First mais aussi adapté Desktop
Il faut que le site soit responsive

### Design Tokens (index.css)
L'ensemble du système de design est défini comme **CSS variables** :

### Manière de coder
NE code pas de manière trop complexe avec des fonctions ou du code trop complexe essaye de simplifier un peu.

### Commentaire
Pour le code un peu complexe ou qui nécessite d'avoir des commentaires, mettre les commentaires en français



#### Couleurs Principales



#### Utilisation du layer pour avoir une app adaptatif au thème
```css
@theme inline{
    --color-primary: var(--color-primary);
    --color-primary-hover: var(--color-primary-hover);
    --color-background: var(--color-background);
    --color-surface: var(--color-surface);
    --color-text: var(--color-text);
    --color-border: var(--color-border);
    etc...
}

:root {
  --color-primary: #A6FD7A;
  --color-background: #161616; 
  --color-text: #ffffff;
}

/* Mode light */
[data-theme="twitter-light"] {
  --color-primary: #A6FD7A;
  --color-background: #ffffff;
  --color-text: #161616;
}

/* Thème alternatif */
[data-theme="twitter-violet"] {
 
  --color-primary: #A6FD7A;
  --color-text: #ffffff;
  --color-background: #261E2F;
}

```

#### Couleurs Composants (Button, Badge, etc.)
```css
--button-secondary-bg / text / hover
--button-danger-bg / hover
--button-ghost-text / hover
--button-outline-border / hover
--badge-default-bg / text
--badge-secondary-bg / text | success | warning | destructive
/* ... etc */
```

#### Spacing & Dimensions (Exemple)
```css
--padding-card: exemple
--padding-sm: 1.5rem;   --height-sm: 3rem;
--padding-md: 2rem;     --height-md: 4rem;
--padding-lg: 3rem;     --height-lg: 5rem;
--text-sm: 0.875rem;
--text-md: 1rem;
--text-lg: 1.125rem;

```


**Note**: Les thèmes sont expérimentaux et seront remplacés. Utilisés manuellement via `data-theme` sur les conteneurs.

### Composants Actuels (Phase de Test)
Les composants existants sont des **prototypes de test** et seront remplacés lors du design final.

#### Composants du Design Figma (Node ID: 33-289)
Source: [NOOTER Feed Design](https://www.figma.com/design/6nJhFak63U1BzHanxMzUFT/Reich-Malo?node-id=33-289&m=dev)

##### Post.tsx
Composant pour afficher une card de post/message

**Props:**
```typescript
interface PostProps {
  authorName: string;          // Nom de l'auteur (ex: "Alexandre")
  timeAgo: string;             // Temps écoulé (ex: "2h")
  content: string;             // Contenu du post (texte)
  avatarUrl?: string;          // URL avatar (placeholder par défaut)
}
```

**Styles appliqués:**
- Couleur en oklch le mieux 
- Utilisation des REM au lieu des px (plus adaptatif)

**Utilisation:**
```tsx
<Post 
  authorName="Alexandre"
  timeAgo="2h"
  content="Lorem Ipsum is simply dummy text..."
/>
```

##### FeedHeader.tsx
En-tête du feed avec titre et sous-titre

**Props:**
```typescript
interface FeedHeaderProps {
  title?: string;              // Titre (défaut: "NOOTER")
  subtitle?: string;           // Sous-titre (défaut: "pour vous :")
  className?: string;
}
```

##### Bottombar.tsx
Barre de navigation du bas avec 3 actions

**Props:**
```typescript
interface BottombarProps {
  onMenuClick?: () => void;
  onSearchClick?: () => void;
  onSettingsClick?: () => void;
  className?: string;
}
```

**Layout:**
- Boutons: Menu (hamburger) | Search (loupe) | Settings (roue)
- Background: blue `#0f62fe`
- Icons: SVG inline

#### Button.tsx ⚠️ (À remplacer)
- Variants: `primary`, `secondary`, `danger`, `ghost`, `outline`
- Sizes: `sm`, `md`, `lg`
```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import type { ReactNode } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500",
        secondary:
          "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
        danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
        ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
        outline:
          "border border-gray-300 bg-transparent hover:bg-gray-50 focus:ring-gray-500",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-lg",
      },
    },
    compoundVariants: [
      {
        variant: "outline",
        size: "lg",
        className: "shadow-sm border-gray-400 border-8",
      },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

interface ButtonDataProps {
  children: ReactNode;
}

interface ButtonViewProps extends VariantProps<typeof buttonVariants> {
  className?: string;
}

interface ButtonProps extends ButtonDataProps, ButtonViewProps {}

export default function ButtonCva({
  children,
  variant,
  size,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </button>
  );
}
```
- *Note: Ce composant sera probablement remplacé selon le design final*

#### badge.tsx ⚠️ (À remplacer)
- Variants: `default`, `secondary`, `success`, `warning`, `destructive`, `outline`
- Sizes: `sm`, `md`, `lg`
- Compound variants pour la border
- *Note: À remplacer selon le design final*

### État Actuel du Frontend
- ▶️ React 19 + TypeScript configurés
- ▶️ `react-router-dom` installé
- ▶️ Data Router branché (`RouterProvider` actif)
- ▶️ Redirection `/` -> `/home`
- ▶️ Routes `home` et `signup` actives
- ▶️ Tailwind CSS 4 + Tailwind Merge + CVA + clsx
- ▶️ Prettier avec tri automatique Tailwind
- ▶️ Design tokens définis dans `index.css`
- ▶️ Typographie globale: **Kumbh Sans**
- ▶️ Utility function `cn()` configurée
- ▶️ Structure `src/components/ui/` pour composants atomiques
- ▶️ Composants Figma implémentés: Home + Signup (+ Feed déjà présent)
- ▶️ Itération visuelle et fonctionnalités à continuer

### Architecture Composants (Plan)
```
src/
├── components/
│   └── ui/              (Composants atomiques réutilisables)
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Modal.tsx
│       └── ...
├── lib/
│   └── utils.tsx        (cn(), autres helpers)
└── App.tsx              (Tests de composants en brut)
```

**Note**: Pas de dossiers `features/` ou `layouts/` pour le moment.

---

## 🔴 Backend (Symfony + PHP)

### Technologies
- **Langage**: PHP 8.3-FPM
- **Framework**: Symfony (à initialiser)
- **Gestionnaire dépendances**: Composer

### Dockerfile Backend
```dockerfile
FROM php:8.3-fpm
WORKDIR /app/backend
# Extensions installées:
- PDO MySQL (pdo_mysql)
- git, unzip, libzip (dépendances)
- Composer installé globalement
```

### État Actuel
- ⚠️ **Dossier backend VIDE** - À initialiser
- À faire: `docker compose run --rm sae-backend composer create-project symfony/skeleton .`
- À faire: Instancer les entités et migrations Symfony

### API
- Point d'entrée: `http://localhost:8080/index.php`
- URL Publique: Tous les fichiers non-PHP retournent 404
- Les URLs non trouvées redirigent vers `index.php` (Symfony routing)

---

## 💾 Base de Données (MySQL 8)

### Configuration
- **Port**: Non exposé publiquement (communication interne)
- **Root Password**: `root`
- **Database**: `SAE4_DWeb_DI_01`
- **Volumes**: Données persistantes dans `database` volume

### Accès
- **PhpMyAdmin**: `http://localhost:8070`
  - URL: `sae-mysql`
  - User: `root`
  - Password: `root`

### Scripts SQL
- Localisation: `docker/mysql/sql_import_scripts/`
- Exécution: Automatique lors du démarrage du conteneur

---

## 🌐 Nginx (Reverse Proxy)

### Ports Exposés
- **8080**: Backend Symfony (port public)
- **8090**: Frontend React via proxy (port public)
- **5173**: Frontend Vite (directement - dev uniquement)
- **9000**: PHP-FPM (interne Docker uniquement)
- **8070**: PhpMyAdmin

### Routage
```nginx
# Backend (port 8080)
/ → FastCGI vers sae-backend:9000
Réécritures: URLs → index.php (Symfony routing)

# Frontend (port 8090)
/ → Proxy proxy_pass vers http://sae-frontend:5173
WebSocket Support: Upgrade headers configurés
Max File Upload: 512MB
```

### Configuration Fichier
- Chemin: `docker/nginx/default.conf`
- Document Root Backend: `/app/backend/public` (répertoire public Symfony)
- Logs:
  - Erreur: `/var/log/nginx/symfony_error.log`
  - Accès: `/var/log/nginx/symfony_access.log`

---

## 🐳 Commandes Docker Essentielles

### Démarrage
```bash
# Démarrer tous les services
docker compose up -d

# Builds+démarrage
docker compose up -d --build
```

### Installation Backend
```bash
# Créer un nouveau projet Symfony
docker compose run --rm sae-backend composer create-project symfony/skeleton .

# Installer dépendances existants
docker compose run --rm sae-backend composer install
```

### Installation Frontend
```bash
# Créer nouveau projet Vite React
docker compose run --rm sae-frontend npm create vite@latest . -- --template react

# Puis installer dépendances
docker compose run --rm sae-frontend npm install
```

### Accès aux Services
```bash
# Terminal interactif backend
docker compose exec sae-backend bash

# Terminal interactif frontend
docker compose exec sae-frontend bash

# Terminal MySQL
docker compose exec sae-mysql bash
```

---

## 📁 Arborescence Fichiers

```
sae4-dweb-di-01-social-ReichMalo/
├── docker-compose.yml              ← Configuration orchestration
├── README.md                        ← Guide installation initial
├── docker/
│   ├── backend/
│   │   ├── Dockerfile             ← PHP 8.3-FPM custom
│   │   └── php.ini                ← Configuration PHP
│   ├── frontend/
│   │   └── Dockerfile             ← Node 24 custom
│   ├── mysql/
│   │   └── sql_import_scripts/    ← Scripts d'initialisation DB
│   └── nginx/
│       └── default.conf           ← Configuration reverse proxy
├── backend/                         ← 🔴 VIDE - À initialiser
│   └── (A créer: structure Symfony)
└── frontend/                        ← ✅ React + Vite configuré
    ├── package.json
    ├── vite.config.js
    ├── eslint.config.js
    ├── index.html
    ├── public/
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── App.css
        ├── index.css
        └── assets/
```

---

## ✅ Checklist - État du Projet

### Frontend
- ✅ Node.js 24 configuré
- ✅ React 19 + TypeScript configurés
- ❌ ESLint + Prettier configurés
- ❌ Tailwind CSS 4 + Tailwind Merge + CVA + clsx
- ❌ Design tokens définis dans `index.css`
- ❌ Utility function `cn()` configurée
- ❌ Structure `src/components/ui/` créée
- ❌ **Composants du Design Figma (Node 33-289)**:
- ❌ App.tsx affiche le feed complet
- ❌ Vite.config.js adapté à Docker
- ❌ Pas de routing encore (tests en brut)
- ❌ Pas d'icons/assets (placeholders)

### Backend
- ✅ Dossier backend vide
- ❓ Symfony à initialiser
- ❓ Entités/modèles à créer
- ❓ API endpoints à implémenter
- ❓ Migrations BD à générer

### Infrastructure
- ✅ Docker Compose configuré
- ✅ Nginx reverse proxy opérationnel
- ✅ MySQL 8 prêt
- ✅ PhpMyAdmin accessible
- ✅ Volumes persistants

### Documentation
- ✅ README.md fourni
- ✅ docker-compose.yml complet
- ✅ Configurations Docker optimisées
- ✅ copilotInstruction.md détaillé

---

## 🔍 Points Clés à Retenir

1. **Le backend est vide** - Il faudra initialiser un projet Symfony zéro
2. **Frontend en phase de test** - Les composants actuels (Button, Badge, etc.) sont des prototypes et seront remplacés avec le design final Figma
3. **Design tokens via CSS variables** - Tous les styles sont définis dans `index.css` pour une maintenance centralisée
4. **Utility `cn()` obligatoire** - Toujours utiliser `cn()` pour merger les classes (évite les conflits Tailwind)
5. **CVA pour les variants** - Les composants utilisent la pattern `class-variance-authority` pour gérer les variantes
6. **HMR activé** - Les changements React se rafraîchissent automatiquement
7. **Port 8090** - Le frontend est accessible via le reverse proxy Nginx (ne pas confondre avec 5173)
8. **Dépendances PHP** - PDO MySQL déjà installé dans l'image PHP-FPM
9. **Prettier auto-format** - `prettier-plugin-tailwindcss` trie automatiquement les classes Tailwind
10. **Design Figma à venir** - Attendre les wireframes/designs pour finaliser les composants

---

## 📝 Notes d'Équipe - Décisions Importantes

### What's Expected (Attendu)
✅ Structure atomique: `src/components/ui/` seulement  
✅ Pas de dossiers `features/` ou `layouts/` pour le moment  
✅ Routing par pages dans `src/routes/` (`home`, `signup`, ...)  
✅ Espace admin séparé sous `/admin/*` (`/admin/login`, `/admin/home`, `/admin/profile`) et indépendant de `/sphere/*`  
✅ Tailwind CSS pour tout le styling  
✅ **Tailwind only**: ne pas utiliser `style={{ ... }}` dans les composants React; utiliser uniquement des classes Tailwind (y compris classes arbitraires avec tokens CSS)  
✅ CVA pour gérer les variants de composants  
✅ **Règle de réutilisation**: extraire un composant partagé uniquement s'il est réellement utilisé à plusieurs endroits  
✅ **Variants avant duplication**: pour des écrans/composants très proches, créer un composant unique avec props/variants (structure identique), plutôt que dupliquer des fichiers presque identiques  
✅ Les composants partagés vont dans des dossiers dédiés (`ui/Button`, `ui/Form`, etc.)  
✅ Design Figma sera la source de vérité pour l'itération suivante

### What's NOT Expected (Pas attendu)
❌ Loaders complexes (`defer`/`Await`) tant que les pages métier ne sont pas définies  
❌ Icons (react-icons,lucide-react, heroicons) - à ajouter après le design  
❌ Context/state management complexe - garder simple  
❌ Thème complet (dark mode) - expérimental et à remplacer  
❌ Extraire trop tôt des composants non réutilisés (sur-modularisation)  

### Prochaines Itérations
1. ▶️ Récupérer le **design Figma**
2. ▶️ Générer/adapter les composants depuis le design
3. ▶️ Ajouter les prochaines pages Figma dans `src/routes/`
4. ▶️ Intégrer le **backend API**
5. ▶️ Ajouter **state management** si nécessaire

### Plan de Migration Routing (routeInfo.md)
1. Créer le router via `createBrowserRouter` dans `src/main.tsx`
2. Monter `<RouterProvider router={router} />` à la place de `<App />`
3. Définir une route racine `path: '/'` vers la page feed actuelle
4. Ajouter un `errorElement` global pour la gestion des erreurs de navigation
5. Déplacer progressivement les écrans dans `src/routes/` (sans casser les composants `ui`)

---

## 🔍 Points Clés à Retenir (Original)

1. **Le backend est vide** - Il faudra initialiser un projet Symfony zéro
2. **Frontend configuré** - Vite est déjà adapté pour Docker (pas de modification nécessaire du vite.config.js)
3. **Base de données** - Accessible via PhpMyAdmin pour tester les migrations
4. **HMR activé** - Les changements React se rafraîchissent automatiquement
5. **Port 8090** - Le frontend est accessible via le reverse proxy Nginx (ne pas confondre avec 5173)
6. **Dépendances PHP** - PDO MySQL déjà installé dans l'image PHP-FPM

---

## 🚀 Prochaines Étapes Recommandées

### Phase 1 - Frontend (Actuelle)
1. ✅ Stack Tailwind + CVA configuré
2. ▶️ Attendre le **design Figma**
3. ▶️ Créer les composants manquants selon le design
4. ▶️ Tester les composants dans `App.tsx`
5. ▶️ Ajouter les **icons** selon les besoins
6. ▶️ Ajouter le **routing** (React Router)

### Phase 2 - Backend
1. Initialiser le projet Symfony backend
2. Configurer les entités et migrations
3. Créer l'API RESTful pour le réseau social
4. Tester l'intégration frontend-backend

### Phase 3 - Features Avancées
1. Authentification/autorisation
2. State management (Redux/Zustand/Context)
3. Tests unitaires + E2E
4. Responsive design final
5. Performance optimization
