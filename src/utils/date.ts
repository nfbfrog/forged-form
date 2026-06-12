export function localDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseLocalDate(key: string) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function startOfWeek(date = new Date()) {
  const result = new Date(date)
  const day = result.getDay()
  result.setDate(result.getDate() - (day === 0 ? 6 : day - 1))
  result.setHours(0, 0, 0, 0)
  return result
}

export function weekKeys(date = new Date()) {
  const monday = startOfWeek(date)
  return Array.from({ length: 7 }, (_, index) => {
    const current = new Date(monday)
    current.setDate(monday.getDate() + index)
    return localDateKey(current)
  })
}

export function friendlyDate(key: string, options?: Intl.DateTimeFormatOptions) {
  return parseLocalDate(key).toLocaleDateString(undefined, options ?? {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}
