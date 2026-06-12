export type BpStatus = {
  label: string
  tone: 'good' | 'watch' | 'urgent'
  detail: string
}

export function classifyBloodPressure(systolic?: number, diastolic?: number): BpStatus | null {
  if (!systolic || !diastolic) return null
  if (systolic > 180 || diastolic > 120) {
    return {
      label: 'Crisis range',
      tone: 'urgent',
      detail: 'Repeat after one minute. If still this high, contact a clinician immediately; with symptoms, call 911.',
    }
  }
  if (systolic >= 140 || diastolic >= 90) {
    return {
      label: 'Stage 2 range',
      tone: 'watch',
      detail: 'Confirm with repeat home readings and review with your clinician.',
    }
  }
  if (systolic >= 130 || diastolic >= 80) {
    return {
      label: 'Stage 1 range',
      tone: 'watch',
      detail: 'Watch the trend and tighten sleep, sodium, stress, and follow-up.',
    }
  }
  if (systolic >= 120 && diastolic < 80) {
    return {
      label: 'Elevated',
      tone: 'watch',
      detail: 'Not an emergency, but worth trending consistently.',
    }
  }
  return {
    label: 'Normal range',
    tone: 'good',
    detail: 'Keep tracking under the same conditions.',
  }
}

export function weightLossStatus(current?: number, previous?: number): BpStatus | null {
  if (!current || !previous) return null
  const change = previous - current
  if (change > 2) {
    return {
      label: `${change.toFixed(1)} lb down`,
      tone: 'watch',
      detail: 'Faster than the usual 1-2 lb/week guardrail. Check protein, hydration, strength, and symptoms.',
    }
  }
  if (change >= 0.5) {
    return {
      label: `${change.toFixed(1)} lb down`,
      tone: 'good',
      detail: 'Within a controlled weekly pace if energy and training are holding.',
    }
  }
  if (change < -1) {
    return {
      label: `${Math.abs(change).toFixed(1)} lb up`,
      tone: 'watch',
      detail: 'One week can be water, cycle timing, sodium, or digestion. Compare the trend.',
    }
  }
  return {
    label: 'Stable',
    tone: 'good',
    detail: 'Body weight is quiet this week. Look at waist, photos, lifts, and adherence too.',
  }
}
