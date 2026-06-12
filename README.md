# FormForge

Mobile-first women's health and body recomposition tracker with coach-ready summaries.

## Current Stack

- React 19
- TypeScript
- Vite
- Vite PWA service worker
- Dexie / IndexedDB local storage
- Zod backup validation
- PapaParse Cronometer CSV import
- Lucide icons
- Supabase-ready cloud/account bridge

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:4175` or the Vite URL shown in the terminal.

Useful checks:

```bash
npm run lint
npm test
npm run build
```

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/migrations/001_formforge_core.sql` in the Supabase SQL editor.
3. Copy `.env.example` to `.env`.
4. Fill in:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-or-publishable-key
```

5. Restart the dev server.

Cloud sync is optional. Without these env vars, FormForge stays local-only.

## Vercel Setup

Deploy as a Vite app.

Build command:

```bash
npm run build
```

Output directory:

```bash
dist
```

Set these Vercel environment variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Do not put Supabase service-role keys in the browser app.

## Product Shape

FormForge is built as a daily-use mobile app for women running body recomposition: fat loss with muscle retention, strength training, symptom awareness, cycle/perimenopause context, and practical health tracking.

Current sections:

- `Today`: protein logging, daily anchors, appetite, energy, nausea, cycle/menopause context, symptom chips, body-read guidance.
- `Week`: 7-day habit grid, weekly vitals, BP/weight trend insight cards, training checklist.
- `Plan`: fixed high-protein menu rotation and house rules.
- `Training`: ramp-in and four-day upper/lower split with set logging.
- `Health`: Cronometer CSV import, backup/restore, lab references, BP and weight-loss guardrails, and coach sharing.
- `Learn`: women's health education for training, nutrition, symptoms, perimenopause, bloodwork, and clinician conversations.

## Important Compliance Posture

The app should organize user-entered health and fitness data, not diagnose or treat conditions.

- No product recommendations from user health data.
- No dosing, protocol, injection, treatment, hormone, fertility, anti-aging, or disease-treatment claims.
- No automatic sharing of health logs, symptoms, notes, or goals.
- Coach sharing must remain user-controlled, with notes and symptoms opt-in.
- Health references should be educational and non-diagnostic.

This is not legal or medical clearance. Health, privacy, coaching, marketing, and data-sharing flows need proper review before production.

## Suggested Production Direction

If moving beyond prototype:

- Next.js + TypeScript on Vercel
- Supabase Auth for accounts
- Supabase Postgres for user data
- Supabase Storage only if progress photos are included
- Row-level security from day one
- Optional offline-first sync after the local experience is stable
- Optional secure coach access after permissions and revocation are designed

Keep this Vite app as the working prototype until the framework decision is made.
