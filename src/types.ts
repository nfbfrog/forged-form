export const habitKeys = ['protein', 'movement', 'steps', 'water', 'sleep'] as const
export type HabitKey = (typeof habitKeys)[number]

export type DailyLog = {
  date: string
  protein: number
  calories: number
  /** Individual protein additions logged today, used to count meals that clear the per-meal floor. */
  proteinEntries?: number[]
  habits: Record<HabitKey, boolean>
  appetite: number
  energy: number
  nausea: number
  cycleContext: 'period' | 'follicular' | 'ovulation' | 'luteal' | 'peri-meno' | 'none'
  symptoms: string[]
  note: string
  imported?: boolean
}

export type WeeklyMetric = {
  weekStart: string
  weight?: number
  waist?: number
  systolic?: number
  diastolic?: number
  restingPulse?: number
  photo: boolean
  bestLift: string
  sessions: Record<string, boolean>
}

export type ExerciseEntry = {
  id?: number
  date: string
  sessionId: string
  exerciseId: string
  weight: number
  reps: number
}

export type LabResult = {
  id?: number
  date: string
  marker: string
  value: number
  unit: string
  note?: string
}

export type ThemePreference = 'system' | 'light' | 'dark'

export type Settings = {
  id: 'primary'
  proteinTarget: number
  calorieTarget: number
  waterTarget: number
  stepTarget: number
  sleepTarget: number
  lifeStage: 'cycling' | 'perimenopause' | 'postmenopause' | 'other'
  metabolicSupport: boolean
  hormoneSupport: boolean
  theme?: ThemePreference
  onboardingComplete?: boolean
  bodyWeightLb?: number
  proteinPerKg?: number
}

export type ScreenId = 'today' | 'week' | 'plan' | 'training' | 'health' | 'learn'

export const emptyHabits = (): Record<HabitKey, boolean> => ({
  protein: false,
  movement: false,
  steps: false,
  water: false,
  sleep: false,
})

export const createDailyLog = (date: string): DailyLog => ({
  date,
  protein: 0,
  calories: 0,
  proteinEntries: [],
  habits: emptyHabits(),
  appetite: 3,
  energy: 3,
  nausea: 0,
  cycleContext: 'none',
  symptoms: [],
  note: '',
})

export const defaultSettings: Settings = {
  id: 'primary',
  proteinTarget: 140,
  calorieTarget: 1800,
  waterTarget: 80,
  stepTarget: 8000,
  sleepTarget: 7.5,
  lifeStage: 'cycling',
  metabolicSupport: false,
  hormoneSupport: false,
  theme: 'system',
  onboardingComplete: false,
}
