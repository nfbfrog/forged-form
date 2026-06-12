# Forged-Form Project Handoff

## Product Direction

Forged-Form is a mobile-first women's health and body recomposition app.

The app is for women who want to lose fat while protecting muscle, training consistency, recovery, health signals, cycle/perimenopause context, and nutrition basics.

This should feel like a useful daily health tool, not a marketing funnel, not a peptide app, and not a generic calorie tracker.

## Current App

Project path:

`C:\Users\nfbfr\.claude\women-recomp-os`

Run locally:

```bash
npm install
npm run dev
```

Current local URL:

`http://localhost:4175/`

Repo and live app:

- Repo: `https://github.com/nfbfrog/forged-form`
- Live: `https://nfbfrog.github.io/forged-form/`
- Every push to `main` runs lint + tests + build in GitHub Actions and auto-deploys to the live URL on green.

Validation:

```bash
npm run lint
npm test
npm run build
```

Latest checks passed:

- Lint passed
- Tests passed: 3 tests
- Production build passed
- Browser verified: six tabs only, no Studio/OPP/peptide visible app language

## Current Stack

- React 19
- TypeScript
- Vite
- Vite PWA
- IndexedDB via Dexie
- Local-first storage
- Supabase client is installed and optional
- Vercel deployment-ready as a Vite app

## Current User-Facing Tabs

### Today

Daily driver:

- Protein counter
- Protein progress bar
- Quick-add meal protein buttons
- Daily anchors: protein, lift/walk, steps, hydration, sleep
- Appetite, energy, nausea one-tap segmented scales
- Cycle/body context chips
- Symptom chips
- Notes
- Daily guidance based on logged state

### Week

Weekly scoreboard:

- Seven-day habit grid
- Training session checklist
- Weekly weight, waist, blood pressure, resting pulse
- Progress photo checkbox
- Best lift note
- Trend/guardrail cards

### Plan

Decision-light nutrition:

- Two high-protein menu rotations
- Meal gram weights
- Protein swaps
- Low-appetite fallback
- Training-day fuel rules
- Simple meal-prep guidance

### Training

Strength plan:

- Ramp-in phase
- Four-day upper/lower split
- Exercise substitutions
- Weight x reps logging
- Progressive overload reminders

### Health

Health record layer:

- Cronometer CSV import
- Backup/export/restore
- Coach share summary
- Coach packet download
- Blood pressure guardrails
- Lab reference cards
- Medication-aware prompts
- General safety stop rules

### Learn

Women's health education:

- Cycle-aware training
- Protein and recomposition
- Low appetite support
- Perimenopause signals
- Bloodwork basics
- Clinician conversation prompts

## Current Product Stance

The app should stay focused on:

- Women's health
- Body recomposition
- Strength training
- Nutrition adherence
- Cycle and perimenopause context
- Symptom and recovery tracking
- Health signal organization

Avoid:

- Peptide recommendations
- Product recommendation flows
- Dosing or protocol language
- Funnel language inside the app
- Business/admin tooling in the user-facing app
- Making the app feel like an AI/content tool

## Supabase / Vercel Direction

Recommended production path:

- Keep this Vite app as the working prototype for now.
- Deploy to Vercel as a Vite PWA.
- Use Supabase for auth and cloud backup only after the health app experience feels right.
- Keep local-first behavior because daily tracking should work even without an account.

Current Supabase files exist and have been simplified around the corrected women's health direction. Review the final privacy/account model before production.

Important:

- Do not expose service-role keys in the browser.
- Keep user health data private under RLS.
- Do not connect health logs to commerce or product recommendations.

## Immediate Next Build Tasks

1. Polish the Today tab so it feels like the primary daily health screen.
2. Add preview UI for the coach summary before copying or downloading.
3. Improve the Learn tab copy and topic hierarchy.
4. Make the Health tab clearer for blood pressure, labs, symptoms, medication-aware notes, and coach sharing.
5. Decide whether the production version stays Vite or moves to Next.js.
6. Review Supabase schema against the corrected women's health direction.
7. Add account/cloud backup only after the local app feels useful.
8. Test on mobile with 5-10 real users or coaches.
9. Remove anything that feels like a funnel, generic AI tool, or business dashboard.

## Partner Notes

The important correction: Forged-Form should lead as a women's health app.

Any future AI, backend, or business functionality should support the health experience quietly. It should not become the main product surface.
