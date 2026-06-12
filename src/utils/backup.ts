import { z } from 'zod'
import { db } from '../db'

const habitSchema = z.object({
  protein: z.boolean(),
  movement: z.boolean(),
  steps: z.boolean(),
  water: z.boolean(),
  sleep: z.boolean(),
})

const backupSchema = z.object({
  version: z.union([z.literal(1), z.literal(2)]),
  exportedAt: z.string(),
  dailyLogs: z.array(z.object({
    date: z.string(),
    protein: z.number().nonnegative(),
    calories: z.number().nonnegative(),
    proteinEntries: z.array(z.number()).optional(),
    habits: habitSchema,
    appetite: z.number().min(1).max(5),
    energy: z.number().min(1).max(5),
    nausea: z.number().min(0).max(3),
    cycleContext: z.enum(['period', 'follicular', 'ovulation', 'luteal', 'peri-meno', 'none']).default('none'),
    symptoms: z.array(z.string()).default([]),
    note: z.string(),
    imported: z.boolean().optional(),
  })),
  weeklyMetrics: z.array(z.object({
    weekStart: z.string(),
    weight: z.number().optional(),
    waist: z.number().optional(),
    systolic: z.number().optional(),
    diastolic: z.number().optional(),
    restingPulse: z.number().optional(),
    photo: z.boolean(),
    bestLift: z.string(),
    sessions: z.record(z.string(), z.boolean()),
  })),
  exerciseEntries: z.array(z.object({
    id: z.number().optional(),
    date: z.string(),
    sessionId: z.string(),
    exerciseId: z.string(),
    weight: z.number().nonnegative(),
    reps: z.number().int().nonnegative(),
  })),
  labResults: z.array(z.object({
    id: z.number().optional(),
    date: z.string(),
    marker: z.string(),
    value: z.number(),
    unit: z.string(),
    note: z.string().optional(),
  })).default([]),
  settings: z.array(z.object({
    id: z.literal('primary'),
    proteinTarget: z.number().positive(),
    calorieTarget: z.number().positive(),
    waterTarget: z.number().positive(),
    stepTarget: z.number().positive(),
    sleepTarget: z.number().positive(),
    lifeStage: z.enum(['cycling', 'perimenopause', 'postmenopause', 'other']),
    metabolicSupport: z.boolean(),
    hormoneSupport: z.boolean(),
    // Preserve newer optional fields across export/restore.
    theme: z.enum(['system', 'light', 'dark']).optional(),
    onboardingComplete: z.boolean().optional(),
    bodyWeightLb: z.number().positive().optional(),
    proteinPerKg: z.number().positive().optional(),
  })),
})

export async function exportBackup() {
  const payload = {
    version: 2 as const,
    exportedAt: new Date().toISOString(),
    dailyLogs: await db.dailyLogs.toArray(),
    weeklyMetrics: await db.weeklyMetrics.toArray(),
    exerciseEntries: await db.exerciseEntries.toArray(),
    labResults: await db.labResults.toArray(),
    settings: await db.settings.toArray(),
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `recomp-rhythm-backup-${payload.exportedAt.slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

export async function importBackup(file: File) {
  const parsed = backupSchema.parse(JSON.parse(await file.text()))
  await db.transaction('rw', [db.dailyLogs, db.weeklyMetrics, db.exerciseEntries, db.labResults, db.settings], async () => {
    await Promise.all([
      db.dailyLogs.clear(),
      db.weeklyMetrics.clear(),
      db.exerciseEntries.clear(),
      db.labResults.clear(),
      db.settings.clear(),
    ])
    await db.dailyLogs.bulkPut(parsed.dailyLogs)
    await db.weeklyMetrics.bulkPut(parsed.weeklyMetrics)
    await db.exerciseEntries.bulkPut(parsed.exerciseEntries)
    await db.labResults.bulkPut(parsed.labResults)
    await db.settings.bulkPut(parsed.settings)
  })
}
