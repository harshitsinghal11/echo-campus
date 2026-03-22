# EchoCampus

EchoCampus is a campus platform for students and faculty with role-based access, announcements, complaints, marketplace listings, lost-and-found, faculty directory, and anonymous chat.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- Supabase (Auth + Postgres + RLS)
- Firebase (anonymous real-time chat)

## Core Modules

- `app/auth/login`: email/password sign-in
- `app/main/student/*`: student dashboard, complaints, marketplace, lost-and-found, chat, profile
- `app/main/faculty/*`: faculty dashboard, announcements, complaints, lost-and-found, profile
- `app/api/complaints/*`: complaint list/create + upvote toggle
- `app/api/marketplace/*`: listing create/read + mark sold

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

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run start` - start production server
- `npm run lint` - run ESLint

## Security Notes

- Route protection exists in middleware and client guards.
- Sensitive role/write controls should remain enforced with Supabase RLS policies.
- Usage limits are enforced via database trigger functions (see `assets/Trigger&Functions_EchoCampus.txt`).

## Documentation Assets

- Schema: `assets/DatabaseSchema_Echocampus.txt`
- Policies: `assets/Policy_Echocampus.txt`
- Trigger functions: `assets/Trigger&Functions_EchoCampus.txt`
- Product overview: `assets/EchoCampus_Documentation.txt`
