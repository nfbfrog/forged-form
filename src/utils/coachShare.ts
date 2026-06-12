import { db } from '../db'
import { habitKeys, type DailyLog, type ExerciseEntry, type Settings, type WeeklyMetric } from '../types'
import { friendlyDate, localDateKey, parseLocalDate } from './date'

export type CoachShareOptions = {
  days: number
  includeNotes: boolean
  includeSymptoms: boolean
}

type CoachSharePayload = {
  generatedAt: string
  range: {
    start: string
    end: string
    days: number
  }
  settings: Settings | null
  dailyLogs: DailyLog[]
  weeklyMetrics: WeeklyMetric[]
  exerciseEntries: ExerciseEntry[]
}

export async function buildCoachSharePayload(options: CoachShareOptions): Promise<CoachSharePayload> {
  const end = localDateKey()
  const startDate = parseLocalDate(end)
  startDate.setDate(startDate.getDate() - options.days + 1)
  const start = localDateKey(startDate)

  const [settings, dailyLogs, weeklyMetrics, exerciseEntries] = await Promise.all([
    db.settings.get('primary'),
    db.dailyLogs.where('date').between(start, end, true, true).toArray(),
    db.weeklyMetrics.toArray(),
    db.exerciseEntries.where('date').between(start, end, true, true).toArray(),
  ])

  return {
    generatedAt: new Date().toISOString(),
    range: { start, end, days: options.days },
    settings: settings ?? null,
    dailyLogs: dailyLogs
      .map((log) => sanitizeDailyLog(log, options))
      .sort((a, b) => a.date.localeCompare(b.date)),
    weeklyMetrics: weeklyMetrics
      .filter((metric) => metric.weekStart >= start && metric.weekStart <= end)
      .sort((a, b) => a.weekStart.localeCompare(b.weekStart)),
    exerciseEntries: exerciseEntries.sort((a, b) => a.date.localeCompare(b.date)),
  }
}

export function formatCoachShareSummary(payload: CoachSharePayload) {
  const { dailyLogs, exerciseEntries, weeklyMetrics, settings, range } = payload
  const loggedDays = dailyLogs.length
  const proteinTarget = settings?.proteinTarget ?? 140
  const proteinAverage = average(dailyLogs.map((log) => log.protein))
  const calorieAverage = average(dailyLogs.map((log) => log.calories).filter((value) => value > 0))
  const proteinHits = dailyLogs.filter((log) => log.protein >= proteinTarget).length
  const habitRates = habitKeys.map((key) => {
    const complete = dailyLogs.filter((log) => log.habits[key]).length
    return `${labelHabit(key)}: ${loggedDays ? Math.round((complete / loggedDays) * 100) : 0}%`
  })
  const latestMetric = weeklyMetrics.at(-1)
  const symptomList = topSymptoms(dailyLogs)
  const noteList = dailyLogs.filter((log) => log.note.trim()).map((log) => `${log.date}: ${log.note.trim()}`)
  const sessions = new Set(exerciseEntries.map((entry) => `${entry.date}-${entry.sessionId}`)).size

  return [
    'FormForge Coach Summary',
    `${friendlyDate(range.start)} - ${friendlyDate(range.end)}`,
    '',
    `Days logged: ${loggedDays}/${range.days}`,
    `Protein: ${proteinAverage ? `${proteinAverage}g avg` : 'no protein data'} (${proteinHits}/${loggedDays || 0} days at or above ${proteinTarget}g)`,
    `Calories: ${calorieAverage ? `${calorieAverage} kcal avg` : 'not enough calorie data'}`,
    `Training sessions logged: ${sessions}`,
    `Workout sets logged: ${exerciseEntries.length}`,
    '',
    'Habit completion:',
    ...habitRates.map((item) => `- ${item}`),
    '',
    'Body signals:',
    `- Appetite avg: ${average(dailyLogs.map((log) => log.appetite)) || 'n/a'}/5`,
    `- Energy avg: ${average(dailyLogs.map((log) => log.energy)) || 'n/a'}/5`,
    `- Nausea avg: ${average(dailyLogs.map((log) => log.nausea)) || 'n/a'}/3`,
    symptomList.length ? `- Symptom tags: ${symptomList.join(', ')}` : '- Symptom tags: not included or none logged',
    '',
    'Latest weekly check-in:',
    latestMetric ? formatWeeklyMetric(latestMetric) : '- No weekly check-in in this range',
    '',
    noteList.length ? 'Notes:' : '',
    ...noteList.map((item) => `- ${item}`),
    '',
    'Privacy note: this summary was generated locally. The user chooses what to copy, download, or send.',
  ].filter(Boolean).join('\n')
}

export async function copyCoachSummary(options: CoachShareOptions) {
  const payload = await buildCoachSharePayload(options)
  const summary = formatCoachShareSummary(payload)
  await navigator.clipboard.writeText(summary)
  return summary
}

export async function downloadCoachPacket(options: CoachShareOptions) {
  const payload = await buildCoachSharePayload(options)
  const summary = formatCoachShareSummary(payload)
  const packet = {
    ...payload,
    coachSummary: summary,
  }
  const blob = new Blob([JSON.stringify(packet, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `formforge-coach-packet-${payload.range.end}.json`
  anchor.click()
  URL.revokeObjectURL(url)
  return summary
}

function sanitizeDailyLog(log: DailyLog, options: CoachShareOptions): DailyLog {
  return {
    ...log,
    symptoms: options.includeSymptoms ? log.symptoms : [],
    note: options.includeNotes ? log.note : '',
  }
}

function average(values: number[]) {
  const usable = values.filter((value) => Number.isFinite(value))
  if (!usable.length) return 0
  return Math.round(usable.reduce((total, value) => total + value, 0) / usable.length)
}

function labelHabit(key: string) {
  if (key === 'movement') return 'lift/walk'
  return key
}

function topSymptoms(logs: DailyLog[]) {
  const counts = new Map<string, number>()
  for (const log of logs) {
    for (const symptom of log.symptoms) counts.set(symptom, (counts.get(symptom) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([symptom, count]) => `${symptom} (${count})`)
}

function formatWeeklyMetric(metric: WeeklyMetric) {
  const items = [
    `- Week of ${metric.weekStart}`,
    metric.weight ? `- Weight: ${metric.weight}` : '',
    metric.waist ? `- Waist: ${metric.waist}` : '',
    metric.systolic && metric.diastolic ? `- BP: ${metric.systolic}/${metric.diastolic}` : '',
    metric.restingPulse ? `- Resting pulse: ${metric.restingPulse}` : '',
    metric.bestLift ? `- Best lift: ${metric.bestLift}` : '',
    metric.photo ? '- Progress photo taken' : '',
  ]
  return items.filter(Boolean).join('\n')
}
