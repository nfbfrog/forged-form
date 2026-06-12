import { useState } from 'react'
import { AlertCircle, BookOpen, ClipboardList, HeartPulse } from 'lucide-react'
import { researchItems } from '../data'
import { SectionHeading } from '../App'
import { VisitPrep } from '../components/VisitPrep'

const goals = [
  ['all', 'All'],
  ['cycle', 'Cycle'],
  ['menopause', 'Peri / meno'],
  ['nutrition', 'Nutrition'],
  ['training', 'Training'],
  ['metabolic', 'Metabolic'],
  ['recovery', 'Recovery'],
  ['labs', 'Labs'],
] as const

export function LearnScreen() {
  const [goal, setGoal] = useState<string>('all')
  const items = researchItems.filter((item) => goal === 'all' || item.goals.includes(goal))

  return (
    <div className="content-stack">
      <section className="research-boundary">
        <HeartPulse size={22} />
        <div>
          <h2>Education, not diagnosis</h2>
          <p>This section helps organize body signals, training context, nutrition patterns, cycle changes, and clinician questions. It does not replace medical care.</p>
        </div>
      </section>
      <section>
        <SectionHeading title="Browse by topic" detail="Use this as context for smarter tracking and better clinician conversations." />
        <div className="filter-chips">
          {goals.map(([id, label]) => (
            <button key={id} type="button" className={goal === id ? 'active' : ''} onClick={() => setGoal(id)}>{label}</button>
          ))}
        </div>
        <div className="research-grid">
          {items.map((item) => (
            <article className="research-card" key={item.id}>
              <header><BookOpen size={20} /><span>{item.evidence}</span></header>
              <h3>{item.name}</h3>
              <p>{item.overview}</p>
              <div><AlertCircle size={17} /><span>{item.watch}</span></div>
            </article>
          ))}
        </div>
      </section>
      <section>
        <SectionHeading
          title="Visit prep"
          detail="Turn your own logs into a one-page summary for a clinician or coach. Pick the questions you want to ask, then build, print, or copy it. Local and user-controlled."
        />
        <div className="visit-prep-intro">
          <ClipboardList size={20} />
          <p>Pulls your latest vitals, recent lab trends, and your strongest symptom pattern so the conversation starts from real data, not memory.</p>
        </div>
        <VisitPrep />
      </section>
    </div>
  )
}
