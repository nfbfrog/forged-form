import { describe, expect, it } from 'vitest'
import { localDateKey, startOfWeek, weekKeys } from './date'

describe('date utilities', () => {
  it('formats local dates without a UTC shift', () => {
    expect(localDateKey(new Date(2026, 5, 11))).toBe('2026-06-11')
  })

  it('starts the week on Monday', () => {
    expect(localDateKey(startOfWeek(new Date(2026, 5, 11)))).toBe('2026-06-08')
  })

  it('returns seven consecutive week keys', () => {
    expect(weekKeys(new Date(2026, 5, 11))).toEqual([
      '2026-06-08',
      '2026-06-09',
      '2026-06-10',
      '2026-06-11',
      '2026-06-12',
      '2026-06-13',
      '2026-06-14',
    ])
  })
})
