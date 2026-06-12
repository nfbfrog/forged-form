import type { DailyLog } from '../types'

const contextLabels: Record<DailyLog['cycleContext'], string> = {
  period: 'period',
  follicular: 'follicular',
  ovulation: 'ovulation',
  luteal: 'luteal',
  'peri-meno': 'peri/meno',
  none: '',
}

export type SymptomPattern = {
  symptom: string
  count: number
  /** Cycle context the symptom co-occurs with most, when that link is meaningful. */
  context?: string
  contextCount?: number
}

/**
 * Descriptive only: surfaces the most-logged symptom and whether it clusters in a cycle
 * context. This is the research-endorsed use of cycle data — noticing personal patterns
 * for clinician conversations — never a training prescription. Returns null below signal.
 */
export function topSymptomPattern(logs: DailyLog[], minCount = 3): SymptomPattern | null {
  const counts = new Map<string, number>()
  for (const log of logs) {
    for (const symptom of log.symptoms ?? []) counts.set(symptom, (counts.get(symptom) ?? 0) + 1)
  }
  if (counts.size === 0) return null

  const [symptom, count] = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]
  if (count < minCount) return null

  // Which cycle context does this symptom co-occur with most?
  const byContext = new Map<string, number>()
  for (const log of logs) {
    if (!log.symptoms?.includes(symptom)) continue
    const label = contextLabels[log.cycleContext]
    if (label) byContext.set(label, (byContext.get(label) ?? 0) + 1)
  }
  const top = [...byContext.entries()].sort((a, b) => b[1] - a[1])[0]
  // Only call it a cluster if the majority of occurrences share one context.
  if (top && top[1] >= Math.ceil(count / 2) && top[1] >= 2) {
    return { symptom, count, context: top[0], contextCount: top[1] }
  }
  return { symptom, count }
}
