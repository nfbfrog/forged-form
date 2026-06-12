import { useLiveQuery } from 'dexie-react-hooks'
import { AlertTriangle, Camera, Check, Circle, HeartPulse, ShieldCheck, TrendingDown } from 'lucide-react'
import { db } from '../db'
import { sessions } from '../data'
import { SectionHeading } from '../App'
import { emptyHabits, habitKeys, type WeeklyMetric } from '../types'
import { classifyBloodPressure, weightLossStatus, type BpStatus } from '../utils/health'
import { friendlyDate, localDateKey, startOfWeek, weekKeys } from '../utils/date'

const shortHabit = {
  protein: 'Protein',
  movement: 'Move',
  steps: 'Steps',
  water: 'Water',
  sleep: 'Sleep',
}

export function WeekScreen() {
  const days = weekKeys()
  const weekStart = localDateKey(startOfWeek())
  const logs = useLiveQuery(() => db.dailyLogs.where('date').anyOf(days).toArray(), [weekStart]) ?? []
  const metric = useLiveQuery(() => db.weeklyMetrics.get(weekStart), [weekStart]) ?? {
    weekStart,
    photo: false,
    bestLift: '',
    sessions: {},
  }
  const previousWeekStart = localDateKey(new Date(startOfWeek().getTime() - 7 * 24 * 60 * 60 * 1000))
  const previousMetric = useLiveQuery(() => db.weeklyMetrics.get(previousWeekStart), [previousWeekStart])

  async function save(update: (current: WeeklyMetric) => WeeklyMetric) {
    const current = await db.weeklyMetrics.get(weekStart) ?? metric
    await db.weeklyMetrics.put(update(current))
  }

  const completed = days.reduce((sum, day) => {
    const habits = logs.find((log) => log.date === day)?.habits ?? emptyHabits()
    return sum + habitKeys.filter((key) => habits[key]).length
  }, 0)
  const trainingCompleted = sessions.filter((session) => metric.sessions[session.id]).length
  const bpStatus = classifyBloodPressure(metric.systolic, metric.diastolic)
  const weightStatus = weightLossStatus(metric.weight, previousMetric?.weight)
  const consistencyTone = completed >= 25 ? 'good' : completed >= 15 ? 'watch' : 'base'

  return (
    <div className="content-stack">
      <section>
        <SectionHeading title="This week" detail={`${completed} of 35 anchors complete`} />
        <div className="insight-grid">
          <InsightCard icon={ShieldCheck} label="Consistency" value={`${completed}/35`} detail={completed >= 25 ? 'Strong week. Keep meals boring and repeatable.' : 'One more anchor today changes the week.'} tone={consistencyTone} />
          <InsightCard icon={HeartPulse} label="Blood pressure" value={bpStatus?.label ?? 'Not logged'} detail={bpStatus?.detail ?? 'Add systolic and diastolic once this week.'} tone={bpStatus?.tone ?? 'base'} />
          <InsightCard icon={TrendingDown} label="Weight trend" value={weightStatus?.label ?? 'Need 2 weeks'} detail={weightStatus?.detail ?? 'Log weight this week and next week to read pace.'} tone={weightStatus?.tone ?? 'base'} />
        </div>
        {bpStatus?.tone === 'urgent' ? (
          <div className="alert-strip urgent">
            <AlertTriangle size={19} />
            <p>{bpStatus.detail}</p>
          </div>
        ) : null}
        <div className="week-grid">
          <div className="week-corner" />
          {days.map((day) => (
            <div key={day} className={`day-head ${day === localDateKey() ? 'today' : ''}`}>
              <span>{friendlyDate(day, { weekday: 'narrow' })}</span>
              <strong>{friendlyDate(day, { day: 'numeric' })}</strong>
            </div>
          ))}
          {habitKeys.map((habit) => (
            <div className="week-row" key={habit}>
              <span className="row-label">{shortHabit[habit]}</span>
              {days.map((day) => {
                const done = logs.find((log) => log.date === day)?.habits[habit] ?? false
                return <span key={day} className={`week-cell ${done ? 'done' : ''}`}>{done ? <Check size={15} /> : null}</span>
              })}
            </div>
          ))}
        </div>
      </section>

      <section className="split-section">
        <div>
          <SectionHeading title="Training sessions" detail={`${trainingCompleted} of ${sessions.length} sessions complete. Aim for consistency, not a perfect calendar.`} />
          <div className="session-checklist">
            {sessions.map((session) => {
              const done = metric.sessions[session.id] ?? false
              return (
                <button
                  type="button"
                  key={session.id}
                  className={done ? 'checked' : ''}
                  onClick={() => void save((current) => ({
                    ...current,
                    sessions: { ...current.sessions, [session.id]: !done },
                  }))}
                >
                  {done ? <Check size={18} /> : <Circle size={18} />}
                  <span><strong>{session.name}</strong><small>{session.focus}</small></span>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <SectionHeading title="Weekly markers" detail="One check-in, same conditions when possible." />
          <div className="metric-grid">
            <NumberField label="Weight" suffix="lb" value={metric.weight} onChange={(weight) => void save((current) => ({ ...current, weight }))} />
            <NumberField label="Waist" suffix="in" value={metric.waist} onChange={(waist) => void save((current) => ({ ...current, waist }))} />
            <NumberField label="Systolic" suffix="mmHg" value={metric.systolic} onChange={(systolic) => void save((current) => ({ ...current, systolic }))} />
            <NumberField label="Diastolic" suffix="mmHg" value={metric.diastolic} onChange={(diastolic) => void save((current) => ({ ...current, diastolic }))} />
            <NumberField label="Resting pulse" suffix="bpm" value={metric.restingPulse} onChange={(restingPulse) => void save((current) => ({ ...current, restingPulse }))} />
            <label className="field">
              <span>Best lift</span>
              <input value={metric.bestLift} placeholder="Exercise + result" onChange={(event) => void save((current) => ({ ...current, bestLift: event.target.value }))} />
            </label>
          </div>
          <button
            type="button"
            className={`photo-toggle ${metric.photo ? 'active' : ''}`}
            onClick={() => void save((current) => ({ ...current, photo: !current.photo }))}
          >
            <Camera size={18} /> {metric.photo ? 'Progress photo complete' : 'Mark progress photo complete'}
          </button>
        </div>
      </section>
    </div>
  )
}

function InsightCard({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: typeof ShieldCheck
  label: string
  value: string
  detail: string
  tone: BpStatus['tone'] | 'base'
}) {
  return (
    <article className={`insight-card ${tone}`}>
      <Icon size={19} />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <p>{detail}</p>
      </div>
    </article>
  )
}

function NumberField({
  label,
  suffix,
  value,
  onChange,
}: {
  label: string
  suffix: string
  value?: number
  onChange: (value: number | undefined) => void
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="input-suffix">
        <input
          type="number"
          inputMode="decimal"
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value ? Number(event.target.value) : undefined)}
        />
        <small>{suffix}</small>
      </div>
    </label>
  )
}
