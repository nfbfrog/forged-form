import { describe, expect, it } from 'vitest'
import { topSymptomPattern } from './patterns'
import { createDailyLog, type DailyLog } from '../types'

function log(date: string, cycleContext: DailyLog['cycleContext'], symptoms: string[]): DailyLog {
  return { ...createDailyLog(date), cycleContext, symptoms }
}

describe('topSymptomPattern', () => {
  it('returns null below the minimum count', () => {
    expect(topSymptomPattern([log('2026-06-01', 'luteal', ['Headache'])])).toBeNull()
  })

  it('returns the most-logged symptom once it passes the threshold', () => {
    const logs = [
      log('2026-06-01', 'none', ['Bloat']),
      log('2026-06-02', 'none', ['Bloat']),
      log('2026-06-03', 'none', ['Bloat']),
    ]
    const result = topSymptomPattern(logs)
    expect(result?.symptom).toBe('Bloat')
    expect(result?.count).toBe(3)
    expect(result?.context).toBeUndefined()
  })

  it('flags a cycle-context cluster when the majority share one phase', () => {
    const logs = [
      log('2026-06-01', 'luteal', ['Headache']),
      log('2026-06-02', 'luteal', ['Headache']),
      log('2026-06-03', 'luteal', ['Headache']),
      log('2026-06-04', 'follicular', ['Headache']),
    ]
    const result = topSymptomPattern(logs)
    expect(result?.symptom).toBe('Headache')
    expect(result?.count).toBe(4)
    expect(result?.context).toBe('luteal')
    expect(result?.contextCount).toBe(3)
  })

  it('does not invent a cluster when occurrences are spread across phases', () => {
    const logs = [
      log('2026-06-01', 'luteal', ['Cramps']),
      log('2026-06-02', 'follicular', ['Cramps']),
      log('2026-06-03', 'ovulation', ['Cramps']),
    ]
    const result = topSymptomPattern(logs)
    expect(result?.symptom).toBe('Cramps')
    expect(result?.context).toBeUndefined()
  })
})
