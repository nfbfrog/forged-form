import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  AlertTriangle,
  BedDouble,
  Check,
  Droplets,
  Footprints,
  HeartPulse,
  Moon,
  Plus,
  RotateCcw,
  Salad,
  Sparkles,
  SunMedium,
  Target,
  ThermometerSun,
  TimerReset,
  Waves,
  Zap,
} from 'lucide-react'
import { db, getOrCreateDailyLog } from '../db'
import { menus } from '../data'
import { SectionHeading } from '../App'
import { AnchorRings, type AnchorRingItem } from '../components/AnchorRings'
import { BottomSheet } from '../components/BottomSheet'
import { createDailyLog, habitKeys, type DailyLog, type HabitKey } from '../types'
import { friendlyDate, localDateKey } from '../utils/date'
import { haptics } from '../utils/haptics'

type CycleContext = DailyLog['cycleContext']

const habitMeta: Record<HabitKey, { label: string; icon: typeof Salad }> = {
  protein: { label: 'Protein', icon: Salad },
  movement: { label: 'Lift / walk', icon: Footprints },
  steps: { label: 'Steps', icon: TimerReset },
  water: { label: 'Hydration', icon: Droplets },
  sleep: { label: 'Sleep', icon: BedDouble },
}

const contextOptions: Array<{ id: CycleContext; label: string; icon: typeof Waves }> = [
  { id: 'period', label: 'Period', icon: Waves },
  { id: 'follicular', label: 'Follicular', icon: Sparkles },
  { id: 'ovulation', label: 'Ovulation', icon: SunMedium },
  { id: 'luteal', label: 'Luteal', icon: Moon },
  { id: 'peri-meno', label: 'Peri / meno', icon: ThermometerSun },
  { id: 'none', label: 'Not tracking', icon: HeartPulse },
]

const symptomOptions = ['Cramps', 'Bloat', 'Cravings', 'Headache', 'Hot flashes', 'Low mood']

const contextGuidance: Record<CycleContext, string> = {
  period: 'Recovery bias: keep protein steady, train lighter if cramps or fatigue are up.',
  follicular: 'Good window to build momentum if sleep and joints feel solid.',
  ovulation: 'Use good warmups and clean reps; some women feel powerful, some feel looser.',
  luteal: 'Protect consistency. Hunger, scale noise, and temperature shifts can be louder here.',
  'peri-meno': 'Watch heat, sleep, mood, and recovery. Trends matter more than one rough day.',
  none: 'Use energy, appetite, sleep, and symptoms as the daily read.',
}

export function TodayScreen() {
  const date = localDateKey()
  const [proteinSheetOpen, setProteinSheetOpen] = useState(false)
  const [customAmount, setCustomAmount] = useState('')
  const storedLog = useLiveQuery(() => db.dailyLogs.get(date), [date])
  const settings = useLiveQuery(() => db.settings.get('primary'), [])
  const log = normalizeDailyLog(storedLog ?? createDailyLog(date), settings?.lifeStage)
  const target = settings?.proteinTarget ?? 140
  const percent = Math.min(100, Math.round((log.protein / target) * 100))
  const completeCount = habitKeys.filter((key) => log.habits[key]).length
  const remainingProtein = Math.max(0, target - log.protein)
  const allMeals = menus.flatMap((menu) => menu.meals)
  const nextMeal = allMeals.find((meal) => meal.protein >= Math.min(remainingProtein, 30)) ?? allMeals[0]
  const nextHabit = habitKeys.find((key) => !log.habits[key])
  const nextAction = buildNextAction({
    completeCount,
    remainingProtein,
    nextHabit: nextHabit ? habitMeta[nextHabit].label.toLowerCase() : '',
    nextMeal: nextMeal.name,
    metabolicSupport: settings?.metabolicSupport ?? false,
    appetite: log.appetite,
    energy: log.energy,
    nausea: log.nausea,
    cycleContext: log.cycleContext,
    symptoms: log.symptoms,
  })

  async function save(update: (current: DailyLog) => DailyLog) {
    const current = normalizeDailyLog(await getOrCreateDailyLog(date), settings?.lifeStage)
    await db.dailyLogs.put(update(current))
  }

  async function addProtein(amount: number) {
    const crossedTarget = log.protein < target && log.protein + amount >= target
    await save((current) => {
      const protein = current.protein + amount
      return {
        ...current,
        protein,
        habits: { ...current.habits, protein: protein >= target },
      }
    })
    if (crossedTarget) haptics.success()
    else haptics.tick()
  }

  async function submitCustomProtein() {
    const amount = Number(customAmount)
    if (Number.isFinite(amount) && amount > 0) {
      await addProtein(Math.round(amount))
      setProteinSheetOpen(false)
    }
  }

  async function toggleHabit(key: HabitKey) {
    const completing = !log.habits[key]
    await save((current) => ({
      ...current,
      habits: { ...current.habits, [key]: !current.habits[key] },
    }))
    if (completing && completeCount === 4) haptics.success()
    else haptics.tick()
  }

  const ringItems: AnchorRingItem[] = [
    {
      key: 'protein',
      label: habitMeta.protein.label,
      icon: habitMeta.protein.icon,
      progress: target > 0 ? log.protein / target : 0,
      complete: log.habits.protein || log.protein >= target,
      detail: `${log.protein}g`,
    },
    ...(['movement', 'steps', 'water', 'sleep'] as HabitKey[]).map((key) => ({
      key,
      label: habitMeta[key].label,
      icon: habitMeta[key].icon,
      progress: log.habits[key] ? 1 : 0,
      complete: log.habits[key],
      onToggle: () => void toggleHabit(key),
    })),
  ]

  async function toggleSymptom(symptom: string) {
    await save((current) => ({
      ...current,
      symptoms: current.symptoms.includes(symptom)
        ? current.symptoms.filter((item) => item !== symptom)
        : [...current.symptoms, symptom],
    }))
  }

  return (
    <div className="content-stack today-stack">
      <section className={`today-read ${nextAction.tone}`}>
        <div className="read-copy">
          <span className="eyebrow">FormForge daily</span>
          <h2>{nextAction.title}</h2>
          <p>{nextAction.detail}</p>
        </div>
        <div className="read-summary" aria-label="Today summary">
          <SummaryTile icon={Target} label="Protein left" value={`${remainingProtein}g`} tone={remainingProtein === 0 ? 'good' : 'base'} />
          <SummaryTile icon={Check} label="Anchors" value={`${completeCount}/5`} tone={completeCount >= 4 ? 'good' : 'base'} />
          <SummaryTile icon={Zap} label="Energy" value={`${log.energy}/5`} tone={log.energy <= 2 ? 'watch' : 'base'} />
        </div>
        <div className="context-strip" aria-label="Cycle and body context">
          {contextOptions.map((option) => {
            const Icon = option.icon
            const active = log.cycleContext === option.id
            return (
              <button
                key={option.id}
                type="button"
                className={active ? 'active' : ''}
                onClick={() => void save((current) => ({ ...current, cycleContext: option.id }))}
                aria-pressed={active}
              >
                <Icon size={15} />
                {option.label}
              </button>
            )
          })}
        </div>
      </section>

      {nextAction.tone === 'watch' ? (
        <section className="alert-strip">
          <AlertTriangle size={19} />
          <p>{nextAction.warning}</p>
        </section>
      ) : null}

      <section>
        <SectionHeading
          title="Daily anchors"
          detail={completeCount === 5
            ? 'All five closed. Today is handled.'
            : 'Five basics that protect the cut without turning the day into homework.'}
        />
        <AnchorRings items={ringItems} celebrate={completeCount === 5} />
      </section>

      <section className="focus-panel protein-panel compact-action-panel">
        <SectionHeading
          title="Protein floor"
          detail={friendlyDate(date)}
          action={
            <button
              type="button"
              className="icon-button quiet"
              title="Reset today's protein"
              aria-label="Reset today's protein"
              onClick={() => void save((current) => ({
                ...current,
                protein: 0,
                habits: { ...current.habits, protein: false },
              }))}
            >
              <RotateCcw size={17} />
            </button>
          }
        />
        <div className="protein-readout">
          <div><strong>{log.protein}</strong><span> / {target}g</span></div>
          <span>{percent}%</span>
        </div>
        <div className="progress-track" aria-label={`${percent}% of protein target`}>
          <span style={{ width: `${percent}%` }} />
        </div>
        <div className="quick-adds">
          {menus[0].meals.map((meal) => (
            <button key={meal.name} type="button" onClick={() => void addProtein(meal.protein)}>
              <Plus size={16} /> {meal.protein}g
            </button>
          ))}
          <button
            type="button"
            className="secondary"
            onClick={() => {
              setCustomAmount('')
              setProteinSheetOpen(true)
            }}
          >
            Custom
          </button>
        </div>
      </section>

      <section>
        <SectionHeading title="Body signals" detail={contextGuidance[log.cycleContext]} />
        <div className="checkin-grid">
          <ScaleInput
            label="Appetite"
            value={log.appetite}
            low="Low"
            high="High"
            onChange={(value) => void save((current) => ({ ...current, appetite: value }))}
          />
          <ScaleInput
            label="Energy"
            value={log.energy}
            low="Flat"
            high="Strong"
            onChange={(value) => void save((current) => ({ ...current, energy: value }))}
          />
          <ScaleInput
            label="Nausea"
            value={log.nausea}
            low="None"
            high="Strong"
            min={0}
            max={3}
            onChange={(value) => void save((current) => ({ ...current, nausea: value }))}
          />
        </div>

        <div className="symptom-panel">
          <span>Symptoms / friction</span>
          <div className="symptom-chips">
            {symptomOptions.map((symptom) => {
              const active = log.symptoms.includes(symptom)
              return (
                <button
                  key={symptom}
                  type="button"
                  className={active ? 'active' : ''}
                  onClick={() => void toggleSymptom(symptom)}
                  aria-pressed={active}
                >
                  {symptom}
                </button>
              )
            })}
          </div>
        </div>

        <label className="field full-field">
          <span>Notes</span>
          <textarea
            value={log.note}
            placeholder="Cycle, sleep, digestion, cravings, pain, training..."
            onChange={(event) => void save((current) => ({ ...current, note: event.target.value }))}
          />
        </label>
      </section>

      {proteinSheetOpen ? (
        <BottomSheet title="Add protein" onClose={() => setProteinSheetOpen(false)}>
          <div className="sheet-chips">
            {[10, 15, 20, 25, 30, 40].map((grams) => (
              <button
                key={grams}
                type="button"
                onClick={() => {
                  void addProtein(grams)
                  setProteinSheetOpen(false)
                }}
              >
                +{grams}g
              </button>
            ))}
          </div>
          <form
            className="sheet-row"
            onSubmit={(event) => {
              event.preventDefault()
              void submitCustomProtein()
            }}
          >
            <label className="field">
              <span>Custom amount</span>
              <div className="input-suffix">
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  autoFocus
                  value={customAmount}
                  onChange={(event) => setCustomAmount(event.target.value)}
                />
                <small>g</small>
              </div>
            </label>
            <button type="submit" className="primary-button" disabled={!(Number(customAmount) > 0)}>
              Add
            </button>
          </form>
        </BottomSheet>
      ) : null}
    </div>
  )
}

function SummaryTile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Target
  label: string
  value: string
  tone: 'base' | 'good' | 'watch'
}) {
  return (
    <div className={`summary-tile ${tone}`}>
      <Icon size={17} />
      <span><small>{label}</small><strong>{value}</strong></span>
    </div>
  )
}

function normalizeDailyLog(log: DailyLog, lifeStage?: string): DailyLog {
  const base = createDailyLog(log.date)
  const fallbackContext: CycleContext = lifeStage === 'perimenopause' || lifeStage === 'postmenopause'
    ? 'peri-meno'
    : 'none'
  return {
    ...base,
    ...log,
    habits: { ...base.habits, ...log.habits },
    cycleContext: log.cycleContext ?? fallbackContext,
    symptoms: Array.isArray(log.symptoms) ? log.symptoms : [],
  }
}

function buildNextAction({
  completeCount,
  remainingProtein,
  nextHabit,
  nextMeal,
  metabolicSupport,
  appetite,
  energy,
  nausea,
  cycleContext,
  symptoms,
}: {
  completeCount: number
  remainingProtein: number
  nextHabit: string
  nextMeal: string
  metabolicSupport: boolean
  appetite: number
  energy: number
  nausea: number
  cycleContext: CycleContext
  symptoms: string[]
}) {
  if (metabolicSupport && (nausea >= 2 || appetite <= 2)) {
    return {
      title: 'Make today an intake-protection day.',
      detail: 'Protein, fluids, and a low-friction meal come before extra intensity.',
      tone: 'watch' as const,
      warning: 'Persistent nausea, vomiting, dehydration, severe abdominal pain, or inability to eat belongs with the prescribing clinician.',
    }
  }
  if (energy <= 2 || symptoms.length >= 2 || cycleContext === 'period') {
    return {
      title: 'Lower the bar, keep the streak.',
      detail: 'Hit protein, hydrate, and use walking or lighter training if symptoms are loud.',
      tone: 'watch' as const,
      warning: 'Pain, heavy bleeding, fainting, chest symptoms, or severe weakness is not a willpower problem. Get medical help.',
    }
  }
  if (remainingProtein > 0) {
    return {
      title: `Start with ${remainingProtein}g of protein left.`,
      detail: `Next easy win: ${nextMeal}. Then reassess training after appetite and energy are logged.`,
      tone: 'base' as const,
      warning: '',
    }
  }
  if (cycleContext === 'luteal') {
    return {
      title: 'Hold the plan through the noisy part.',
      detail: 'Protein is covered. Expect more hunger or scale noise; finish one anchor instead of changing the plan.',
      tone: 'base' as const,
      warning: '',
    }
  }
  if (completeCount < 5) {
    return {
      title: `Finish the ${nextHabit} anchor.`,
      detail: 'Protein is handled. The smallest unfinished habit is the move.',
      tone: 'base' as const,
      warning: '',
    }
  }
  return {
    title: 'Today is handled.',
    detail: 'Only add a note if something useful changed: cycle, symptoms, digestion, sleep, or training.',
    tone: 'base' as const,
    warning: '',
  }
}

function ScaleInput({
  label,
  value,
  low,
  high,
  min = 1,
  max = 5,
  onChange,
}: {
  label: string
  value: number
  low: string
  high: string
  min?: number
  max?: number
  onChange: (value: number) => void
}) {
  return (
    <label className="scale-input">
      <span><strong>{label}</strong><b>{value}</b></span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <small><span>{low}</span><span>{high}</span></small>
    </label>
  )
}
