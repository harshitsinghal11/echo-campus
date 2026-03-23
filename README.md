# EchoCampus

EchoCampus is a role-based campus platform for students, faculty, and admins with announcements, complaints, marketplace listings, lost-and-found, directory, and anonymous chat.

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4
- Supabase (Auth + Postgres + RLS)
- Firebase (anonymous real-time chat)

## Core Modules

- `app/auth/login`: role-aware sign-in and post-login routing
- `app/main/student/*`: student dashboard, complaints, marketplace, lost-and-found, chat, profile
- `app/main/faculty/*`: faculty/admin dashboard, announcements, complaints, lost-and-found, profile
- `app/api/complaints/*`: complaint create/list + upvote toggle
- `app/api/marketplace/*`: marketplace create/list + mark sold

## Environment Variables

Create `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

## Scripts

- `npm run dev`: start development server
- `npm run build`: create production build
- `npm run start`: run production server
- `npm run lint`: run ESLint
- `npm run typecheck`: run TypeScript checks (`tsc --noEmit`)

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Windows Path Note

If your project path contains `&` (example: `Full Stack & Dynamic`), direct `.bin` shims can fail with `MODULE_NOT_FOUND`.

- Use `npm run ...` scripts from `package.json`.
- Avoid running `npx tsc` directly in this path.

## Role Access Matrix

- `student` can access `/main/student/*`
- `faculty` can access `/main/faculty/*`
- `admin` is treated as faculty-like and can access `/main/faculty/*`
- Unauthenticated users trying to access `/main/*` are redirected to `/auth/login`

Role enforcement exists in:

- `src/middleware.ts` (server-side route guard)
- `src/components/ProtectedRoute.tsx` (client-side guard)
- `app/auth/login/page.tsx` (post-login route logic)

## Database Setup Flow

Use only canonical SQL files for execution.

1. Run `assets/sql/01_tables_relations.sql`
2. Run `assets/sql/02_functions_triggers_policies.sql`

Recommended order matters because file `02` depends on tables in file `01`.

## Documentation Hierarchy (Single Source of Truth)

- Executable schema source:
  - `assets/sql/01_tables_relations.sql`
- Executable RLS/functions source:
  - `assets/sql/02_functions_triggers_policies.sql`
- SQL apply guide:
  - `assets/sql/README.md`
- Human-readable summaries (do not execute):
  - `assets/DatabaseSchema_Echocampus.txt`
  - `assets/Policy_Echocampus.txt`
  - `assets/Trigger&Functions_EchoCampus.txt`
  - `assets/EchoCampus_Documentation.txt`
- Progress/status:
  - `assets/TODO_Status_EchoCampus.md`

## Current Health

- `npm run lint`: pass
- `npm run typecheck`: pass
- `npm run dev -- --help`: pass
