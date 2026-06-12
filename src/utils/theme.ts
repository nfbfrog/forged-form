import type { ThemePreference } from '../types'

export type ResolvedTheme = 'light' | 'dark'

export function resolveTheme(preference: ThemePreference | undefined, systemDark: boolean): ResolvedTheme {
  if (preference === 'light' || preference === 'dark') return preference
  return systemDark ? 'dark' : 'light'
}

const browserChromeColor: Record<ResolvedTheme, string> = {
  light: '#f7f5ef',
  dark: '#121817',
}

export function applyTheme(theme: ResolvedTheme) {
  document.documentElement.dataset.theme = theme
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', browserChromeColor[theme])
}
