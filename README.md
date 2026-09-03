# Sendero — Adaptive Spanish Learning Platform

Sendero is a full adaptive Spanish learning platform: it diagnoses what a
learner actually knows (down to a fine-grained CEFR sub-level per skill),
builds a curriculum around it, and continuously adapts based on real
performance — mistakes, spaced-repetition review outcomes, and confidence
signals — rather than a fixed, linear course.

This is a complete, working application: authentication, an adaptive
placement test, a full A0–C2 curriculum with a real exercise engine,
personal vocabulary with SM-2 spaced repetition, a grammar reference tied to
mastery tracking, mistake intelligence with AI explanations, an AI tutor and
roleplay conversation practice, listening/writing/speaking labs (including
shadowing), branching interactive stories, assessments, achievements, a
daily-session composer, content import, an AI lesson generator, and a
"Real World" scenario hub — all backed by a real Postgres database via
Prisma, with every AI-touched feature working out of the box even without an
AI provider configured (see [AI configuration](#ai-configuration) below).

## Requirements

- Node.js 20+
- pnpm 10+ (`corepack enable` will pick up the pinned version automatically)
- A PostgreSQL 14+ database

## Installation

```bash
pnpm install
```

## Environment variables

Copy `.env.example` to `.env` and fill in real values:

```bash
cp .env.example .env
```

| Variable               | Required | Description                                                                                          |
| ----------------------- | -------- | ------------------------------------------------------------------------------------------------------ |
| `DATABASE_URL`          | Yes      | PostgreSQL connection string, e.g. `postgresql://user:pass@localhost:5432/spanish_app`                |
| `AUTH_SECRET`           | Yes      | Random 32-byte secret for Auth.js session signing. Generate with `openssl rand -base64 32`.            |
| `NEXTAUTH_URL`          | Yes      | The app's own URL (e.g. `http://localhost:3000` locally). Must match where you actually run it.        |
| `AI_PROVIDER`           | No       | Currently `gemini` is supported. The app runs fully without this set — see below.                       |
| `GEMINI_API_KEY`        | No       | Enables real AI generation/evaluation. Get one at [aistudio.google.com/apikey](https://aistudio.google.com/apikey). Without it, deterministic fallbacks power those features. |
| `AI_MODEL`              | No       | Defaults to `gemini-2.5-flash`.                                                                          |
| `NEXT_PUBLIC_APP_URL`   | No       | Used for absolute metadata URLs.                                                                        |

## Database setup

```bash
# Push the schema to your database (fine for local dev)
pnpm db:push

# — or, for a tracked migration history —
pnpm db:migrate

# Seed a full A0–C2 curriculum, vocabulary bank, grammar topics, listening
# exercises, roleplay characters, branching stories, achievements, and a
# ready-to-explore demo account:
pnpm db:seed
```

After seeding, log in with the demo account:

```
email:    demo@sendero.app
password: Demo1234
```

The demo account is pre-onboarded (B1, Mexican Spanish) with real progress
history, saved vocabulary at varying mastery levels, and a tracked mistake —
so the dashboard, progress, vocabulary, and mistakes pages all have
meaningful content immediately. You can of course also sign up a fresh
account and go through onboarding / the placement test yourself.

### Prisma commands reference

```bash
pnpm db:generate   # regenerate the Prisma client after a schema change
pnpm db:push       # push schema.prisma to the database without a migration
pnpm db:migrate    # create/apply a tracked migration
pnpm db:seed       # (re-)run prisma/seed.ts — safe to re-run, upserts content
pnpm db:studio     # open Prisma Studio to browse the database
```

## Development

```bash
pnpm dev
```

Visit `http://localhost:3000`.

## Production build

```bash
pnpm build
pnpm start
```

## Deploying to Vercel

The app is Vercel-ready as-is. `prisma/migrations/` holds a tracked baseline
migration, and `package.json` has a `vercel-build` script
(`prisma migrate deploy && next build`) that applies pending migrations
before every build — set it as the project's Build Command.

1. **Push to GitHub** (already done if you're working from this repo) and,
   in [vercel.com](https://vercel.com), sign in and **Add New… → Project →
   Import** the repository. Vercel auto-detects Next.js.
2. **Database.** In the project's **Storage** tab, add a Postgres database
   (the Neon integration is the easiest — free tier, connects instantly) —
   or paste in a connection string from any Postgres provider you already
   have. Either way you end up with a `DATABASE_URL`.
3. **Environment variables** — Project Settings → Environment Variables:
   | Key | Value |
   | --- | --- |
   | `DATABASE_URL` | From step 2 (skip if the Neon integration set it automatically) |
   | `AUTH_SECRET` | A random 32-byte secret — generate your own with `openssl rand -base64 32` |
   | `NEXTAUTH_URL` | Your Vercel URL, e.g. `https://your-project.vercel.app` (you'll only know this after the first deploy — see step 6) |
   | `NEXT_PUBLIC_APP_URL` | Same value as `NEXTAUTH_URL` |
   | `GEMINI_API_KEY` | Optional — omit it and the app runs on deterministic fallbacks (see [AI configuration](#ai-configuration)) |
4. **Build Command** — Project Settings → Build & Development Settings →
   override the Build Command to `pnpm vercel-build` (or `npm run
   vercel-build` / `yarn vercel-build`, matching whichever package manager
   Vercel picked). This is what runs migrations against `DATABASE_URL`
   before every build.
5. **Deploy.** Trigger the first deployment (push a commit, or click Deploy
   in the dashboard). This build will fail fast with a clear error if
   `DATABASE_URL` or `AUTH_SECRET` aren't set yet — that's expected the very
   first time.
6. **Fix the URL loop.** Once deployed, copy the assigned `https://….vercel.app`
   URL, set it as both `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` in step 3,
   then redeploy (Deployments → ⋯ → Redeploy). Auth callback URLs won't work
   correctly until this matches exactly.
7. **Seed the production database** (once, after the schema is live) — from
   any machine with `psql`/Node access to `DATABASE_URL`:
   ```bash
   DATABASE_URL="<your production connection string>" pnpm db:seed
   ```
   This is idempotent (upserts content, so re-running it is safe) and is
   what makes the demo account (`demo@sendero.app` / `Demo1234`) and the
   full curriculum available immediately.
8. **Custom domain (optional).** Project Settings → Domains, then repeat
   step 6 with the custom domain once it's attached.

## AI configuration

Every AI-touched feature goes through a single abstraction,
`lib/ai/service.ts` (`AIService`), which is called from server-side
services/actions only — no AI provider key is ever sent to the browser.

**Without `GEMINI_API_KEY` set**, `AIService` transparently falls back to
deterministic, rule-based logic for every method (mistake explanations,
writing/speaking evaluation, conversation replies, lesson generation, content
extraction, learner analysis). This is a deliberate design choice, not a
missing feature: the whole app — including the AI tutor, roleplay
conversations, and the AI lesson generator — works immediately after
`pnpm db:seed`, with no external API calls or cost.

**With `GEMINI_API_KEY` set**, the same methods call the configured Gemini
model (`@google/genai`, default `gemini-2.5-flash`) and validate its JSON
output against a Zod schema (`lib/ai/schemas.ts`) before it ever reaches the
database or the UI; a failed or invalid response falls back to the same
deterministic logic rather than breaking the page. Get a free key at
[aistudio.google.com/apikey](https://aistudio.google.com/apikey).

To add a different provider, only `lib/ai/provider.ts` needs to change — the
rest of the app depends on `AIService`'s typed method signatures, not on any
particular SDK.

## Project structure

```
app/                          Next.js App Router routes
  (marketing)/                 Public landing page
  (auth)/                      Login / signup
  (onboarding)/                Onboarding wizard + adaptive placement test
  (app)/                       The authenticated app shell and all feature routes
  api/auth/[...nextauth]/      Auth.js route handler

components/
  ui/                          Hand-built shadcn/ui-style primitives (button, card, dialog, ...)
  shared/                      Cross-feature building blocks (empty/error states, logo, ...)
  marketing/                   Landing page header/footer
  features/                    One folder per feature area (learn, practice, vocabulary,
                                grammar, mistakes, review, conversation, listening, writing,
                                speaking, stories, settings, onboarding, placement, ...) —
                                each holding that feature's client components

lib/                           Framework-agnostic logic with no side effects on import order
  ai/                           AIService abstraction, provider, Zod schemas for AI output
  adaptive/                     Ability-tracking math, mastery-component math
  srs/                          SM-2 spaced-repetition scheduling + review priority scoring
  exercises/                    Exercise data Zod schemas + deterministic grading
  placement/                    Adaptive placement-test item bank + engine
  validations/                  Zod schemas for forms (auth, onboarding, settings)
  cefr.ts, nav.ts, utils.ts, speech.ts, use-speech-recognition.ts, ...

services/                      Server-only business logic — the only layer that talks to
                                Prisma directly for reads/aggregation (services/*.ts)

actions/                       "use server" mutations called from client components —
                                thin wrappers that check auth, call a service, revalidate

prisma/
  schema.prisma                 Full data model (content hierarchy separated from per-user data)
  seed.ts + seed-data/*.ts      Realistic seed content (curriculum, vocab, grammar, ...)

types/                          Ambient type augmentation (next-auth session shape)
```

### Architectural notes

- **Server Components by default.** Pages fetch data directly via
  `services/*` and pass typed props down; `"use client"` is reserved for
  genuinely interactive pieces (exercise runners, chat UI, forms).
- **Server Actions for all mutations** (`actions/*.ts`), always re-checking
  `auth()` server-side — the client never controls whose data gets written.
- **Content vs. user data are fully separate models.** `CourseLevel → Module
  → Lesson → Exercise`, `Vocabulary`, `GrammarTopic`, `Story`,
  `RoleplayCharacter`, and `ListeningExercise` are shared content;
  `UserVocabulary`, `UserGrammarProgress`, `ExerciseAttempt`, `Mistake`,
  `ReviewItem`, `SkillProfile`, `UserProgress`, and `Assessment` are
  per-user, always scoped by `userId` in every query.
- **One exercise engine, sixteen exercise types.** Every exercise's `data`
  JSON is validated against a discriminated Zod union
  (`lib/exercises/schemas.ts`) before it's persisted or rendered — including
  AI-generated exercises, so a malformed AI response can never reach the UI.
- **Adaptive loop, not disconnected pages.** The placement test, ongoing
  exercise attempts, and level-completion assessments all update the same
  `SkillProfile` via a shared logistic ability-update function
  (`lib/adaptive/ability.ts`). Mistakes and low grammar/vocabulary mastery
  feed the same unified, priority-ranked `ReviewItem` queue
  (`services/review-service.ts`), which the dashboard's weak-area detector
  and the daily-session composer both read from.

## Testing / validation checklist

This reflects what's been verified against a full production build and a
real Postgres database:

- ✅ `pnpm build` completes cleanly (44 routes, no type errors)
- ✅ `pnpm lint` passes (0 errors; a handful of intentionally-scoped `any`
  warnings on genuinely polymorphic exercise/AI-content data — see
  `eslint.config.mjs`)
- ✅ `pnpm typecheck` passes with strict TypeScript
- ✅ Registration → onboarding → placement test → dashboard flow works
  end-to-end against a real database
- ✅ Protected routes redirect to `/login` when unauthenticated
  (verified via `middleware.ts` against every `(app)` route)
- ✅ Lesson → exercise submission → skill-profile update → mistake creation
  → review-queue population all verified against the seeded demo account
- ✅ Every route group (dashboard, learn, practice, vocabulary, grammar,
  mistakes, progress, stories, listening, settings, assessments) renders
  real seeded content, confirmed by fetching each page with an authenticated
  session and checking for level-specific content markers

## What's intentionally simplified

Given the scope of the product spec, a few areas are implemented with a
deliberately lighter (but real, functional) approach rather than a full
production-grade version:

- **PWA/offline** caches previously-visited pages and static assets for
  read access offline (`public/sw.js`); it does not implement a full
  offline write-queue with background sync for mutations (submitting
  exercises, saving words) — those still require connectivity. This matches
  the product spec's own guidance to architect for offline without letting
  it complicate the core application.
- **Speaking evaluation** works from the browser's Speech-to-Text transcript
  (Web Speech API), not raw audio analysis — pronunciation/pace scores are
  therefore estimates, clearly labeled as such in the UI, rather than a
  claim of acoustic analysis.
- **Listening audio** uses the browser's Speech Synthesis API (client-side
  TTS) rather than pre-recorded audio files, so "Slow / Normal / Natural"
  speed and regional accent selection map to synthesis parameters.
