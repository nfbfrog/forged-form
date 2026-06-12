import Dexie, { type EntityTable } from 'dexie'
import {
  createDailyLog,
  defaultSettings,
  type DailyLog,
  type ExerciseEntry,
  type Settings,
  type WeeklyMetric,
} from './types'

class RhythmDatabase extends Dexie {
  dailyLogs!: EntityTable<DailyLog, 'date'>
  weeklyMetrics!: EntityTable<WeeklyMetric, 'weekStart'>
  exerciseEntries!: EntityTable<ExerciseEntry, 'id'>
  settings!: EntityTable<Settings, 'id'>

  constructor() {
    super('recomp-rhythm')
    this.version(1).stores({
      dailyLogs: 'date',
      weeklyMetrics: 'weekStart',
      exerciseEntries: '++id,date,sessionId,exerciseId',
      settings: 'id',
    })
    this.version(2).stores({
      dailyLogs: 'date',
      weeklyMetrics: 'weekStart',
      exerciseEntries: '++id,date,sessionId,exerciseId,[date+sessionId]',
      settings: 'id',
    })
  }
}

export const db = new RhythmDatabase()

export async function ensureSettings() {
  const current = await db.settings.get('primary')
  if (!current) {
    await db.settings.put(defaultSettings)
  } else if (current.onboardingComplete === undefined) {
    // Settings that predate onboarding belong to an established device — don't replay the intro.
    await db.settings.put({ ...current, theme: current.theme ?? 'system', onboardingComplete: true })
  }
}

export async function getOrCreateDailyLog(date: string) {
  return (await db.dailyLogs.get(date)) ?? createDailyLog(date)
}
