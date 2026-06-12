import { describe, expect, it } from 'vitest'
import { resolveTheme } from './theme'

describe('resolveTheme', () => {
  it('honors an explicit light or dark preference regardless of the system', () => {
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
  })

  it('follows the system when the preference is system', () => {
    expect(resolveTheme('system', true)).toBe('dark')
    expect(resolveTheme('system', false)).toBe('light')
  })

  it('treats a missing preference as system', () => {
    expect(resolveTheme(undefined, true)).toBe('dark')
    expect(resolveTheme(undefined, false)).toBe('light')
  })
})
