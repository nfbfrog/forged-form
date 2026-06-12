import { useEffect, useState } from 'react'
import { localDateKey } from './date'

/**
 * Returns today's date key and re-renders when the day rolls over — so an app left
 * open past midnight (or backgrounded and resumed the next day) shows the correct day.
 */
export function useToday(): string {
  const [today, setToday] = useState(localDateKey())

  useEffect(() => {
    const sync = () => setToday((prev) => {
      const now = localDateKey()
      return prev === now ? prev : now
    })
    const interval = window.setInterval(sync, 60_000)
    document.addEventListener('visibilitychange', sync)
    window.addEventListener('focus', sync)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', sync)
      window.removeEventListener('focus', sync)
    }
  }, [])

  return today
}
