function vibrate(pattern: number | number[]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern)
    } catch {
      // Some browsers expose vibrate but block it; logging still succeeded.
    }
  }
}

export const haptics = {
  /** Short tick for a routine log action. */
  tick: () => vibrate(10),
  /** Double pulse for hitting a daily target. */
  success: () => vibrate([12, 70, 12]),
}
