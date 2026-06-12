import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Check, ChevronRight, Dumbbell, Save } from 'lucide-react'
import { db } from '../db'
import { sessions } from '../data'
import { SectionHeading } from '../App'
import { localDateKey } from '../utils/date'

type Session = (typeof sessions)[number]

export function TrainingScreen() {
  const [selectedId, setSelectedId] = useState<string>(sessions[0].id)
  const [rampOpen, setRampOpen] = useState(() => window.innerWidth >= 720)
  const selected = sessions.find((session) => session.id === selectedId) ?? sessions[0]

  return (
    <div className="content-stack">
      <section className="ramp-panel">
        <button type="button" className="ramp-header" onClick={() => setRampOpen(!rampOpen)} aria-expanded={rampOpen}>
          <span><strong>2-4 week ramp-in</strong><small>Earn the full program gradually.</small></span>
          <ChevronRight size={19} className={rampOpen ? 'rotated' : ''} />
        </button>
        {rampOpen ? (
          <div className="ramp-steps">
            <p><b>Week 1</b><span>2 sessions, 2 sets per exercise, leave 3-4 reps in reserve.</span></p>
            <p><b>Week 2</b><span>3 sessions, mostly 2 sets, controlled tempo.</span></p>
            <p><b>Weeks 3-4</b><span>Move toward 4 sessions only if sleep, joints, and recovery are steady.</span></p>
          </div>
        ) : null}
      </section>

      <section>
        <SectionHeading title="Four-day split" detail="Select a session, then log the work you actually completed." />
        <div className="session-tabs" role="tablist">
          {sessions.map((session) => (
            <button
              key={session.id}
              type="button"
              role="tab"
              aria-selected={selected.id === session.id}
              className={selected.id === session.id ? 'active' : ''}
              onClick={() => setSelectedId(session.id)}
            >
              {session.name}
            </button>
          ))}
        </div>
        <SessionLogger session={selected} />
      </section>

      <section className="training-rules">
        <Dumbbell size={22} />
        <div>
          <h3>Progressive overload, without theatrics</h3>
          <p>Beat one number with clean form: a rep, a small amount of weight, or better control. Deload around every 8 weeks or earlier when performance, sleep, or joints trend down. Swap any exercise that repeatedly hurts.</p>
        </div>
      </section>
    </div>
  )
}

function SessionLogger({ session }: { session: Session }) {
  const date = localDateKey()
  const entries = useLiveQuery(
    () => db.exerciseEntries.where('[date+sessionId]').equals([date, session.id]).toArray(),
    [date, session.id],
  ) ?? []
  const [drafts, setDrafts] = useState<Record<string, { weight: string; reps: string }>>({})

  async function save(exerciseId: string) {
    const draft = drafts[exerciseId]
    const weight = Number(draft?.weight)
    const reps = Number(draft?.reps)
    if (!Number.isFinite(weight) || !Number.isInteger(reps) || weight < 0 || reps <= 0) return
    await db.exerciseEntries.add({ date, sessionId: session.id, exerciseId, weight, reps })
    setDrafts((current) => ({ ...current, [exerciseId]: { weight: '', reps: '' } }))
  }

  return (
    <div className="exercise-list">
      {session.exercises.map(([id, name, prescription, swap]) => {
        const last = entries.filter((entry) => entry.exerciseId === id).at(-1)
        const draft = drafts[id] ?? { weight: '', reps: '' }
        return (
          <article className="exercise-row" key={id}>
            <div className="exercise-name">
              <h3>{name}</h3>
              <p>{prescription} <span>Swap: {swap}</span></p>
            </div>
            <div className="set-entry">
              <label><span>Weight</span><input type="number" min="0" inputMode="decimal" value={draft.weight} onChange={(event) => setDrafts((current) => ({ ...current, [id]: { ...draft, weight: event.target.value } }))} /></label>
              <span className="times">x</span>
              <label><span>Reps</span><input type="number" min="1" inputMode="numeric" value={draft.reps} onChange={(event) => setDrafts((current) => ({ ...current, [id]: { ...draft, reps: event.target.value } }))} /></label>
              <button type="button" className="icon-button save-set" title={`Save ${name} set`} aria-label={`Save ${name} set`} onClick={() => void save(id)}><Save size={17} /></button>
            </div>
            <small className="last-set">{last ? <><Check size={14} /> Last today: {last.weight} x {last.reps}</> : 'No sets logged today'}</small>
          </article>
        )
      })}
    </div>
  )
}
