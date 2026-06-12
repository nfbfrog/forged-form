import { useState } from 'react'
import { AlertCircle, BookOpen, CheckCircle2, HeartPulse } from 'lucide-react'
import { researchItems } from '../data'
import { SectionHeading } from '../App'

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
        <SectionHeading title="Clinician conversation" detail="Bring patterns, not guesses." />
        <div className="question-list">
          {[
            'Which symptoms or trends are normal for my life stage, and which are not?',
            'Do my cycle, sleep, appetite, training, and mood notes change what we should check?',
            'Which labs are worth repeating, and what timing matters for interpretation?',
            'What symptoms mean I should stop training hard or seek urgent care?',
          ].map((question) => <p key={question}><CheckCircle2 size={18} />{question}</p>)}
        </div>
      </section>
    </div>
  )
}
