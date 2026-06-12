import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Trash2 } from 'lucide-react'
import { db } from '../db'
import { labMarkers } from '../data'
import { Sparkline } from './Sparkline'
import { classifyFerritin } from '../utils/health'
import { friendlyDate, localDateKey } from '../utils/date'
import type { LabResult } from '../types'

export function LabLog() {
  const results = useLiveQuery(() => db.labResults.toArray(), []) ?? []
  const [markerId, setMarkerId] = useState(labMarkers[0].id)
  const [value, setValue] = useState('')
  const [date, setDate] = useState(localDateKey())
  const [note, setNote] = useState('')

  const marker = labMarkers.find((m) => m.id === markerId) ?? labMarkers[0]

  async function add() {
    const numeric = Number(value)
    if (!Number.isFinite(numeric) || numeric <= 0) return
    await db.labResults.add({ date, marker: marker.id, value: numeric, unit: marker.unit, note: note.trim() || undefined })
    setValue('')
    setNote('')
  }

  // Group logged results by marker, newest first within each.
  const byMarker = new Map<string, LabResult[]>()
  for (const r of results) {
    const list = byMarker.get(r.marker) ?? []
    list.push(r)
    byMarker.set(r.marker, list)
  }
  const loggedMarkers = labMarkers.filter((m) => byMarker.has(m.id))

  return (
    <div className="lab-log">
      <form
        className="lab-form"
        onSubmit={(event) => {
          event.preventDefault()
          void add()
        }}
      >
        <label className="field">
          <span>Marker</span>
          <select value={markerId} onChange={(event) => setMarkerId(event.target.value)}>
            {labMarkers.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Result</span>
          <div className="input-suffix">
            <input type="number" inputMode="decimal" min="0" step="any" value={value} onChange={(event) => setValue(event.target.value)} />
            <small>{marker.unit}</small>
          </div>
        </label>
        <label className="field">
          <span>Date</span>
          <input type="date" value={date} max={localDateKey()} onChange={(event) => setDate(event.target.value)} />
        </label>
        <label className="field lab-note-field">
          <span>Note (optional)</span>
          <input value={note} placeholder="Lab, fasting, symptoms…" onChange={(event) => setNote(event.target.value)} />
        </label>
        <button type="submit" className="primary-button" disabled={!(Number(value) > 0)}>
          <Plus size={15} /> Add
        </button>
      </form>

      {loggedMarkers.length === 0 ? (
        <p className="lab-empty">No labs logged yet. Add a result above to start a private trend you can bring to your clinician.</p>
      ) : (
        <div className="lab-results">
          {loggedMarkers.map((m) => {
            const history = (byMarker.get(m.id) ?? []).slice().sort((a, b) => a.date.localeCompare(b.date))
            const latest = history[history.length - 1]
            const status = m.flagged ? classifyFerritin(latest.value) : null
            return (
              <article className={`lab-result ${status ? status.tone : ''}`} key={m.id}>
                <header>
                  <div>
                    <strong>{m.label}</strong>
                    <span className="lab-latest">{latest.value} {m.unit} · {friendlyDate(latest.date, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  {status ? <span className={`lab-badge ${status.tone}`}>{status.label}</span> : null}
                </header>
                {history.length >= 2 ? (
                  <Sparkline values={history.map((h) => h.value)} ariaLabel={`${m.label} history: ${history.map((h) => h.value).join(', ')} ${m.unit}`} />
                ) : null}
                {status ? <p className="lab-status-detail">{status.detail}</p> : null}
                <ul className="lab-history">
                  {history.slice().reverse().map((entry) => (
                    <li key={entry.id}>
                      <span>{friendlyDate(entry.date, { month: 'short', day: 'numeric', year: 'numeric' })} · {entry.value} {m.unit}{entry.note ? ` · ${entry.note}` : ''}</span>
                      <button type="button" className="icon-button quiet" aria-label={`Delete ${m.label} entry`} title="Delete entry" onClick={() => entry.id !== undefined && void db.labResults.delete(entry.id)}>
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
