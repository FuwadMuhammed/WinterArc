# Designers Winter Arc

A 12-week challenge for designers with two end results, a shipped product and a case study deck, built with Next.js (App Router), TypeScript, Tailwind CSS, and Supabase.

## Stack

- **Next.js 16** (App Router, Server Actions, Turbopack)
- **Tailwind CSS v4**
- **Supabase**, Postgres, Auth (email/password + Google), Row Level Security
- **Google Sans Flex** for headings and body text (`next/font/google`)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

Create a project at [supabase.com](https://supabase.com), then copy your Project URL and anon/public key (**Project Settings → API**) into `.env.local`:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Apply the database schema

This repo uses the Supabase CLI's migration files in `supabase/migrations/`. Link your project and push:

```bash
npx supabase login
npx supabase link --project-ref your-project-ref
npx supabase db push
```

This creates the schema (`arcs`, `weeks`, `tasks`, `user_arcs`, `task_entries`, RLS policies) and seeds the pre-built 12-week Winter Arc plan.

If you'd rather run the SQL by hand, paste the files in `supabase/migrations/` into the Supabase SQL Editor in filename order (0001 through 0006).

### 4. Enable email auth (and optionally Google)

Email/password auth is on by default. To enable **Google sign-in**:

1. In Google Cloud Console, create an OAuth 2.0 Client ID (Web application).
2. Add `https://<your-project-ref>.supabase.co/auth/v1/callback` as an authorized redirect URI.
3. In Supabase Dashboard → **Authentication → Providers → Google**, paste the Client ID and Secret and enable the provider.
4. In Supabase Dashboard → **Authentication → URL Configuration**, add your app's origin (e.g. `http://localhost:3000`, and your Vercel URL once deployed) to Redirect URLs.

### 5. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:3000`, the whole app lives on this one page. Guests see a read-only preview of the Winter Arc; signing in (via the popup, opened from "Join" in the header or sidebar) automatically joins the arc, since there's only one.

## App structure

There's a single route (`/`) plus the OAuth callback (`/auth/callback`), no separate dashboard/join/login/profile pages. `src/components/home/HomeShell.tsx` is the client-side shell: it holds which of the three tabs (Overview, Daily, Weekly) is active and whether the auth or profile popup is open. `src/app/page.tsx` fetches everything server-side via `getHomeData()` (`src/lib/arc-data.ts`) and passes it down as props.

- **Overview**, a progress grid with one square per active plan day (66, rest days excluded), filled from the left as days get completed with no gaps and at most one partial square for the day in progress and stats (total repetitions, completion rate, longest streak of consecutive plan days with a task done), all derived from `tasks` + `task_entries`, never from timestamps, plus today's tasks, this week's deliverables, and a per-category progress breakdown.
- **Daily**, a week's daily tasks (Days 1–6; Day 7 is always rest), grouped by day, with prev/next navigation across weeks 1..current so missed days can be filled in later. Future weeks stay locked.
- **Weekly**, a week's deliverables, sharing the same week navigation. Connections made (completed connection tasks) show in the sidebar's quick facts.
- Guests (not signed in, or signed in but not joined) see a read-only preview of each tab, the first day or first couple of deliverables visible, the rest blurred with a "Join to see the rest" prompt; visible items are inert (`TaskCard`'s `readOnly` prop) until they join.

Signing in doubles as joining: `signInAction`, `signUpAction`, and the `/auth/callback` route (covers Google OAuth and email-confirmation links) all call `ensureJoined()` right after establishing a session. All mutations live in `src/lib/actions.ts`.

## Data model

- `arcs`, the challenge program (the seeded Winter Arc: 12 weeks; plan content lives in `supabase/migrations/0007_two_goal_plan.sql`). Each member runs their own timeline: Day 1 is the day they join (`user_arcs.joined_at`), and the arc ends exactly 12 weeks later
- `weeks`, per-week metadata: `is_rest_week` (Week 7 has none), `connection_goal` (how many connection-task units count as done that week)
- `tasks`, one row per task; `day_number` 1–7 for a daily task, `null` for a weekly deliverable. `category` is one of `ui_practice`, `connection`, `learn_explain`, `rotating_lens`, `build_public`, `reflection`. `requires_proof` marks tasks that need a submitted link/note instead of a plain tick. `weight` lets one task count for more than one unit (e.g. Week 12's "Reconnect, Twice")
- `user_arcs`, a user's membership in an arc (join date, status)
- `task_entries`, one row per completed/attempted task: `completed`, optional `note` (the submitted proof for `requires_proof` tasks)

All tables are RLS-protected, every read/write on `user_arcs` and `task_entries` is scoped to `auth.uid()`.

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add the two `NEXT_PUBLIC_SUPABASE_*` env vars in Vercel project settings.
4. Add the deployed URL to Supabase's Redirect URLs (Authentication → URL Configuration) for OAuth to work in production.

## Legal pages and account deletion

- `/privacy` and `/terms` (`src/app/privacy`, `src/app/terms`, copy in `src/components/legal/`) are linked from the site footer and the auth modal. Update the "Last updated" date when the copy changes.
- "Delete account" in the profile sheet calls `deleteAccountAction`, which uses the Supabase service-role key (`SUPABASE_SERVICE_ROLE_KEY`, server-only) to remove the auth user; memberships and entries cascade. The key must be set in production or deletion fails with a clear error.
