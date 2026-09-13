# AGENTS.md — SymphonIA

## Architecture

- **Monorepo sans workspace** : deux apps indépendantes, pas de package manager partagé
- `symphonia/` → Frontend Next.js 16 + React 19 + TypeScript + Tailwind CSS v4
- `backend/` → FastAPI (Python) + PostgreSQL
- UI entièrement en **français**

## Commandes de développement

| Action | Commande |
|--------|----------|
| Dev frontend | `cd symphonia && npm run dev` (port 3000) |
| Build frontend | `cd symphonia && npm run build` |
| Lint frontend | `cd symphonia && npm run lint` |
| Backend | `uvicorn backend.authentification:app --reload` (port 8000) |

## Prérequis

- **PostgreSQL** doit tourner sur le port 5432
- Base : `symphoniaDb` | User : `postgres` | Password : `0000`
- La table `utilisateurs` est créée automatiquement au démarrage du backend
- Variable d'env optionnelle : `NEXT_PUBLIC_API_URL` (sinon le frontend détecte l'hostname automatiquement)

## Authentification

- JWT avec clé hardcodée dans `backend/authentification.py`
- Token stocké dans `localStorage` : clés `symphonia_token` et `symphonia_user`
- Routes protégées : `/home`, `/instrument`, `/library`, `/scanner`, `/parameter`, `/studio`
- Guard client-side dans `symphonia/components/auth/ProtectedRoutes.tsx`
- Intercepteur Axios dans `symphonia/components/auth/api.tsx`

## CSS / Thème

- Thème sombre violet/blue, variables dans `symphonia/app/globals.css`
- Tailwind v4 : utiliser `@theme inline` et `@import "tailwindcss"` (pas la syntaxe v3)
- Variables clés : `--background: #17083F`, `--color-button: #8A2BE2`

## Pièges à éviter

- **Pas de tests** : aucun framework de test n'est configuré
- **Credentials hardcodés** : mots de passe DB et JWT secret en dur dans le code
- **API URL inconsistante** : la page login détecte l'hostname dynamiquement, mais signup et parameter hardcodent `http://localhost:8000`
- **Pas de migrations** : la DB est gérée par `CREATE TABLE IF NOT EXISTS` au startup
- **Frontend = `symphonia/`** : ne pas confondre avec la racine qui ne contient que des fichiers legacy (`Formulaire.py`, dumps SQL)
