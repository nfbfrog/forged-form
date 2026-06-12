import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import Papa from 'papaparse'
import {
  AlertTriangle,
  ClipboardCheck,
  Download,
  Eye,
  EyeOff,
  FileUp,
  HeartPulse,
  Pill,
  Share2,
  ShieldCheck,
  Upload,
} from 'lucide-react'
import { labReferences } from '../data'
import { db, getOrCreateDailyLog } from '../db'
import { SectionHeading } from '../App'
import { exportBackup, importBackup } from '../utils/backup'
import {
  buildCoachSharePayload,
  copyCoachSummary,
  downloadCoachPacket,
  formatCoachShareSummary,
} from '../utils/coachShare'

type CsvRow = Record<string, string>

export function HealthScreen() {
  const csvRef = useRef<HTMLInputElement>(null)
  const backupRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')
  const [coachDays, setCoachDays] = useState(14)
  const [includeNotes, setIncludeNotes] = useState(true)
  const [includeSymptoms, setIncludeSymptoms] = useState(true)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewText, setPreviewText] = useState('')

  useEffect(() => {
    if (!previewOpen) return
    let active = true
    void buildCoachSharePayload({ days: coachDays, includeNotes, includeSymptoms }).then((payload) => {
      if (active) setPreviewText(formatCoachShareSummary(payload))
    })
    return () => {
      active = false
    }
  }, [previewOpen, coachDays, includeNotes, includeSymptoms])

  async function handleCsv(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const result = Papa.parse<CsvRow>(await file.text(), { header: true, skipEmptyLines: true })
      let imported = 0
      for (const row of result.data) {
        const normalized = Object.fromEntries(Object.entries(row).map(([key, value]) => [key.trim().toLowerCase(), value]))
        const date = normalized.date
        const protein = numberFrom(normalized, ['protein (g)', 'protein', 'protein g'])
        const calories = numberFrom(normalized, ['energy (kcal)', 'calories', 'energy', 'kcal'])
        if (!date || (!Number.isFinite(protein) && !Number.isFinite(calories))) continue
        const key = normalizeCsvDate(date)
        if (!key) continue
        const current = await getOrCreateDailyLog(key)
        await db.dailyLogs.put({
          ...current,
          protein: Number.isFinite(protein) ? protein : current.protein,
          calories: Number.isFinite(calories) ? calories : current.calories,
          habits: {
            ...current.habits,
            protein: Number.isFinite(protein)
              ? protein >= ((await db.settings.get('primary'))?.proteinTarget ?? 140)
              : current.habits.protein,
          },
          imported: true,
        })
        imported += 1
      }
      setMessage(imported ? `Imported ${imported} day${imported === 1 ? '' : 's'} from Cronometer.` : 'No usable Date, Protein, or Energy columns were found.')
    } catch {
      setMessage('That CSV could not be read. Export the daily nutrition report from Cronometer and try again.')
    } finally {
      event.target.value = ''
    }
  }

  async function handleBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      await importBackup(file)
      setMessage('Backup restored. Your local records are current.')
    } catch {
      setMessage('That backup is invalid or damaged. Nothing was replaced.')
    } finally {
      event.target.value = ''
    }
  }

  async function handleCopyCoachSummary() {
    try {
      await copyCoachSummary({ days: coachDays, includeNotes, includeSymptoms })
      setMessage('Coach summary copied. Review it before sending.')
    } catch {
      setMessage('Could not copy the coach summary. Try downloading the packet instead.')
    }
  }

  async function handleDownloadCoachPacket() {
    try {
      await downloadCoachPacket({ days: coachDays, includeNotes, includeSymptoms })
      setMessage('Coach packet downloaded. Share it only with someone you trust.')
    } catch {
      setMessage('Could not build the coach packet.')
    }
  }

  return (
    <div className="content-stack">
      <section>
        <SectionHeading title="Records + portability" detail="No account. No cloud database. You control the files." />
        <div className="action-grid">
          <button type="button" onClick={() => csvRef.current?.click()}><FileUp size={20} /><span><strong>Import Cronometer CSV</strong><small>Auto-fill daily protein + calories</small></span></button>
          <button type="button" onClick={() => void exportBackup()}><Download size={20} /><span><strong>Export backup</strong><small>Save all app data as JSON</small></span></button>
          <button type="button" onClick={() => backupRef.current?.click()}><Upload size={20} /><span><strong>Restore backup</strong><small>Validated before anything changes</small></span></button>
        </div>
        <input ref={csvRef} className="visually-hidden" type="file" accept=".csv,text/csv" onChange={(event) => void handleCsv(event)} />
        <input ref={backupRef} className="visually-hidden" type="file" accept=".json,application/json" onChange={(event) => void handleBackup(event)} />
        {message ? <p className="system-message" role="status">{message}</p> : null}
      </section>

      <section className="coach-share-panel">
        <SectionHeading
          title="Coach share"
          detail="Build a clean summary for a coach, trainer, dietitian, or clinician. Nothing is sent automatically."
        />
        <div className="coach-share-layout">
          <div className="coach-share-copy">
            <Share2 size={22} />
            <div>
              <h3>Relay the useful signals</h3>
              <p>Share adherence, protein, body signals, weekly check-ins, and training logs without sending the full app backup.</p>
            </div>
          </div>
          <div className="coach-share-controls">
            <label className="field">
              <span>Range</span>
              <select value={coachDays} onChange={(event) => setCoachDays(Number(event.target.value))}>
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
              </select>
            </label>
            <label className="share-toggle">
              <span><strong>Include notes</strong><small>Daily notes can be sensitive.</small></span>
              <input type="checkbox" checked={includeNotes} onChange={(event) => setIncludeNotes(event.target.checked)} />
            </label>
            <label className="share-toggle">
              <span><strong>Include symptom tags</strong><small>Useful for cycle/recovery context.</small></span>
              <input type="checkbox" checked={includeSymptoms} onChange={(event) => setIncludeSymptoms(event.target.checked)} />
            </label>
          </div>
          <div className="coach-share-actions">
            <button type="button" className="secondary-button" onClick={() => setPreviewOpen(!previewOpen)}>
              {previewOpen ? <EyeOff size={16} /> : <Eye size={16} />} {previewOpen ? 'Hide preview' : 'Preview summary'}
            </button>
            <button type="button" className="primary-button" onClick={() => void handleCopyCoachSummary()}>
              <ClipboardCheck size={16} /> Copy summary
            </button>
            <button type="button" className="secondary-button" onClick={() => void handleDownloadCoachPacket()}>
              <Download size={16} /> Download packet
            </button>
          </div>
          {previewOpen ? (
            <div className="coach-preview">
              <span className="coach-preview-label">Exactly what gets copied — review it before sending.</span>
              <pre>{previewText || 'Building preview…'}</pre>
            </div>
          ) : null}
        </div>
      </section>

      <section>
        <SectionHeading title="Medication-aware checks" detail="Built for the reality of appetite suppression and hormone-aware tracking." />
        <div className="safety-grid">
          <Safety icon={Pill} title="GLP-1 tolerance" text="Track nausea, appetite, hydration, pulse, and whether protein is still achievable. Severe abdominal pain, repeated vomiting, or dehydration needs prescriber input." />
          <Safety icon={ClipboardCheck} title="Before dose changes" text="Review intake, bowel changes, training recovery, mood, pulse, blood pressure, and any diabetes medicines with the prescribing clinician." />
          <Safety icon={ShieldCheck} title="Pregnancy plans" text="Semaglutide labeling says to discontinue when pregnancy is recognized and stop at least 2 months before a planned pregnancy. Confirm your exact medication with your clinician." />
        </div>
      </section>

      <section>
        <SectionHeading title="Lab reference" detail="Use trends and your clinician's ranges. This is context, not diagnosis." />
        <div className="lab-table">
          {labReferences.map(([name, text]) => <div key={name}><strong>{name}</strong><p>{text}</p></div>)}
        </div>
      </section>

      <section>
        <SectionHeading title="Hard lines" detail="These are reasons to stop guessing and get medical help." />
        <div className="safety-grid">
          <Safety icon={AlertTriangle} tone="urgent" title="Severe blood pressure" text="If a repeat reading remains above 180/120 mm Hg, contact a clinician immediately. With chest pain, weakness, vision change, trouble speaking, or shortness of breath, call 911." />
          <Safety icon={HeartPulse} title="Loss rate" text="A gradual 1-2 lb per week is the usual public-health range. Faster loss plus weakness, dizziness, or falling performance needs review." />
          <Safety icon={ShieldCheck} title="Medication tolerance" text="Persistent vomiting, dehydration, severe abdominal pain, fainting, or inability to maintain nutrition warrants prompt prescriber contact." />
        </div>
        <p className="source-line">
          References: <a href="https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings" target="_blank">AHA blood pressure</a>,
          {' '}<a href="https://www.cdc.gov/healthy-weight-growth/losing-weight/index.html" target="_blank">CDC weight loss</a>,
          {' '}<a href="https://www.niddk.nih.gov/health-information/diabetes/overview/tests-diagnosis" target="_blank">NIDDK HbA1c</a>,
          {' '}<a href="https://www.nhlbi.nih.gov/health/blood-cholesterol/diagnosis" target="_blank">NHLBI cholesterol</a>,
          {' '}<a href="https://www.accessdata.fda.gov/drugsatfda_docs/label/2024/215256s011lbl.pdf" target="_blank">FDA semaglutide label</a>.
        </p>
      </section>
    </div>
  )
}

function numberFrom(row: CsvRow, keys: string[]) {
  const raw = keys.map((key) => row[key]).find((value) => value !== undefined)
  return raw === undefined || raw === '' ? Number.NaN : Number(String(raw).replace(/,/g, ''))
}

function normalizeCsvDate(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (match) return match[0]
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function Safety({ icon: Icon, title, text, tone = '' }: { icon: typeof HeartPulse; title: string; text: string; tone?: string }) {
  return <article className={`safety-card ${tone}`}><Icon size={21} /><div><h3>{title}</h3><p>{text}</p></div></article>
}
