import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  AlertTriangle,
  BedDouble,
  ChevronRight,
  Droplets,
  Dumbbell,
  Footprints,
  HeartPulse,
  Moon,
  Plus,
  RotateCcw,
  Salad,
  Sparkles,
  SunMedium,
  ThermometerSun,
  TimerReset,
  Waves,
} from 'lucide-react'
import { db, getOrCreateDailyLog } from '../db'
import { menus, sessions } from '../data'
import { SectionHeading } from '../App'
import { AnchorRings, type AnchorRingItem } from '../components/AnchorRings'
import { BottomSheet } from '../components/BottomSheet'
import { SessionLogger } from '../components/SessionLogger'
import { createDailyLog, habitKeys, type DailyLog, type HabitKey } from '../types'
import { friendlyDate, localDateKey, startOfWeek } from '../utils/date'
import { haptics } from '../utils/haptics'
import { perMealFloor } from '../utils/protein'
import { useToday } from '../utils/useToday'

type CycleContext = DailyLog['cycleContext']
type AnchorKey = 'steps' | 'water' | 'sleep'

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

const appetiteWords = ['Gone', 'Low', 'Steady', 'Hungry', 'Ravenous']
const energyWords = ['Flat', 'Low', 'Steady', 'Good', 'Strong']
const nauseaWords = ['None', 'Mild', 'Moderate', 'Strong']

export function TodayScreen() {
  const date = useToday()
  const weekStart = localDateKey(startOfWeek())
  const [proteinSheetOpen, setProteinSheetOpen] = useState(false)
  const [customAmount, setCustomAmount] = useState('')
  const [resetArmed, setResetArmed] = useState(false)
  const [anchorSheet, setAnchorSheet] = useState<AnchorKey | null>(null)
  const [anchorInput, setAnchorInput] = useState('')
  const [liftOpen, setLiftOpen] = useState(false)
  const [signalsOpen, setSignalsOpen] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const storedLog = useLiveQuery(() => db.dailyLogs.get(date), [date])
  const settings = useLiveQuery(() => db.settings.get('primary'), [])
  const metric = useLiveQuery(() => db.weeklyMetrics.get(weekStart), [weekStart])
  const setsToday = useLiveQuery(() => db.exerciseEntries.where('date').equals(date).toArray(), [date]) ?? []

  const log = normalizeDailyLog(storedLog ?? createDailyLog(date), settings?.lifeStage)
  const target = settings?.proteinTarget ?? 140
  const waterTarget = settings?.waterTarget ?? 80
  const stepTarget = settings?.stepTarget ?? 8000
  const sleepTarget = settings?.sleepTarget ?? 7.5
  const percent = Math.min(100, Math.round((log.protein / target) * 100))
  const completeCount = habitKeys.filter((key) => log.habits[key]).length

  const suggestedSession = sessions.find((session) => !metric?.sessions?.[session.id])
  const activeSession = sessions.find((session) => session.id === selectedSessionId) ?? suggestedSession ?? sessions[0]
  const sessionsDone = sessions.filter((session) => metric?.sessions?.[session.id]).length

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
        proteinEntries: [...(current.proteinEntries ?? []), amount],
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

  // Numeric anchors track a real tally against the target the user set, instead of a one-tap toggle.
  // habits[key] mirrors "target met" so the Week grid and coach summary stay consistent.
  async function setAnchor(field: 'water' | 'steps' | 'sleepHours', habit: HabitKey, value: number, anchorTarget: number) {
    const next = Math.max(0, value)
    const crossed = (log[field] ?? 0) < anchorTarget && next >= anchorTarget
    await save((current) => ({
      ...current,
      [field]: next,
      habits: { ...current.habits, [habit]: anchorTarget > 0 && next >= anchorTarget },
    }))
    if (crossed && completeCount === 4) haptics.success()
    else haptics.tick()
  }

  function openAnchor(key: AnchorKey) {
    const seed = key === 'steps' ? log.steps : key === 'sleep' ? log.sleepHours : 0
    setAnchorInput(seed ? String(seed) : '')
    setAnchorSheet(key)
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
    {
      key: 'movement',
      label: habitMeta.movement.label,
      icon: habitMeta.movement.icon,
      progress: log.habits.movement ? 1 : 0,
      complete: log.habits.movement,
      onToggle: () => void toggleHabit('movement'),
    },
    {
      key: 'steps',
      label: habitMeta.steps.label,
      icon: habitMeta.steps.icon,
      progress: stepTarget > 0 ? (log.steps ?? 0) / stepTarget : 0,
      complete: (log.steps ?? 0) >= stepTarget && stepTarget > 0,
      detail: (log.steps ?? 0).toLocaleString(),
      onToggle: () => openAnchor('steps'),
    },
    {
      key: 'water',
      label: habitMeta.water.label,
      icon: habitMeta.water.icon,
      progress: waterTarget > 0 ? (log.water ?? 0) / waterTarget : 0,
      complete: (log.water ?? 0) >= waterTarget && waterTarget > 0,
      detail: `${log.water ?? 0}oz`,
      onToggle: () => openAnchor('water'),
    },
    {
      key: 'sleep',
      label: habitMeta.sleep.label,
      icon: habitMeta.sleep.icon,
      progress: sleepTarget > 0 ? (log.sleepHours ?? 0) / sleepTarget : 0,
      complete: (log.sleepHours ?? 0) >= sleepTarget && sleepTarget > 0,
      detail: `${log.sleepHours ?? 0}h`,
      onToggle: () => openAnchor('sleep'),
    },
  ]

  // Logging stays fast; the only prose on this screen is a safety line when logged signals warrant one.
  const safetyNote = settings?.metabolicSupport && (log.nausea >= 2 || log.appetite <= 2)
    ? 'Protect intake today: protein and fluids first. Persistent vomiting, dehydration, or inability to eat belongs with the prescribing clinician.'
    : log.energy <= 2 && log.symptoms.length >= 2
      ? 'Rough day is fine — hit protein, hydrate, walk. Severe pain, heavy bleeding, fainting, or chest symptoms need medical help, not willpower.'
      : ''

  return (
    <div className="content-stack today-stack">
      <section>
        <SectionHeading
          title="Daily anchors"
          detail={completeCount === 5 ? 'All five closed. Today is handled.' : friendlyDate(date)}
        />
        <AnchorRings items={ringItems} celebrate={completeCount === 5} />
      </section>

      <section className="focus-panel protein-panel">
        <SectionHeading
          title="Protein floor"
          detail={`${Math.max(0, target - log.protein)}g to go`}
          action={
            <button
              type="button"
              className={`icon-button quiet ${resetArmed ? 'armed-reset' : ''}`}
              title={resetArmed ? 'Tap again to confirm' : "Reset today's protein"}
              aria-label={resetArmed ? 'Confirm protein reset' : "Reset today's protein"}
              onClick={() => {
                if (!resetArmed) {
                  setResetArmed(true)
                  window.setTimeout(() => setResetArmed(false), 3500)
                  return
                }
                setResetArmed(false)
                void save((current) => ({
                  ...current,
                  protein: 0,
                  proteinEntries: [],
                  habits: { ...current.habits, protein: false },
                }))
              }}
            >
              {resetArmed ? 'Reset?' : <RotateCcw size={17} />}
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
              <Plus size={15} /> {meal.name} · {meal.protein}g
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
        {settings?.bodyWeightLb ? (() => {
          const floor = perMealFloor(settings.bodyWeightLb)
          const doses = (log.proteinEntries ?? []).filter((amount) => amount >= floor).length
          return (
            <p className="per-meal-hint">
              {doses > 0
                ? `${doses} ${doses === 1 ? 'meal has' : 'meals have'} cleared the ~${floor}g floor today. `
                : `Aim for ~${floor}g per meal. `}
              Spreading protein across the day builds more muscle than one big hit.
            </p>
          )
        })() : null}
      </section>

      <section className="fold-card">
        <button type="button" className="fold-header" onClick={() => setLiftOpen(!liftOpen)} aria-expanded={liftOpen}>
          <span>
            <span className="fold-title"><Dumbbell size={17} /> Today's lift</span>
            <span className="fold-summary">
              {suggestedSession ? `Next: ${suggestedSession.name} · ${suggestedSession.focus}` : 'All 4 sessions done this week'}
              {setsToday.length ? ` · ${setsToday.length} set${setsToday.length === 1 ? '' : 's'} today` : ''}
            </span>
          </span>
          <ChevronRight size={18} className={liftOpen ? 'rotated' : ''} />
        </button>
        {liftOpen ? (
          <div className="fold-body">
            <div className="session-tabs" role="tablist">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  type="button"
                  role="tab"
                  aria-selected={activeSession.id === session.id}
                  className={activeSession.id === session.id ? 'active' : ''}
                  onClick={() => setSelectedSessionId(session.id)}
                >
                  {session.name}
                </button>
              ))}
            </div>
            <SessionLogger session={activeSession} />
          </div>
        ) : null}
      </section>

      <section className="fold-card">
        <button type="button" className="fold-header" onClick={() => setSignalsOpen(!signalsOpen)} aria-expanded={signalsOpen}>
          <span>
            <span className="fold-title"><HeartPulse size={17} /> Body signals</span>
            <span className="fold-summary">
              {appetiteWords[log.appetite - 1]} appetite · {energyWords[log.energy - 1]} energy · {nauseaWords[log.nausea]} nausea
              {log.symptoms.length ? ` · ${log.symptoms.length} symptom${log.symptoms.length === 1 ? '' : 's'}` : ''}
            </span>
          </span>
          <ChevronRight size={18} className={signalsOpen ? 'rotated' : ''} />
        </button>
        {signalsOpen ? (
          <div className="fold-body">
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
            <div className="checkin-grid">
              <SignalScale
                label="Appetite"
                value={log.appetite}
                words={appetiteWords}
                onChange={(value) => void save((current) => ({ ...current, appetite: value }))}
              />
              <SignalScale
                label="Energy"
                value={log.energy}
                words={energyWords}
                onChange={(value) => void save((current) => ({ ...current, energy: value }))}
              />
              <SignalScale
                label="Nausea"
                value={log.nausea}
                min={0}
                tone="watch"
                words={nauseaWords}
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
                      onClick={() => void save((current) => ({
                        ...current,
                        symptoms: current.symptoms.includes(symptom)
                          ? current.symptoms.filter((item) => item !== symptom)
                          : [...current.symptoms, symptom],
                      }))}
                      aria-pressed={active}
                    >
                      {symptom}
                    </button>
                  )
                })}
              </div>
            </div>
            <label className="field">
              <span>Notes</span>
              <textarea
                value={log.note}
                placeholder="Cycle, sleep, digestion, cravings, pain, training..."
                onChange={(event) => void save((current) => ({ ...current, note: event.target.value }))}
              />
            </label>
          </div>
        ) : null}
      </section>

      {safetyNote ? (
        <section className="alert-strip">
          <AlertTriangle size={19} />
          <p>{safetyNote}</p>
        </section>
      ) : null}

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

      {anchorSheet === 'water' ? (
        <BottomSheet title="Add water" onClose={() => setAnchorSheet(null)}>
          <p className="sheet-total">{log.water ?? 0} / {waterTarget} oz today</p>
          <div className="sheet-chips">
            {[8, 12, 16].map((oz) => (
              <button key={oz} type="button" onClick={() => void setAnchor('water', 'water', (log.water ?? 0) + oz, waterTarget)}>
                +{oz} oz
              </button>
            ))}
          </div>
          <div className="sheet-row">
            <button type="button" className="secondary-button" disabled={(log.water ?? 0) <= 0} onClick={() => void setAnchor('water', 'water', (log.water ?? 0) - 8, waterTarget)}>
              Remove a cup
            </button>
            <button type="button" className="secondary-button" disabled={(log.water ?? 0) <= 0} onClick={() => void setAnchor('water', 'water', 0, waterTarget)}>
              Reset
            </button>
          </div>
        </BottomSheet>
      ) : null}

      {anchorSheet === 'steps' || anchorSheet === 'sleep' ? (
        <BottomSheet
          title={anchorSheet === 'steps' ? "Today's steps" : "Last night's sleep"}
          onClose={() => setAnchorSheet(null)}
        >
          <div className="sheet-chips">
            {(anchorSheet === 'steps' ? [5000, 8000, 10000] : [6, 7, 8]).map((preset) => (
              <button key={preset} type="button" onClick={() => setAnchorInput(String(preset))}>
                {anchorSheet === 'steps' ? preset.toLocaleString() : `${preset}h`}
              </button>
            ))}
          </div>
          <form
            className="sheet-row"
            onSubmit={(event) => {
              event.preventDefault()
              const value = Number(anchorInput)
              if (!Number.isFinite(value) || value < 0) return
              if (anchorSheet === 'steps') void setAnchor('steps', 'steps', Math.round(value), stepTarget)
              else void setAnchor('sleepHours', 'sleep', value, sleepTarget)
              setAnchorSheet(null)
            }}
          >
            <label className="field">
              <span>{anchorSheet === 'steps' ? 'Step count' : 'Hours slept'}</span>
              <div className="input-suffix">
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step={anchorSheet === 'steps' ? '100' : '0.5'}
                  autoFocus
                  value={anchorInput}
                  onChange={(event) => setAnchorInput(event.target.value)}
                />
                <small>{anchorSheet === 'steps' ? 'steps' : 'h'}</small>
              </div>
            </label>
            <button type="submit" className="primary-button" disabled={anchorInput === '' || Number(anchorInput) < 0}>
              Save
            </button>
          </form>
        </BottomSheet>
      ) : null}

      <p className="cycle-hint">
        Sessions done this week: {sessionsDone}/4. Context and signals feed your Week trends and coach summary.
      </p>
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
    proteinEntries: Array.isArray(log.proteinEntries) ? log.proteinEntries : [],
    water: log.water ?? 0,
    steps: log.steps ?? 0,
    sleepHours: log.sleepHours ?? 0,
    cycleContext: log.cycleContext ?? fallbackContext,
    symptoms: Array.isArray(log.symptoms) ? log.symptoms : [],
  }
}

function SignalScale({
  label,
  value,
  words,
  min = 1,
  tone = 'accent',
  onChange,
}: {
  label: string
  value: number
  /** One word per level, indexed from `min` (e.g. min 0 → words[0] describes 0). */
  words: string[]
  min?: number
  tone?: 'accent' | 'watch'
  onChange: (value: number) => void
}) {
  const max = min + words.length - 1
  const levels: number[] = []
  for (let level = Math.max(min, 1); level <= max; level += 1) levels.push(level)
  const cleared = min === 0 && value === 0
  return (
    <div className={`signal-scale ${tone} ${cleared ? 'cleared' : ''}`}>
      <header>
        <strong>{label}</strong>
        <span className="signal-word">{words[value - min] ?? ''}</span>
      </header>
      <div className="signal-segments" role="group" aria-label={`${label} level`}>
        {levels.map((level) => (
          <button
            key={level}
            type="button"
            className={value >= level ? 'filled' : ''}
            aria-pressed={value === level}
            aria-label={`${label}: ${words[level - min]}`}
            onClick={() => {
              haptics.tick()
              // On zero-based scales, tapping the current level clears back to none.
              onChange(min === 0 && value === level ? 0 : level)
            }}
          />
        ))}
      </div>
    </div>
  )
}
