import { db } from '../db'
import { getSupabase } from './supabase'

export type SyncResult = {
  dailyLogs: number
  weeklyMetrics: number
  exerciseEntries: number
  settings: boolean
}

export async function syncLocalToSupabase(userId: string): Promise<SyncResult> {
  const supabase = await getSupabase()
  if (!supabase) throw new Error('Supabase is not configured.')

  const [settings, dailyLogs, weeklyMetrics, exerciseEntries] = await Promise.all([
    db.settings.get('primary'),
    db.dailyLogs.toArray(),
    db.weeklyMetrics.toArray(),
    db.exerciseEntries.toArray(),
  ])

  if (settings) {
    const { error } = await supabase.from('settings').upsert({
      user_id: userId,
      protein_target: settings.proteinTarget,
      calorie_target: settings.calorieTarget,
      water_target: settings.waterTarget,
      step_target: settings.stepTarget,
      sleep_target: settings.sleepTarget,
      life_stage: settings.lifeStage,
      metabolic_support: settings.metabolicSupport,
      hormone_support: settings.hormoneSupport,
    })
    if (error) throw error
  }

  if (dailyLogs.length) {
    const { error } = await supabase.from('daily_logs').upsert(dailyLogs.map((log) => ({
      user_id: userId,
      log_date: log.date,
      protein: log.protein,
      calories: log.calories,
      habits: log.habits,
      appetite: log.appetite,
      energy: log.energy,
      nausea: log.nausea,
      cycle_context: log.cycleContext,
      symptoms: log.symptoms,
      note: log.note,
      imported: log.imported ?? false,
    })), { onConflict: 'user_id,log_date' })
    if (error) throw error
  }

  if (weeklyMetrics.length) {
    const { error } = await supabase.from('weekly_metrics').upsert(weeklyMetrics.map((metric) => ({
      user_id: userId,
      week_start: metric.weekStart,
      weight: metric.weight ?? null,
      waist: metric.waist ?? null,
      systolic: metric.systolic ?? null,
      diastolic: metric.diastolic ?? null,
      resting_pulse: metric.restingPulse ?? null,
      photo: metric.photo,
      best_lift: metric.bestLift,
      sessions: metric.sessions,
    })), { onConflict: 'user_id,week_start' })
    if (error) throw error
  }

  if (exerciseEntries.length) {
    const { error } = await supabase.from('exercise_entries').upsert(exerciseEntries.map((entry) => ({
      user_id: userId,
      client_id: String(entry.id ?? `${entry.date}-${entry.sessionId}-${entry.exerciseId}-${entry.weight}-${entry.reps}`),
      entry_date: entry.date,
      session_id: entry.sessionId,
      exercise_id: entry.exerciseId,
      weight: entry.weight,
      reps: entry.reps,
    })), { onConflict: 'user_id,client_id' })
    if (error) throw error
  }

  return {
    dailyLogs: dailyLogs.length,
    weeklyMetrics: weeklyMetrics.length,
    exerciseEntries: exerciseEntries.length,
    settings: Boolean(settings),
  }
}
