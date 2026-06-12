import { useState } from 'react'
import { ArrowLeftRight, Check, CookingPot, GlassWater, Leaf, Plus, Zap } from 'lucide-react'
import { menus } from '../data'
import { SectionHeading } from '../App'
import { db, getOrCreateDailyLog } from '../db'
import { localDateKey } from '../utils/date'
import { haptics } from '../utils/haptics'

export function PlanScreen() {
  const [logged, setLogged] = useState<string | null>(null)

  async function logMeal(name: string, protein: number) {
    const date = localDateKey()
    const current = await getOrCreateDailyLog(date)
    const target = (await db.settings.get('primary'))?.proteinTarget ?? 140
    const total = current.protein + protein
    await db.dailyLogs.put({
      ...current,
      protein: total,
      proteinEntries: [...(current.proteinEntries ?? []), protein],
      habits: { ...current.habits, protein: total >= target },
    })
    haptics.tick()
    setLogged(name)
    window.setTimeout(() => setLogged((prev) => (prev === name ? null : prev)), 1800)
  }

  return (
    <div className="content-stack">
      <section>
        <SectionHeading title="Two-menu rotation" detail="Gram weights make the plan repeatable. Tap Log to add a meal's protein to today." />
        <div className="menu-grid">
          {menus.map((menu) => (
            <article className="menu-card" key={menu.id}>
              <header>
                <span>{menu.label}</span>
                <small>{menu.summary}</small>
              </header>
              <div>
                {menu.meals.map((meal, index) => (
                  <div className="meal-row" key={meal.name}>
                    <span className="meal-number">{index + 1}</span>
                    <p><strong>{meal.name}</strong><small>{meal.amount}</small></p>
                    <b>{meal.protein}g</b>
                    <button
                      type="button"
                      className={`meal-log ${logged === meal.name ? 'done' : ''}`}
                      onClick={() => void logMeal(meal.name, meal.protein)}
                      aria-label={`Log ${meal.name}, ${meal.protein} grams protein`}
                    >
                      {logged === meal.name ? <><Check size={14} /> Logged</> : <><Plus size={14} /> Log</>}
                    </button>
                  </div>
                ))}
              </div>
              <footer>{menu.meals.reduce((total, meal) => total + meal.protein, 0)}g planned protein</footer>
            </article>
          ))}
        </div>
      </section>

      <section>
        <SectionHeading title="House rules" detail="Use these to keep the plan flexible without rebuilding it." />
        <div className="rule-list">
          <Rule icon={ArrowLeftRight} title="Swap protein 1:1" text="Keep the cooked portion and protein grams close. Chicken, turkey, fish, lean beef, tofu, or an equivalent you tolerate." />
          <Rule icon={Zap} title="Fuel training" text="Add a carb portion around harder sessions when performance or recovery is sliding. Your weekly trend matters more than one day." />
          <Rule icon={GlassWater} title="Low-appetite fallback" text="Use a shake or smooth meal when solid food is difficult. Repeated inability to eat or drink needs prescriber input." />
          <Rule icon={Leaf} title="Fiber earns a place" text="Include produce at three or more meals and increase fiber gradually with enough fluid." />
          <Rule icon={CookingPot} title="Prep the friction away" text="Cook two proteins, one starch, and a tray of vegetables twice weekly. Assemble meals instead of starting from zero." />
        </div>
      </section>
    </div>
  )
}

function Rule({ icon: Icon, title, text }: { icon: typeof Leaf; title: string; text: string }) {
  return (
    <article className="rule">
      <span><Icon size={19} /></span>
      <div><h3>{title}</h3><p>{text}</p></div>
    </article>
  )
}
