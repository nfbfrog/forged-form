import { useEffect, useState, type ReactNode } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  Activity,
  Apple,
  BookOpen,
  CalendarDays,
  Dumbbell,
  HeartPulse,
  Settings as SettingsIcon,
  Sparkles,
} from 'lucide-react'
import { db, ensureSettings } from './db'
import { TodayScreen } from './screens/TodayScreen'
import { WeekScreen } from './screens/WeekScreen'
import { PlanScreen } from './screens/PlanScreen'
import { TrainingScreen } from './screens/TrainingScreen'
import { HealthScreen } from './screens/HealthScreen'
import { LearnScreen } from './screens/LearnScreen'
import { SettingsPanel } from './screens/SettingsPanel'
import { Onboarding } from './components/Onboarding'
import { applyTheme, resolveTheme } from './utils/theme'
import type { ScreenId } from './types'

const screens: Array<{
  id: ScreenId
  label: string
  eyebrow: string
  title: string
  icon: typeof Activity
}> = [
  { id: 'today', label: 'Today', eyebrow: 'Daily dashboard', title: 'Today', icon: Activity },
  { id: 'week', label: 'Week', eyebrow: 'Seven-day view', title: 'See the pattern.', icon: CalendarDays },
  { id: 'plan', label: 'Plan', eyebrow: 'Food framework', title: 'Eat without re-deciding.', icon: Apple },
  { id: 'training', label: 'Training', eyebrow: 'Strength plan', title: 'Build, log, progress.', icon: Dumbbell },
  { id: 'health', label: 'Health', eyebrow: 'Vitals + records', title: 'Track the signals.', icon: HeartPulse },
  { id: 'learn', label: 'Learn', eyebrow: 'Women\'s health library', title: 'Understand the signals.', icon: BookOpen },
]

function Screen({ id }: { id: ScreenId }) {
  if (id === 'today') return <TodayScreen />
  if (id === 'week') return <WeekScreen />
  if (id === 'plan') return <PlanScreen />
  if (id === 'training') return <TrainingScreen />
  if (id === 'health') return <HealthScreen />
  return <LearnScreen />
}

function NavButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean
  icon: typeof Activity
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={`nav-button ${active ? 'active' : ''}`}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      title={label}
    >
      <Icon size={19} strokeWidth={2} />
      <span>{label}</span>
    </button>
  )
}

export function SectionHeading({
  title,
  detail,
  action,
}: {
  title: string
  detail?: string
  action?: ReactNode
}) {
  return (
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
        {detail ? <p>{detail}</p> : null}
      </div>
      {action}
    </div>
  )
}

function App() {
  const [active, setActive] = useState<ScreenId>('today')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settings = useLiveQuery(() => db.settings.get('primary'), [])
  const current = screens.find((screen) => screen.id === active) ?? screens[0]

  useEffect(() => {
    void ensureSettings()
  }, [])

  useEffect(() => {
    document.title = 'FormForge'
  }, [])

  const themePreference = settings?.theme ?? 'system'

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const update = () => applyTheme(resolveTheme(themePreference, media.matches))
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [themePreference])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [active])

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark"><Sparkles size={18} /></span>
          <div>
            <strong>FormForge</strong>
            <span>private by design</span>
          </div>
        </div>
        <nav className="desktop-nav" aria-label="Main navigation">
          {screens.map((screen) => (
            <NavButton
              key={screen.id}
              active={active === screen.id}
              icon={screen.icon}
              label={screen.label}
              onClick={() => setActive(screen.id)}
            />
          ))}
        </nav>
        <div className="privacy-note">
          <span className="status-dot" />
          Stored on this device
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <span className="eyebrow">{current.eyebrow}</span>
            <h1>{current.title}</h1>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={() => setSettingsOpen(true)}
            title="Plan settings"
            aria-label="Open plan settings"
          >
            <SettingsIcon size={20} />
          </button>
        </header>

        <div className="screen">
          <Screen id={active} />
        </div>
      </main>

      <nav className="mobile-nav" aria-label="Main navigation">
        {screens.map((screen) => (
          <NavButton
            key={screen.id}
            active={active === screen.id}
            icon={screen.icon}
            label={screen.label}
            onClick={() => setActive(screen.id)}
          />
        ))}
      </nav>

      {settingsOpen && settings ? (
        <SettingsPanel settings={settings} onClose={() => setSettingsOpen(false)} />
      ) : null}

      {settings && settings.onboardingComplete === false ? <Onboarding settings={settings} /> : null}
    </div>
  )
}

export default App
