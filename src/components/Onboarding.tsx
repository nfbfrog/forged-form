import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Lock, Moon, MonitorSmartphone, Sun } from 'lucide-react'
import { db } from '../db'
import type { Settings, ThemePreference } from '../types'

const lifeStageOptions: Array<{ id: Settings['lifeStage']; label: string; detail: string }> = [
  { id: 'cycling', label: 'Cycling', detail: 'Track cycle phases alongside training and appetite.' },
  { id: 'perimenopause', label: 'Perimenopause', detail: 'Keep heat, sleep, mood, and recovery signals visible.' },
  { id: 'postmenopause', label: 'Postmenopause', detail: 'Focus on strength, protein, and steady vitals.' },
  { id: 'other', label: 'Prefer not to say', detail: 'Everything works without cycle tracking.' },
]

const themeOptions: Array<{ id: ThemePreference; label: string; icon: typeof Sun }> = [
  { id: 'system', label: 'Match device', icon: MonitorSmartphone },
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
]

const TOTAL_STEPS = 5

export function Onboarding({ settings }: { settings: Settings }) {
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<Settings>({ ...settings })

  async function finish(finalDraft: Settings) {
    await db.settings.put({ ...finalDraft, onboardingComplete: true })
  }

  async function skip() {
    await finish(settings)
  }

  return (
    <div className="onboarding" role="dialog" aria-modal="true" aria-label="Welcome to Forged-Form">
      <div className="onboarding-card">
        {step === 0 ? (
          <div className="onboarding-step">
            <span className="eyebrow">Welcome</span>
            <h2>Forged-Form</h2>
            <p>
              A calm place to track protein, training, and the body signals that matter —
              built around women's health.
            </p>
            <p className="onboarding-privacy">
              <Lock size={15} /> Everything you log stays on this device. Nothing is uploaded.
              You decide what to export or share.
            </p>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="onboarding-step">
            <span className="eyebrow">Step 1 of 4</span>
            <h2>Where are you right now?</h2>
            <p>This only tunes the daily context options. You can change it any time.</p>
            <div className="option-cards">
              {lifeStageOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`option-card ${draft.lifeStage === option.id ? 'selected' : ''}`}
                  onClick={() => setDraft({ ...draft, lifeStage: option.id })}
                  aria-pressed={draft.lifeStage === option.id}
                >
                  <strong>{option.label}</strong>
                  <small>{option.detail}</small>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="onboarding-step">
            <span className="eyebrow">Step 2 of 4</span>
            <h2>Set your protein floor</h2>
            <p>
              A common starting point is 0.7–1g per pound of goal body weight.
              Adjust it with a coach or dietitian as you go.
            </p>
            <div className="onboarding-slider">
              <div className="slider-readout">
                <strong>{draft.proteinTarget}</strong>
                <span>g / day</span>
              </div>
              <input
                type="range"
                min={80}
                max={200}
                step={5}
                value={draft.proteinTarget}
                aria-label="Daily protein target in grams"
                onChange={(event) => setDraft({ ...draft, proteinTarget: Number(event.target.value) })}
              />
            </div>
            <div className="onboarding-slider">
              <div className="slider-readout">
                <strong>{draft.stepTarget.toLocaleString()}</strong>
                <span>steps / day</span>
              </div>
              <input
                type="range"
                min={4000}
                max={14000}
                step={500}
                value={draft.stepTarget}
                aria-label="Daily step target"
                onChange={(event) => setDraft({ ...draft, stepTarget: Number(event.target.value) })}
              />
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="onboarding-step">
            <span className="eyebrow">Step 3 of 4</span>
            <h2>Anything the app should be aware of?</h2>
            <p>These keep the daily guidance honest. They never leave this device.</p>
            <div className="toggle-list">
              <label>
                <span>
                  <strong>Metabolic medication support</strong>
                  <small>Adds appetite and tolerance-aware prompts on low days.</small>
                </span>
                <input
                  type="checkbox"
                  checked={draft.metabolicSupport}
                  onChange={(event) => setDraft({ ...draft, metabolicSupport: event.target.checked })}
                />
              </label>
              <label>
                <span>
                  <strong>Prescribed hormone support</strong>
                  <small>Keeps hormone-aware monitoring context visible.</small>
                </span>
                <input
                  type="checkbox"
                  checked={draft.hormoneSupport}
                  onChange={(event) => setDraft({ ...draft, hormoneSupport: event.target.checked })}
                />
              </label>
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="onboarding-step">
            <span className="eyebrow">Step 4 of 4</span>
            <h2>Pick your look</h2>
            <p>You're set. Log your first protein on the Today screen whenever you're ready.</p>
            <div className="theme-options">
              {themeOptions.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`option-card ${(draft.theme ?? 'system') === option.id ? 'selected' : ''}`}
                    onClick={() => setDraft({ ...draft, theme: option.id })}
                    aria-pressed={(draft.theme ?? 'system') === option.id}
                  >
                    <Icon size={18} />
                    <strong>{option.label}</strong>
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}

        <div className="onboarding-dots" aria-hidden="true">
          {Array.from({ length: TOTAL_STEPS }, (_, index) => (
            <span key={index} className={index === step ? 'active' : ''} />
          ))}
        </div>

        <footer className="onboarding-actions">
          {step > 0 ? (
            <button type="button" className="secondary-button" onClick={() => setStep(step - 1)}>
              <ArrowLeft size={15} /> Back
            </button>
          ) : (
            <button type="button" className="secondary-button" onClick={() => void skip()}>
              Skip for now
            </button>
          )}
          {step < TOTAL_STEPS - 1 ? (
            <button type="button" className="primary-button" onClick={() => setStep(step + 1)}>
              {step === 0 ? 'Get started' : 'Next'} <ArrowRight size={15} />
            </button>
          ) : (
            <button type="button" className="primary-button" onClick={() => void finish(draft)}>
              <Check size={15} /> Start tracking
            </button>
          )}
        </footer>
      </div>
    </div>
  )
}
