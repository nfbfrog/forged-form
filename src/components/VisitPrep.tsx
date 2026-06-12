import { useState } from 'react'
import { ClipboardCheck, FileText, Printer } from 'lucide-react'
import { clinicianQuestions } from '../data'
import { buildVisitPrep, formatVisitPrepText, type VisitPrepData } from '../utils/visitPrep'
import { friendlyDate } from '../utils/date'

const trendArrow = { up: '↑', down: '↓', flat: '→' } as const

export function VisitPrep() {
  const [selected, setSelected] = useState<string[]>([clinicianQuestions[0], clinicianQuestions[3]])
  const [data, setData] = useState<VisitPrepData | null>(null)
  const [message, setMessage] = useState('')

  function toggle(question: string) {
    setData(null)
    setSelected((current) =>
      current.includes(question) ? current.filter((q) => q !== question) : [...current, question],
    )
  }

  async function generate() {
    setData(await buildVisitPrep(selected))
    setMessage('')
  }

  async function copy() {
    if (!data) return
    try {
      await navigator.clipboard.writeText(formatVisitPrepText(data))
      setMessage('Visit prep copied. Review it before sharing.')
    } catch {
      setMessage('Could not copy. Use Print instead.')
    }
  }

  return (
    <div className="visit-prep">
      <div className="visit-questions" role="group" aria-label="Questions to include">
        {clinicianQuestions.map((question) => {
          const on = selected.includes(question)
          return (
            <button key={question} type="button" className={`visit-question ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => toggle(question)}>
              <span className="visit-check" aria-hidden="true">{on ? '✓' : ''}</span>
              {question}
            </button>
          )
        })}
      </div>

      <div className="visit-actions">
        <button type="button" className="primary-button" onClick={() => void generate()}>
          <FileText size={16} /> {data ? 'Refresh page' : 'Build my page'}
        </button>
        {data ? (
          <>
            <button type="button" className="secondary-button" onClick={() => window.print()}>
              <Printer size={16} /> Print / Save PDF
            </button>
            <button type="button" className="secondary-button" onClick={() => void copy()}>
              <ClipboardCheck size={16} /> Copy text
            </button>
          </>
        ) : null}
      </div>
      {message ? <p className="system-message" role="status">{message}</p> : null}

      {data ? (
        <div className="visit-prep-sheet">
          <header className="visit-sheet-head">
            <h3>Visit prep</h3>
            <span>{friendlyDate(data.generatedAt.slice(0, 10), { month: 'long', day: 'numeric', year: 'numeric' })}{data.lifeStage && data.lifeStage !== 'other' ? ` · ${data.lifeStage}` : ''}</span>
          </header>

          {data.vitals ? (
            <section>
              <h4>Latest vitals</h4>
              <ul>
                {data.vitals.weight ? <li>Weight: {data.vitals.weight} lb</li> : null}
                {data.vitals.waist ? <li>Waist: {data.vitals.waist} in</li> : null}
                {data.vitals.systolic && data.vitals.diastolic ? <li>Blood pressure: {data.vitals.systolic}/{data.vitals.diastolic} mmHg</li> : null}
                {data.vitals.restingPulse ? <li>Resting pulse: {data.vitals.restingPulse} bpm</li> : null}
              </ul>
            </section>
          ) : null}

          {data.labs.length ? (
            <section>
              <h4>Recent labs</h4>
              <ul>
                {data.labs.map((lab) => (
                  <li key={lab.label}>
                    {lab.label}: {lab.value} {lab.unit}{lab.trend ? ` ${trendArrow[lab.trend]}` : ''} <em>({friendlyDate(lab.date, { month: 'short', day: 'numeric', year: 'numeric' })}{lab.status ? ` · ${lab.status}` : ''})</em>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {data.pattern ? (
            <section>
              <h4>Symptom pattern (6 weeks)</h4>
              <p>
                {data.pattern.symptom}: {data.pattern.count} days
                {data.pattern.context ? `, most often in ${data.pattern.context} logs (${data.pattern.contextCount} of ${data.pattern.count})` : ''}.
              </p>
            </section>
          ) : null}

          {data.questions.length ? (
            <section>
              <h4>Questions to ask</h4>
              <ul>{data.questions.map((q) => <li key={q}>{q}</li>)}</ul>
            </section>
          ) : null}

          <p className="visit-sheet-foot">Generated locally on this device. Descriptive personal tracking, not a diagnosis.</p>
        </div>
      ) : null}
    </div>
  )
}
