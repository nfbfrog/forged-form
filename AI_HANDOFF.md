# Forged-Form — Full Context Handoff

You are taking over **Forged-Form**, a women's health & body-recomposition app. This document is the single source of truth for picking it up cold. Read it fully before changing anything. Deeper roadmap detail lives in `CLAUDE_BUILD_PROMPT.md`; product background in `PARTNER_HANDOFF.md`. Where they disagree with this file, this file wins.

---

## 1. What it is

A private, **local-first PWA** that helps women track protein, strength training, daily habits, cycle/perimenopause context, symptoms, vitals, labs, and produce coach/clinician-ready summaries. It feels like a calm daily health instrument — not a calorie tracker, not a funnel, not an AI tool.

**One-line:** mobile-first women's recomposition + health tracker, evidence-grounded, private by design.

### Non-negotiable product rules (do NOT violate)
- Women-focused, mobile-first, fast logging, privacy obvious.
- **No** peptide/dosing/protocol/treatment language. **No** product recommendations from health data. **No** funnel/marketing copy inside core flows. **No** AI/chatbot/"Studio" surface in the user-facing app.
- Nothing leaves the device automatically. Exports/sharing are user-initiated. Notes & symptoms are opt-in to share.
- No diagnosis. Health context is always framed "discuss with your clinician."
- No gamification that shames (no broken-streak graphics, no red walls for missed days).
- **Despite the "Forged" brand name** (shared with the owner's other commercial tools), this app stays separable: health data never feeds commerce. If asked to wire it into a shop/funnel, stop and flag it.

---

## 2. Repo, hosting, ship process

- **Repo:** https://github.com/nfbfrog/forged-form  (branch `main`)
- **Live:** https://nfbfrog.github.io/forged-form/
- **Style guide (live):** https://nfbfrog.github.io/forged-form/design-system/
- **Local path:** `C:\Users\nfbfr\.claude\women-recomp-os`
- **Ship loop:** push to `main` → GitHub Actions (`.github/workflows/deploy.yml`) runs lint + tests + build → deploys to GitHub Pages on green. ~45–60s. A failed check blocks deploy.
- `gh` CLI is authenticated as `nfbfrog`.
- **Pages base path:** the Pages build sets `VITE_BASE=/forged-form/`; local dev stays at `/`. Wired through `vite.config.ts` (incl. PWA `start_url`/`scope`). Don't hardcode absolute asset paths.

---

## 3. Stack & commands

React 19 · TypeScript · Vite 8 · vite-plugin-pwa · Dexie/IndexedDB (local-first) · PapaParse (Cronometer CSV) · Zod (backup validation) · lucide-react icons. Supabase client is installed but cloud sync is optional/dormant.

```bash
npm install
npm run dev      # http://localhost:4175/  (strictPort — see gotchas)
npm run lint     # eslint
npm test         # vitest — 22 tests currently pass
npm run build    # tsc -b && vite build
```

Charts (sparklines) and rings are **hand-rolled SVG** — do not add a chart library. Only added dep beyond the above should be a client-side PDF lib *if/when* a richer coach packet is built; otherwise keep the bundle lean.

---

## 4. Environment gotchas (Windows / this setup)

- **Dev server is port 4175, `strictPort: true`.** A stale Vite process sometimes holds it; kill it before `preview_start`. The launch config name in `.claude/launch.json` is **`formforge-dev`** (pre-rename; still works — don't be confused by the old name).
- `npm test` / `npm run build` can fail with Rolldown `spawn EPERM` inside a restricted sandbox; they pass when run normally.
- **Commit messages:** author with a single-quoted PowerShell here-string. Avoid `~`, smart quotes, and stray punctuation in the message body — they have silently fragmented the here-string and caused a no-op "commit" (files left staged, nothing committed). Keep messages plain ASCII; verify with `git log --oneline -1` after committing.
- Line-ending warnings (LF→CRLF) on commit are normal noise.
- **Pages URLs do not redirect** after a repo rename — the old `/formforge/` URL is dead. Only the GitHub repo page redirects.

---

## 5. Verifying changes (preview tooling)

Use the `preview_*` MCP tools, not Bash, for browser verification:
- `preview_start` with name `formforge-dev`.
- `preview_eval` to drive/seed IndexedDB and read DOM state, `preview_snapshot` for structure, `preview_screenshot` for visuals, `preview_resize` for mobile/dark.
- The preview browser **cannot reach external origins** (only localhost) — verify the live site with HTTP requests (`Invoke-WebRequest`), not the preview browser.
- To test onboarding/fresh state: `indexedDB.deleteDatabase('recomp-rhythm')` then reload (do the delete and the reload in **separate** eval calls — a reload mid-eval kills the context).

---

## 6. File map (`src/`)

```
App.tsx                    Shell: 6-tab nav, topbar, theme application, onboarding gate
main.tsx                   Entry + PWA register
index.css                  ALL styles. Design tokens at top (:root + [data-theme=dark]).
types.ts                   All types + defaults (DailyLog, WeeklyMetric, ExerciseEntry, LabResult, Settings)
db.ts                      Dexie schema (v3) + ensureSettings + getOrCreateDailyLog
data.ts                    Static content: menus, sessions, researchItems, clinicianQuestions, labMarkers, labReferences

screens/
  TodayScreen.tsx          Daily logging instrument (the home screen)
  WeekScreen.tsx           Scoreboard: insights, habit grid, patterns, sparkline trends, markers
  PlanScreen.tsx           Two-menu rotation w/ per-meal Log buttons; house rules
  TrainingScreen.tsx       Ramp-in, 4-day split tabs, hosts SessionLogger
  HealthScreen.tsx         CSV import, backup, coach share, Lab log, medication checks, references
  LearnScreen.tsx          Education topics + Visit Prep builder
  SettingsPanel.tsx        Modal: protein calculator, targets, life stage, theme, cloud panel

components/
  AnchorRings.tsx          5 activity-style SVG rings (Today)
  BottomSheet.tsx          Reusable bottom-sheet (protein add, anchor logging)
  Onboarding.tsx           5-step first-run flow
  SessionLogger.tsx        Shared set-logger (Today's lift fold + Training tab)
  Sparkline.tsx            Hand-rolled SVG sparkline (Week trends, Lab log)
  VisitPrep.tsx            Clinician one-pager builder (Learn)

utils/
  date.ts(+test)           localDateKey, startOfWeek, weekKeys, friendlyDate, parseLocalDate
  useToday.ts              Hook: re-renders Today/Week when the day rolls over
  protein.ts(+test)        g/kg math, per-meal floor, life-stage nudge
  trends.ts(+test)         weeklyRate, formatRate (sparkline annotations)
  patterns.ts(+test)       topSymptomPattern (descriptive cycle/symptom surfacing)
  health.ts                classifyBloodPressure, classifyFerritin, weightLossStatus
  visitPrep.ts             buildVisitPrep + formatVisitPrepText
  coachShare.ts            buildCoachSharePayload, format/copy/download
  backup.ts                Zod-validated JSON export/import (schema v2)
  haptics.ts               navigator.vibrate tick/success
  theme.ts(+test)          resolveTheme, applyTheme

lib/                       supabase.ts, cloudSync.ts, supabase.types.ts (dormant, optional)
design-system/  →  public/design-system/   Live style-guide spec cards (6, both themes)
```

---

## 7. Data model (Dexie DB `recomp-rhythm`, version 3)

Extend **additively** with versioned migrations. Never rename the DB (would orphan users' data).

- **dailyLogs** (key `date`): `protein`, `calories`, `proteinEntries[]` (per-add amounts → meal-dose count), `water`, `steps`, `sleepHours`, `habits{protein,movement,steps,water,sleep:boolean}`, `appetite`(1-5), `energy`(1-5), `nausea`(0-3), `cycleContext`, `symptoms[]`, `note`, `imported?`.
- **weeklyMetrics** (key `weekStart`): `weight`, `waist`, `systolic`, `diastolic`, `restingPulse`, `photo`, `bestLift`, `sessions{}`.
- **exerciseEntries** (`++id`, indexes `date,sessionId,exerciseId,[date+sessionId]`): one logged set.
- **labResults** (`++id`, indexes `marker,date,[marker+date]`): `date`, `marker`, `value`, `unit`, `note?`. Local-only; **excluded from the coach packet** (too sensitive); included in backups.
- **settings** (key `id:'primary'`): protein/calorie/water/step/sleep targets, `lifeStage`, `metabolicSupport`, `hormoneSupport`, `theme`, `onboardingComplete`, `bodyWeightLb`, `proteinPerKg`.

`habits[key]` for numeric anchors (steps/water/sleep) is **derived** = "target met"; keep it in sync whenever the numeric value changes so the Week grid and coach summary stay correct.

Backup schema (`utils/backup.ts`) accepts version 1 **and** 2, writes 2, defaults `labResults` to `[]`, and preserves the optional `settings` fields (a prior bug stripped `theme`/`bodyWeightLb` — don't regress it).

---

## 8. Current functionality by tab (accurate as of HEAD `d58b40d`)

**Today** — the home logging instrument:
- 5 anchor rings. Protein = proportional readout. Movement = toggle (also auto-completed by logging a training set). **Steps / Hydration / Sleep = real numeric trackers**: tapping opens a bottom sheet (set steps/sleep, add water by the cup); rings fill `value/target`.
- Protein floor panel: big readout, progress bar, **named** quick-adds (e.g. "Yogurt bowl · 38g"), custom-amount sheet, **two-step** reset, and (when bodyweight is set) a per-meal floor + count of meals that cleared it.
- "Today's lift" fold-card: shows the next un-done session, expands to the inline `SessionLogger`.
- "Body signals" fold-card: collapsed one-line summary; expands to cycle-context chips, **one-tap segmented** appetite/energy/nausea scales (NOT sliders), symptom chips, notes.
- Conditional safety strip only when logged signals warrant it.

**Week** — scoreboard: "This week" summary line; insight cards (consistency, blood pressure via `classifyBloodPressure`, weight trend); 7-day habit grid; **Patterns** card (descriptive top symptom over 6 weeks, flags a cycle cluster only when the majority share one phase); **Trends** (hand-rolled sparklines for weight/waist/resting pulse with per-week rate + check-in count + designed empty states); training session checklist; weekly markers (debounced number inputs); progress-photo toggle.

**Plan** — two high-protein menu rotations; each meal has a **Log** button that adds its protein to today (counts as a meal dose); house rules.

**Training** — collapsible ramp-in; 4-day upper/lower split tabs; `SessionLogger` with last-session memory + placeholder prefill; logging a set auto-marks the Week session and Today's movement anchor; progressive-overload note.

**Health** — Cronometer CSV import; JSON backup export/restore; **Coach share** (range, include-notes [default OFF], include-symptoms toggle, on-screen preview, copy, JSON packet); **Lab log** (log markers over time → sparkline trend; ferritin gets evidence-based status badge; delete entries); medication-aware checks; static lab reference (ferritin-first); hard-line safety guidance.

**Learn** — "education not diagnosis" boundary; browse-by-topic filter chips + cards (includes an honest "cycle syncing isn't evidence-based" card and protein-as-muscle-lever framing); **Visit Prep builder** (select clinician questions → build a one-pager from vitals + lab trends + symptom pattern → Print/Save-PDF via print stylesheet, or Copy).

**Settings** (gear icon) — **Protein basis calculator** (bodyweight + goal → g/kg target + per-meal floor, life-stage nudge); targets; life stage; appearance/theme; metabolic/hormone flags; optional Supabase cloud panel.

**Onboarding** — 5 steps: welcome/privacy, life stage, protein floor (bodyweight-anchored), awareness flags, theme. Writes `onboardingComplete`; never replays for established devices.

---

## 9. Evidence-locked decisions (from a verified deep-research pass — do not undo or build the debunked features)

- **Protein is bodyweight-anchored**, not flat: ~1.2 g/kg maintain, ~1.6 recomp, ~2.0 hard-training; **per-meal floor ~25–37g**; peri/postmenopause +0.2 g/kg (anabolic resistance). Logic in `utils/protein.ts`.
- **Protein is a muscle-building lever, not a fat-loss lever** — never imply more protein = more fat loss.
- **Resistance training is the spine**; cardio is adjunct.
- **Progress is framed vs the user's own baseline**, never male-normed strength standards.
- **DO NOT build cycle-phase training periodization** — high-quality evidence shows no benefit. Cycle/symptom data is **descriptive** personal context only, surfaced for clinician conversations. The Learn tab states this honestly (a trust differentiator).
- **DO NOT predict ovulation/fertile windows** from dates (inaccurate). Cycle context is manual self-report; if a phase is ever shown, label it "estimated."
- **Ferritin uses physiologic thresholds** (~30 ng/mL concern, ~50 repletion), not the lab's printed floor; framed "discuss with clinician." `classifyFerritin` in `utils/health.ts`.
- **Local-first/no-upload is a genuine differentiator** (female-health apps are known to mishandle sensitive data) — keep privacy obvious.
- **No verified evidence** was found for bone-density / thyroid / women's-BP-norm / GLP-1-women-specific / contraception features — do **not** invent them. They need their own research round first.

---

## 10. Locked UX decisions (user-directed this session)

- **Today is a pure logging instrument** — the user explicitly rejected narrative/guidance cards. Do not re-add them.
- **One-tap segmented scales** for body signals, never drag sliders.
- **Two-step confirm** for destructive actions (arm → confirm), never one-tap.
- **Anchors are real numeric trackers** tied to the targets the user set — not toggles.
- **Calories are deliberately NOT in daily logging** (this is "not a generic calorie tracker"). Target + CSV import only. Changing this is a product-direction decision for the owner.
- Coach-share notes default OFF; labs never auto-shared.

---

## 11. Design system

- All styling is CSS custom properties in `index.css` `:root`, with a full `[data-theme='dark']` override (designed dark mode, not inverted). No hardcoded colors/radii — use tokens (`--radius-card`, `--radius-control`, surface/ink/accent/tone tokens).
- One warm-neutral palette + a confident accent (deep teal/forest), explicitly **not pink-coded**. Numbers that matter use tabular-nums + serif display.
- Motion respects `prefers-reduced-motion`. Tap targets ≥ 44px. Haptics on log actions.
- Live spec cards in `public/design-system/` (6 cards, both themes) with `@dsCard` markers, deployed with the app.
- To mirror the design system into a **claude.ai/design** project: use the `DesignSync` tool, but it requires an **interactive `claude` session with `/login`** (headless tokens can't get design scopes). Not doable in an automated/headless run.

---

## 12. Known issues, gaps, and next opportunities

**Not yet done (deferred), roughly in value order:**
1. **2nd research round** then build: GLP-1 considerations for women, bone density, thyroid, women's BP norms, perimenopause-specific protein, and whether the (older-women-derived) protein findings generalize to younger users. Do the research before building — see open questions in `CLAUDE_BUILD_PROMPT.md`.
2. **Real-user testing** (5–10 women/coaches) — never done; the "what women want/trust in apps" research returned no verified claims, so retention/trust assumptions are unvalidated.
3. Roadmap features in `CLAUDE_BUILD_PROMPT.md` not built: progress-photo vault, app lock/PIN (WebAuthn), privacy dashboard, opt-in notifications, deeper local insights engine, Learn collections/article format/glossary, grocery-list/prep-mode/plan-variants, rest timer/plate calculator/PR log, symptom heatmap, cycle-history calendar.

**Watch-outs:**
- `lib/` Supabase code is dormant; review the schema + RLS before any cloud feature. Don't expose service-role keys.
- The ESLint config forbids `setState` synchronously inside a `useEffect` — use render-phase adjustment (see `NumberField` in `WeekScreen.tsx`) for prop→local-state sync.
- Keep all four util test files green; add tests for any new pure logic (the project's bar is ~all utils tested).

**Quality bar before calling anything "done":** `npm run lint && npm test && npm run build` all green, plus a browser verification pass (rings/sheets/flows) in both light and dark.

---

## 13. How to work here (style)

Small, additive changes. Verify in the real running app, not just tests. Ship coherent chunks with a clear commit message and let CI deploy. When something feels "half-built," drive the actual app and fix the real mechanic rather than adding new surface area. When research is needed to expand health scope, run it and grade the evidence before building — this app's credibility is its honesty about what's proven.
