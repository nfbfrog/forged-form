import type { ComponentType } from 'react'
import { Check } from 'lucide-react'

const SIZE = 64
const STROKE = 5
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

type IconComponent = ComponentType<{ size?: number; strokeWidth?: number }>

export type AnchorRingItem = {
  key: string
  label: string
  icon: IconComponent
  /** 0..1 — binary anchors pass 0 or 1, protein passes its real fraction. */
  progress: number
  complete: boolean
  /** Small readout under the label, e.g. "92g". */
  detail?: string
  /** When present the ring is a toggle button; otherwise it is a readout. */
  onToggle?: () => void
}

function Ring({ progress, complete, icon: Icon }: { progress: number; complete: boolean; icon: IconComponent }) {
  const clamped = Math.max(0, Math.min(1, progress))
  return (
    <span className="ring" aria-hidden="true">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE}>
        <circle className="ring-track" cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} strokeWidth={STROKE} />
        <circle
          className="ring-fill"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - clamped)}
          strokeLinecap="round"
        />
      </svg>
      <span className="ring-icon">{complete ? <Check size={19} strokeWidth={2.5} /> : <Icon size={18} />}</span>
    </span>
  )
}

export function AnchorRings({ items, celebrate }: { items: AnchorRingItem[]; celebrate?: boolean }) {
  return (
    <div className={`anchor-rings ${celebrate ? 'celebrate' : ''}`} role="group" aria-label="Daily anchors">
      {items.map((item) => {
        const body = (
          <>
            <Ring progress={item.progress} complete={item.complete} icon={item.icon} />
            <span className="ring-label">{item.label}</span>
            {item.detail ? <span className="ring-detail">{item.detail}</span> : null}
          </>
        )
        if (item.onToggle) {
          return (
            <button
              key={item.key}
              type="button"
              className={`anchor-ring ${item.complete ? 'complete' : ''}`}
              onClick={item.onToggle}
              aria-pressed={item.complete}
              aria-label={`${item.label}${item.complete ? ', done' : ''}`}
            >
              {body}
            </button>
          )
        }
        return (
          <div
            key={item.key}
            className={`anchor-ring readout ${item.complete ? 'complete' : ''}`}
            role="img"
            aria-label={`${item.label}: ${item.detail ?? (item.complete ? 'done' : 'not yet')}`}
          >
            {body}
          </div>
        )
      })}
    </div>
  )
}
