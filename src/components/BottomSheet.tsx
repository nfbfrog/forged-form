import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

export function BottomSheet({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="sheet-backdrop"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section className="bottom-sheet" role="dialog" aria-modal="true" aria-label={title}>
        <span className="sheet-grabber" aria-hidden="true" />
        <header className="sheet-header">
          <h2>{title}</h2>
          <button type="button" className="icon-button quiet" onClick={onClose} aria-label="Close" title="Close">
            <X size={18} />
          </button>
        </header>
        <div className="sheet-body">{children}</div>
      </section>
    </div>
  )
}
