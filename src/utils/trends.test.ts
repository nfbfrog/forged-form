import { describe, expect, it } from 'vitest'
import { formatRate, weeklyRate } from './trends'

describe('weeklyRate', () => {
  it('returns the per-week change between consecutive weeks', () => {
    expect(weeklyRate([
      { weekStart: '2026-06-01', value: 150 },
      { weekStart: '2026-06-08', value: 149 },
    ])).toBe(-1)
  })

  it('averages across gaps in check-ins', () => {
    expect(weeklyRate([
      { weekStart: '2026-05-11', value: 152 },
      { weekStart: '2026-06-08', value: 148 },
    ])).toBe(-1)
  })

  it('needs at least two points', () => {
    expect(weeklyRate([{ weekStart: '2026-06-08', value: 150 }])).toBeNull()
    expect(weeklyRate([])).toBeNull()
  })
})

describe('formatRate', () => {
  it('formats signed weekly rates', () => {
    expect(formatRate(-0.42, 'lb')).toBe('-0.4 lb/wk')
    expect(formatRate(0.5, 'in')).toBe('+0.5 in/wk')
  })

  it('reads tiny rates as steady', () => {
    expect(formatRate(0.01, 'lb')).toBe('holding steady')
  })

  it('is empty without a rate', () => {
    expect(formatRate(null, 'lb')).toBe('')
  })
})
