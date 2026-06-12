import { db } from '../db'
import { labMarkers } from '../data'
import { classifyFerritin } from './health'
import { topSymptomPattern, type SymptomPattern } from './patterns'
import { friendlyDate, localDateKey, parseLocalDate } from './date'
import type { Settings } from '../types'

export type VisitLab = {
  label: string
  value: number
  unit: string
  date: string
  trend: 'up' | 'down' | 'flat' | null
  status?: string
}

export type VisitVitals = {
  weekStart: string
  weight?: number
  waist?: number
  systolic?: number
  diastolic?: number
  restingPulse?: number
}

export type VisitPrepData = {
  generatedAt: string
  lifeStage: Settings['lifeStage'] | null
  vitals: VisitVitals | null
  labs: VisitLab[]
  pattern: SymptomPattern | null
  questions: string[]
}

const lifeStageLabels: Record<Settings['lifeStage'], string> = {
  cycling: 'Cycling',
  perimenopause: 'Perimenopause',
  postmenopause: 'Postmenopause',
  other: 'Not specified',
}

export async function buildVisitPrep(questions: string[]): Promise<VisitPrepData> {
  const end = localDateKey()
  const patternStart = parseLocalDate(end)
  patternStart.setDate(patternStart.getDate() - 42)

  const [settings, labResults, metrics, recentLogs] = await Promise.all([
    db.settings.get('primary'),
    db.labResults.toArray(),
    db.weeklyMetrics.toArray(),
    db.dailyLogs.where('date').between(localDateKey(patternStart), end, true, true).toArray(),
  ])

  // Latest value per marker, with a trend arrow from the previous reading.
  const labs: VisitLab[] = labMarkers.flatMap((marker) => {
    const history = labResults.filter((r) => r.marker === marker.id).sort((a, b) => a.date.localeCompare(b.date))
    if (!history.length) return []
    const latest = history[history.length - 1]
    const prev = history[history.length - 2]
    const trend: VisitLab['trend'] = prev
      ? latest.value > prev.value ? 'up' : latest.value < prev.value ? 'down' : 'flat'
      : null
    return [{
      label: marker.label,
      value: latest.value,
      unit: marker.unit,
      date: latest.date,
      trend,
      status: marker.flagged ? classifyFerritin(latest.value)?.label : undefined,
    }]
  })

  const vitals = metrics
    .slice()
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
    .reverse()
    .find((m) => m.weight || m.waist || (m.systolic && m.diastolic) || m.restingPulse) ?? null

  return {
    generatedAt: new Date().toISOString(),
    lifeStage: settings?.lifeStage ?? null,
    vitals,
    labs,
    pattern: topSymptomPattern(recentLogs),
    questions,
  }
}

const trendArrow: Record<NonNullable<VisitLab['trend']>, string> = { up: '↑', down: '↓', flat: '→' }

export function formatVisitPrepText(data: VisitPrepData): string {
  const lines: string[] = ['Visit prep — Forged-Form', friendlyDate(data.generatedAt.slice(0, 10)), '']
  if (data.lifeStage) lines.push(`Life stage: ${lifeStageLabels[data.lifeStage]}`, '')

  if (data.vitals) {
    lines.push(`Latest vitals (week of ${friendlyDate(data.vitals.weekStart)}):`)
    if (data.vitals.weight) lines.push(`- Weight: ${data.vitals.weight} lb`)
    if (data.vitals.waist) lines.push(`- Waist: ${data.vitals.waist} in`)
    if (data.vitals.systolic && data.vitals.diastolic) lines.push(`- Blood pressure: ${data.vitals.systolic}/${data.vitals.diastolic} mmHg`)
    if (data.vitals.restingPulse) lines.push(`- Resting pulse: ${data.vitals.restingPulse} bpm`)
    lines.push('')
  }

  if (data.labs.length) {
    lines.push('Recent labs:')
    for (const lab of data.labs) {
      const arrow = lab.trend ? ` ${trendArrow[lab.trend]}` : ''
      const status = lab.status ? ` (${lab.status})` : ''
      lines.push(`- ${lab.label}: ${lab.value} ${lab.unit}${arrow} — ${friendlyDate(lab.date)}${status}`)
    }
    lines.push('')
  }

  if (data.pattern) {
    const ctx = data.pattern.context ? `, most often in ${data.pattern.context} logs (${data.pattern.contextCount}/${data.pattern.count})` : ''
    lines.push('Symptom pattern (last 6 weeks):', `- ${data.pattern.symptom}: ${data.pattern.count} days${ctx}`, '')
  }

  if (data.questions.length) {
    lines.push('Questions to ask:')
    for (const q of data.questions) lines.push(`- ${q}`)
    lines.push('')
  }

  lines.push('Generated locally on this device. Descriptive personal tracking, not a diagnosis.')
  return lines.join('\n')
}
