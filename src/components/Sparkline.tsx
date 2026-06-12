const WIDTH = 140
const HEIGHT = 40
const PAD = 4

export function Sparkline({ values, ariaLabel }: { values: number[]; ariaLabel: string }) {
  if (values.length < 2) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const points = values.map((value, index) => [
    PAD + (index * (WIDTH - 2 * PAD)) / (values.length - 1),
    HEIGHT - PAD - ((value - min) / range) * (HEIGHT - 2 * PAD),
  ])
  const [lastX, lastY] = points[points.length - 1]
  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="sparkline" role="img" aria-label={ariaLabel}>
      <polyline points={points.map((point) => point.join(',')).join(' ')} />
      <circle cx={lastX} cy={lastY} r="3" />
    </svg>
  )
}
