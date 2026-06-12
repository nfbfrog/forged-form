# Claude Handoff: Forged-Form — Premium Build Spec

You are continuing a prototype called **Forged-Form** and elevating it to a premium product.

## One-Sentence Product Definition

Forged-Form is a mobile-first women's health and body recomposition app that helps users track protein, training, habits, symptoms, cycle/perimenopause context, vitals, labs, and coach-ready progress summaries — with the polish and calm of a flagship health product.

## Evidence-Locked Decisions (deep-research pass, 2026-06-12)

These are backed by verified evidence (umbrella reviews, meta-analyses, 2023–2025 primary sources). Do not undo them or build the debunked features.

- **Protein is bodyweight-anchored, not a flat number.** Targets: ~1.2 g/kg maintain, ~1.6 recomp, ~2.0 hard-training; per-meal floor ~25–37g. Logic in `src/utils/protein.ts`. Peri/postmenopausal users get a +0.2 g/kg nudge (anabolic resistance).
- **Protein is a muscle-building lever, not a fat-loss lever.** Copy must not imply more protein = more fat loss; fat loss comes from the deficit + resistance training.
- **Resistance training is the spine** — the only weight-loss modality that preserves/builds lean mass in a deficit for women. Cardio is adjunct.
- **Progress is framed against the user's own baseline**, never male-normed strength standards.
- **DO NOT build cycle-phase training periodization.** High-quality evidence shows no benefit. Cycle/symptom data stays *descriptive* personal context, never a training prescription. The Learn tab states this honestly (a trust differentiator).
- **DO NOT predict ovulation/fertile windows from dates.** Date-based predictions are inaccurate. Keep cycle context as manual self-report; if a phase is ever shown, label it "estimated."
- **Ferritin uses physiologic thresholds** (~30 ng/mL concern, ~50 repletion), not the lab's printed floor — standard ranges underdiagnose iron deficiency in women. Framed "discuss with clinician."
- **Local-first/no-upload is a real differentiator** (female-health apps are known to mishandle sensitive data) — keep privacy obvious.
- **No verified evidence** was found for bone-density / thyroid / women's-BP-norm / GLP-1-women-specific / contraception features — do not invent them without research.

## North Star

Forged-Form should feel like the app a thoughtful friend who happens to be a great strength coach and a women's health nurse would build: private, fast, beautiful, and quietly smart. Every screen earns its place. Every tap is one-thumb-reachable. Nothing nags, sells, or diagnoses.

## Current Working Directory

```text
C:\Users\nfbfr\.claude\women-recomp-os
```

## Ship Process (end-to-end)

The project is a real repo with a live deployment. This is the canonical path for every change:

1. Make changes locally; validate with `npm run lint`, `npm test`, `npm run build`.
2. Commit on `main` and push:

```text
Repo: https://github.com/nfbfrog/forged-form
```

3. GitHub Actions (`.github/workflows/deploy.yml`) runs lint + tests + build on every push to `main`. A failed check blocks the deploy.
4. On green, it deploys to GitHub Pages automatically:

```text
Live: https://nfbfrog.github.io/forged-form/
```

Build notes:

- The Pages build sets `VITE_BASE=/forged-form/`; local dev stays at `/`. Base is wired through `vite.config.ts` (including the PWA manifest `start_url`/`scope`).
- Dev server port 4175 is enforced with `strictPort` in `vite.config.ts`.
- Never commit `.env` files; Supabase keys are env vars only (see `.env.example`).

## Run / Validate

```bash
npm install
npm run dev
```

Local app URL:

```text
http://localhost:4175/
```

Validation:

```bash
npm run lint
npm test
npm run build
```

Known environment note:

On this Windows/Codex setup, `npm test` and `npm run build` may fail inside the sandbox with Vite/Rolldown `spawn EPERM`. The commands passed when run outside the sandbox.

Audit decisions now locked into the product (2026-06-11):

- Logging a training set auto-marks that session in Week and completes Today's movement anchor — one workout is logged once, never three times.
- Exercise rows show "Last session: W x R" across days and prefill placeholders — progressive overload needs memory.
- Quick-add protein buttons are named ("Yogurt bowl · 38g"), never bare gram counts.
- Destructive actions are two-step (tap → "Reset?" → tap), never one-tap.
- Coach-share notes default OFF (opt-in); symptom counts stay default ON.
- Topbar: h1 is always the tab name; flavor copy lives in the eyebrow.
- Shape tokens: `--radius-card: 12px`, `--radius-control: 8px` — no hard-coded radii.
- Design-system spec cards live in `public/design-system/` (six @dsCard previews, both themes) and deploy with the app — live style guide at `https://nfbfrog.github.io/forged-form/design-system/`. To mirror them into a claude.ai/design project, run DesignSync from an interactive `claude` session after `/login` (this headless environment can't get design scopes).

Latest verified state (Phase 1 + audit pass complete):

- `npm run lint` passed
- `npm test` passed: 6 tests
- `npm run build` passed
- Browser check passed: six tabs only, no Studio/OPP/peptide visible app language
- Onboarding walks 5 steps, writes settings, never replays on established devices
- Anchor rings toggle and fill proportionally; protein quick-add and bottom sheet verified
- Coach summary preview renders live data on the Health tab
- Dark + light themes verified, including live system-preference switching
- Dev server port 4175 is now enforced in `vite.config.ts` (`strictPort`)

## Product Direction

This is a **women's health app** first.

It should feel like:

- A calm daily health tracker
- A body recomposition support tool
- A protein/training adherence app
- A symptom, cycle, perimenopause, and vitals organizer
- A way to give coaches useful progress data
- A premium product someone would happily pay for — even though nothing in it sells anything

It should **not** feel like:

- A peptide app
- A product funnel
- A business dashboard
- A generic AI tool
- A content generator
- A protocol/dosing app
- A pink-wellness gimmick or a bro-fitness app reskinned

---

# Premium Design System

The single biggest lever for "ultra premium" is a coherent design system. Build this **before** adding features — every feature below assumes it exists.

## Design Tokens

Create `src/design/tokens.css` (or equivalent) with CSS custom properties. No hard-coded colors, sizes, or shadows anywhere in screens.

Color:

- Base palette: warm neutral surface scale (8–10 steps), not pure gray, not pure white
- One accent: deep teal or plum — confident, not clinical, not pink-coded
- Semantic tokens: `--surface`, `--surface-raised`, `--text-primary`, `--text-secondary`, `--accent`, `--accent-soft`, `--positive`, `--caution`, `--ring-track`, `--ring-fill`
- Full dark mode from day one via `prefers-color-scheme` plus a manual toggle in Settings. Dark mode is designed, not inverted: raised surfaces get lighter, shadows become borders.

Typography:

- One variable font (e.g. system stack with `font-variation-settings`, or self-hosted Inter/Söhne-class face — must be bundled locally, no font CDN calls)
- Scale: display / title / body / label / numeric. Numbers that matter (protein count, weight) use tabular numerals at display size — the protein counter should look like a beautiful instrument readout, not a form field.

Spacing & shape:

- 4px base grid; spacing tokens `--space-1` … `--space-8`
- Radius tokens: cards 16–20px, chips full-round, sheets 24px top corners
- Elevation: max two shadow levels in light mode; borders in dark mode

Motion:

- 150–250ms ease-out transitions on everything interactive
- Ring/progress animations spring once on update, then settle — never loop
- Page transitions: subtle slide+fade between tabs
- Respect `prefers-reduced-motion` everywhere

Touch & feel:

- All tap targets ≥ 44px
- Haptic feedback via `navigator.vibrate` (where supported) on log actions: a short tick on quick-add, a double tick on hitting a daily target
- Bottom-sheet pattern for all data entry (logging never navigates away from context)
- Pull-to-refresh on Today and Week

## Premium States

These are where premium apps separate from prototypes:

- **Empty states**: every list/grid has a designed empty state with one-line copy and a single clear action. Never a blank panel.
- **Skeletons**: content-shaped shimmer placeholders while Dexie queries resolve (they're fast, but first paint should never flash empty).
- **Celebration moments**: hitting protein target, completing all five anchors, or finishing the week's training sessions triggers a brief, tasteful animation (confetti-free — think a satisfying ring-completion glow). Once per event, never re-triggered on revisit.
- **Error states**: human copy, recovery action, never raw error text.

## App Identity

- App name, icon, and splash treated as design deliverables: maskable PWA icons (192/512), themed splash, `theme-color` matching surface tokens in both modes
- Install prompt: a polite, dismissible "Add to home screen" card shown once after the user's third day of logging — never on first launch

---

# Current User-Facing Tabs

The app has six tabs. Keep them. Expansion happens **within** tabs, not by adding more.

1. Today
2. Week
3. Plan
4. Training
5. Health
6. Learn

Do not re-add Studio, Research Gateway, OPP, Modal, product funnel, or peptide language to the user-facing app.

---

# Tab Specs — Current + Premium Expansion

## 1. Today — the daily instrument panel

Purpose: the daily driver. The user should be able to do 90% of a normal day's logging here in under 30 seconds.

**LOCKED (2026-06-12): Today is a pure logging instrument.** The user rejected guidance/narrative cards. Structure, top to bottom: anchor rings → protein floor (readout + named quick-adds + custom sheet) → "Today's lift" fold-card (suggested next session, inline set logging pulled from Training) → "Body signals" fold-card (collapsed one-line summary; expands to cycle context, signal scales, symptoms, notes) → conditional safety strip only when logged signals warrant it. No next-action prose, no summary tiles, no repeated numbers. Do not re-add narrative guidance cards to Today.

Current features (keep all):

- Protein counter with progress bar and quick-add buttons from the meal plan
- Five daily anchors: Protein, Lift/walk, Steps, Hydration, Sleep
- Appetite / Energy / Nausea one-tap segmented scales with word labels (Gone→Ravenous, Flat→Strong, None→Strong); never drag sliders for discrete ratings
- Cycle/body context: Period, Follicular, Ovulation, Luteal, Peri/meno, Not tracking
- Symptom chips: Cramps, Bloat, Cravings, Headache, Hot flashes, Low mood
- Notes
- Dynamic daily guidance

Premium expansion:

- **Anchor rings**: replace checkboxes with five small activity-style rings in a single row at the top. Protein ring fills proportionally; binary anchors fill on completion. This row is the visual identity of the app.
- **Next Best Action card**: one card directly under the rings that answers "what should I do right now?" — rule-based, local: morning → "Log breakfast protein"; training day, untrained → "Today is Lower A — start when ready"; evening, protein behind → "You're 40g short; the plan's evening snack covers 32g." One card, one action, dismissible.
- **Quick Log sheet**: a floating action button opens a bottom sheet with the day's most likely entries (next planned meal, water +1, steps sync, weight). Two taps from anywhere to log anything.
- **Cycle-aware guidance**: the dynamic guidance line adapts to the selected cycle/body context — e.g. luteal + low energy → "Energy dipping here is common; hitting protein matters more than hitting PRs this week." Educational tone, never prescriptive, never medical.
- **Streaks, gently**: a small flame-free streak indicator ("12 days logged") that celebrates consistency of *logging*, not perfection of results. Streaks never shame: missing a day shows "Pick it back up" copy, not a broken-streak graphic.
- **End-of-day reflection**: after 7pm, an optional one-tap mood/word-of-the-day capture appears at the bottom. Feeds the Week view. Skippable forever without nagging.
- **Yesterday peek**: swipe right on Today to view (read-only) yesterday; swipe back. No date-picker archaeology on the home screen.

## 2. Week — the scoreboard that explains itself

Purpose: weekly trends and an intentional check-in ritual.

Current features (keep all):

- 7-day habit grid
- Training session checklist
- Weekly weight, waist, blood pressure, resting pulse
- Progress photo checkbox
- Best lift field
- Trend and guardrail cards

Premium expansion:

- **Weekly Report Card**: an auto-generated summary card at the top each Sunday/Monday: protein hit rate, training sessions done vs. planned, weight/waist trend direction, one highlighted win, one gentle focus for next week. Pure local rules, written in calm plain English.
- **Sparkline trends**: weight, waist, resting pulse, and protein average each get a 6-week sparkline with a direction annotation ("down 0.4 kg/wk — within the recomposition guardrail"). Use a tiny hand-rolled SVG sparkline component; no chart library bloat.
- **Symptom heatmap**: a compact month grid showing symptom-tag density by day, color-intensity coded. This is where cycle patterns become visible to the user — and screenshot-able for clinician visits.
- **Photo vault**: upgrade the progress-photo checkbox to an actual private photo log — stored locally in IndexedDB as blobs, never synced, never exported in the coach packet unless explicitly toggled per-share. Side-by-side compare view with a date scrubber.
- **Check-in mode**: a guided weekly flow (weight → waist → vitals → photo → reflection) presented as a 5-step sheet, designed to take under two minutes. The Week tab nudges once on the user's chosen check-in day.
- **Guardrails, explained**: each guardrail card gets a "why" expander with one paragraph of education (e.g. why losing faster than X% per week undermines recomposition). Links into the relevant Learn topic.

## 3. Plan — decision-light nutrition, now adaptive

Purpose: remove food decisions, not add them.

Current features (keep all):

- Two alternating high-protein menu rotations
- Meal gram weights
- Protein swaps
- Training-day fuel rule
- Low-appetite fallback
- Meal prep guidance

Premium expansion:

- **Plan variants**: Beginner (3 meals + 1 snack, minimal cooking), Standard (current), and Higher-volume (for users with bigger targets). Selected during onboarding, switchable in settings.
- **Appetite-adaptive day**: when the user logs appetite ≤ 3 on Today, Plan surfaces the low-appetite fallback automatically the next morning — softer textures, liquids-forward options, smaller portions hitting the same protein floor. Copy stays food-coach, never medical.
- **Swap engine**: every protein component gets 3–4 equivalent-gram swaps shown inline (tap to swap, persists for the day). Vegetarian and dairy-free swap sets included.
- **Grocery list generator**: one tap builds the week's list from the active rotation, grouped by store section, with checkable items. Local only; copyable as plain text.
- **Prep mode**: a Sunday-prep checklist view of the rotation — what to batch-cook, container counts, fridge-life notes.
- **Tonight's dinner shortcut**: the Plan tab leads with "Next meal" rather than the full rotation table; the full plan lives one tap deeper.
- **Cycle-aware fueling notes**: small educational annotations (e.g. luteal-phase appetite increase is normal; plan includes a buffer snack). Education, not prescription.

## 4. Training — a real lifting companion

Purpose: strength training support for body recomposition.

Current features (keep all):

- Ramp-in phase
- 4-day upper/lower split
- Exercise substitutions
- Weight × reps logging
- Progressive overload reminders

Premium expansion:

- **Today's Lift entry point**: Training opens on the current session (or "Rest day — next: Upper B, Thursday"), not on the program overview.
- **Active session mode**: starting a session enters a focused logging flow — one exercise card at a time, previous session's weight × reps pre-filled as placeholder, large +2.5/+5 steppers, swipe to next exercise. Designed for a phone on a bench between sets.
- **Rest timer**: auto-starts on set completion (default per exercise type, adjustable), with a subtle progress ring and optional vibration at zero. Runs correctly when the screen re-locks (timestamp-based, not interval-based).
- **Plate calculator**: tap any barbell weight to see per-side plate breakdown for the user's bar (20kg/15kg/standard/dumbbell-only settable in preferences).
- **Progression engine**: rule-based local logic — when a target weight × reps is hit across all sets, next session pre-fills the increment and shows a one-line "Time to add 2.5 kg" note. When reps drop two sessions running, suggest holding weight, and if energy/symptom logs corroborate, suggest a lighter week. Always phrased as suggestion, never command.
- **PR log**: automatic personal-record detection per exercise with a quiet celebration moment and a PR history list.
- **Session summary**: finishing a session shows a compact recap (volume, PRs, duration) with a "copy for coach" text snippet.
- **Substitution picker**: substitutions move from a static list to an inline picker per exercise (equipment-based filters: home/dumbbell-only/full gym).

## 5. Health — the records layer that builds trust

Purpose: health record layer, portability, safety, and coach sharing. This tab is where "private and capable" must be most tangible.

Current features (keep all):

- Cronometer CSV import
- JSON backup export / restore
- Medication-aware checks
- Lab reference table
- Hard-line safety guidance
- Coach share panel (7/14/30-day range, notes toggle, symptom toggle, copy summary, download JSON packet)

Premium expansion:

- **Coach summary preview**: render the exact summary text on screen before copy/download (this was already the top queued task — do it first). Formatted preview with section headers, not a raw text dump.
- **Coach packet as PDF**: in addition to JSON, generate a clean one-page PDF (client-side, e.g. via `pdf-lib` or print-stylesheet → `window.print()`) with trend sparklines, habit grid, and the latest weekly metrics. This is the artifact users actually hand to a coach or clinician.
- **Labs timeline**: upgrade the lab reference table to a personal lab log — user enters their own results with dates; each marker shows a history line with the reference range shaded. No interpretation beyond "in range / above / below the reference interval shown on your lab report." Always paired with "discuss with your clinician" framing.
- **Vitals history**: blood pressure and resting pulse get their own trend views with date-stamped entries (not just weekly snapshots).
- **Cycle history**: a calendar view of logged cycle/body context over time — purely descriptive, useful for clinician conversations and for the user's own pattern recognition.
- **Medication & supplement list**: a simple user-maintained list (name, started date, notes). The existing medication-aware checks read from this. No dosing guidance, no recommendations, ever — it is a record the user owns.
- **App lock**: optional PIN with WebAuthn biometric unlock where available. Health data on a phone deserves a lock screen. Lock state persists; lock engages after configurable idle time.
- **Privacy dashboard**: one screen that states, plainly: what is stored (locally), what leaves the device (nothing, unless you export), and buttons for export-everything and delete-everything (with typed confirmation). This page is a feature, not legalese.
- **Scheduled backup reminder**: a gentle monthly prompt to export a backup, with "last backup" date shown.

## 6. Learn — a real library, not a pamphlet

Purpose: women's health education and better clinician conversations.

Current topics (keep all):

- Cycle-aware training
- Protein + body recomposition
- Low appetite support
- Perimenopause signals
- Bloodwork basics
- Clinician conversation prompts

Premium expansion:

- **Topic hierarchy**: organize into four collections — *Train*, *Fuel*, *Cycle & Hormones*, *Labs & Clinic Visits*. Each collection page shows reading progress.
- **Article format**: every topic becomes a structured article: 2-minute read target, "The short version" box at top, sectioned body, "Talk to your clinician about…" footer where relevant, related-topics links.
- **Reading progress**: articles mark as read; collections show n/m completed. No badges, no gamification beyond quiet progress.
- **Visit Prep builder**: an interactive checklist that assembles a clinician-visit one-pager from the user's own data — symptoms they've tagged most, questions they select from the prompt library, current medication list, recent vitals. Output: copyable text / printable page. This is the Learn tab's killer feature and a natural companion to the Health tab's coach share.
- **Glossary**: tap-able definitions for terms used across the app (luteal, recomposition, RPE, fasting glucose…), rendered as a bottom sheet wherever the term appears.
- **Content quality bar**: every article gets an editorial pass — plain language, no fear-framing, no diagnosis, no protocols, no dosing, no product mentions. Cite the *type* of source ("large 2023 review") without turning the app into a references site.

---

# New Cross-Cutting Capabilities

## Onboarding (first-run experience)

A 5-screen, skippable flow that makes the first session feel personal:

1. Welcome + privacy promise (one screen, three sentences: local, private, yours)
2. Life stage selection (cycling / perimenopause / postmenopause / prefer not to say) — sets defaults for cycle context UI
3. Targets (protein auto-suggested from body weight with an adjustable slider; steps, sleep, water defaults)
4. Training context (ramp-in vs. straight to 4-day; equipment available)
5. Plan variant pick → lands on Today with rings ready and the first Next Best Action card

All answers editable later in Settings. Onboarding writes to the existing `settings` store.

## Insights Engine (local, rule-based — explicitly not AI)

A small pure-TypeScript module (`src/insights/`) that evaluates rules over local data and emits at most **one** insight per day, surfaced as a card on Today or Week:

- Protein hit rate vs. weight trend correlations stated descriptively ("In weeks you hit protein 6+ days, your waist trend was down")
- Symptom-cycle patterns ("Headaches have clustered in your late luteal logs 3 cycles running — could be worth noting for your clinician")
- Training consistency reflections
- Guardrail alerts (rapid weight loss, rising resting pulse trend) phrased calmly with a "discuss with a professional" framing

Rules are unit-tested, deterministic, and explainable — every insight card has a "How was this calculated?" expander. No black boxes, no cloud, no LLM calls.

## Reminders & Notifications

- PWA local notifications (where the platform allows) for: chosen check-in day, training days (opt-in, per-day time), and backup reminders
- All off by default. A single Notifications settings page controls everything. Never more than one notification per day.

## Settings (consolidate)

A proper Settings surface (gear icon from Today) gathering: targets, life stage, plan variant, equipment, units (kg/lb, cm/in), theme, app lock, notifications, data (export/import/delete), and About.

## Accessibility & Quality Bar

- WCAG AA contrast in both themes; all interactive elements labeled; sliders have keyboard/screen-reader equivalents
- Lighthouse PWA + accessibility ≥ 95 before any release
- Bundle budget: < 250 KB gzipped JS for the main route; sparklines and PDF generation lazy-loaded
- Every utility and the entire insights engine unit-tested; target ≥ 40 tests by end of Phase 2

---

# Build Phases

Work in this order. Each phase ships a coherent, validated app (`lint`, `test`, `build`, browser check).

**Phase 1 — Foundation (design system + queued fixes)**
Design tokens, dark mode, typography, anchor rings, bottom-sheet logging pattern, coach summary preview, rename `ResearchScreen.tsx` → `LearnScreen.tsx`, Settings surface, onboarding.

**Phase 2 — Daily excellence**
Next Best Action card, Quick Log sheet, cycle-aware guidance, streaks, active session mode, rest timer, plate calculator, progression engine, empty/skeleton/celebration states.

**Phase 3 — Trends & records**
Sparklines, Weekly Report Card, check-in mode, symptom heatmap, photo vault, labs timeline, vitals history, cycle history, medication list, app lock, privacy dashboard.

**Phase 4 — Sharing & library**
PDF coach packet, Visit Prep builder, Learn collections + article format + glossary, insights engine, notifications, grocery list + prep mode + plan variants.

**Phase 5 — Production**
Supabase auth + optional encrypted cloud backup (review schema first), Vercel deploy, real-user testing with 5–10 users/coaches, secure coach-invite sharing only after the local flow is polished and privacy/permissions are deliberately designed.

---

# Important Product Rules

Do:

- Keep the app women-focused.
- Keep it mobile-first.
- Keep logging fast.
- Keep privacy obvious.
- Let the user control exports and sharing.
- Support coach/trainer/dietitian/clinician conversations.
- Use clear health disclaimers without making the app feel scary.

Do not:

- Recommend peptides.
- Recommend products from user health data.
- Add dosing, protocol, injection, or treatment language.
- Turn the app into a funnel.
- Re-add Studio/AI/content-generation as a main tab.
- Send health data anywhere automatically.
- Make user notes or symptoms share by default without user choice.
- Add gamification that shames (broken streaks, red warnings for missed days).
- Add an LLM/chatbot to the user-facing app.

---

# Current Stack

- React 19
- TypeScript
- Vite
- Vite PWA
- Dexie / IndexedDB local-first storage
- PapaParse for Cronometer CSV import
- Zod for backup validation
- Lucide icons
- Supabase client is installed, but cloud sync should remain optional until the product UX is stronger

Additions allowed (lazy-loaded, audited for size): a client-side PDF lib for the coach packet, nothing else without strong justification. Sparklines and rings are hand-rolled SVG.

# Key Files

Main app:

```text
src/App.tsx
```

Types:

```text
src/types.ts
```

Local database:

```text
src/db.ts
```

Data/content:

```text
src/data.ts
```

Screens:

```text
src/screens/TodayScreen.tsx
src/screens/WeekScreen.tsx
src/screens/PlanScreen.tsx
src/screens/TrainingScreen.tsx
src/screens/HealthScreen.tsx
src/screens/ResearchScreen.tsx   ← currently the Learn tab; rename to LearnScreen.tsx in Phase 1
```

Utilities:

```text
src/utils/coachShare.ts
src/utils/backup.ts
src/utils/date.ts
```

Supabase bridge:

```text
src/lib/supabase.ts
src/lib/cloudSync.ts
src/lib/supabase.types.ts
supabase/migrations/001_forged-form_core.sql
```

Important:

The Supabase schema has been simplified back to the corrected product direction: women's health + coach sharing. Review it before production, but do not re-add non-core funnel or AI job tables unless the product direction changes deliberately.

# Data Model

Current local IndexedDB stores (keep, extend additively with versioned Dexie migrations):

- `dailyLogs` — date, protein, calories, habits, appetite, energy, nausea, cycle/body context, symptoms, notes, imported flag
- `weeklyMetrics` — week start, weight, waist, blood pressure, resting pulse, progress photo flag, best lift, training sessions
- `exerciseEntries` — date, session id, exercise id, weight, reps
- `labResults` (Dexie v3) — id, date, marker, value, unit, note. User-logged lab values trended over time in the Health tab; ferritin gets evidence-based status (see `utils/health.ts` `classifyFerritin`), other markers trend as plain values. Local-only, NOT in the coach packet (too sensitive); included in backups (schema v2).
- `settings` — protein/calorie/water/step/sleep targets, life stage, metabolic/hormone flags, theme, onboarding flag, bodyWeightLb, proteinPerKg

Planned new stores (add only in the phase that needs them):

- `photos` — id, date, blob, tag (front/side/back), never exported by default
- `labResults` — id, date, marker id, value, unit, user-entered reference range
- `vitalsEntries` — id, date, type (bp/pulse), values
- `medications` — id, name, startedDate, notes (no dose-advice fields)
- `prRecords` — exercise id, date, weight, reps
- `articleProgress` — topic id, readAt
- `insightsShown` — rule id, date (prevents repeats)
- `settings` extensions — theme, units, plan variant, equipment, lock config, notification prefs, onboarding-complete flag

# Coach Share Feature

The user request was:

> They should have a way to relay this data to coaches.

Current implementation: `src/utils/coachShare.ts` + the Coach Share panel in `src/screens/HealthScreen.tsx`. Outputs a copyable plain-text summary and a downloadable JSON packet covering date range, logged days, protein/calorie averages, target hit rate, habit completion, appetite/energy/nausea averages, optional symptom counts and notes, latest weekly metric, and workout counts.

Privacy behavior (unchanged, non-negotiable): local generation only, no automatic upload, notes/symptoms opt-in per share, user chooses to copy or download.

Premium upgrades, in order: on-screen formatted preview → one-page PDF packet → (Phase 5 only) account-based read-only coach invites with revocation and RLS.

# Tone / UX Guidance

The app should feel:

- Calm
- Capable
- Private
- Practical
- Health-aware
- Strong, not pink-wellness gimmicky

Design should prioritize:

- Mobile ergonomics
- Fast tap targets
- Clear data summaries
- Minimal cognitive load
- No landing-page feel
- No marketing copy inside core workflows

Copy voice: a knowledgeable friend, not a brand. Second person, short sentences, zero exclamation marks in core flows, no medical claims, no fear. Celebrate consistency, never perfection.

# Final Warning For Next Builder

Do not resurrect the previous AI/Studio/OPP direction.

That was the wrong product path.

Forged-Form is a women's health/body recomposition tracker with optional coach-friendly sharing — now being built to a premium standard. The premium bar is earned through design coherence, speed, privacy, and genuinely useful local intelligence — never through cloud features, AI branding, or anything that compromises the product rules above.
