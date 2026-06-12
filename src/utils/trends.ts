import { parseLocalDate } from './date'

export type TrendPoint = { weekStart: string; value: number }

/** Per-week rate of change across the series, or null when there aren't two points. */
export function weeklyRate(points: TrendPoint[]): number | null {
  if (points.length < 2) return null
  const first = points[0]
  const last = points[points.length - 1]
  const weeks = (parseLocalDate(last.weekStart).getTime() - parseLocalDate(first.weekStart).getTime()) / (7 * 24 * 60 * 60 * 1000)
  if (weeks <= 0) return null
  return (last.value - first.value) / weeks
}

export function formatRate(rate: number | null, unit: string): string {
  if (rate === null) return ''
  const rounded = Math.round(rate * 10) / 10
  if (Math.abs(rounded) < 0.05) return 'holding steady'
  return `${rounded > 0 ? '+' : '-'}${Math.abs(rounded)} ${unit}/wk`
}
