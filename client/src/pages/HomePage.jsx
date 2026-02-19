import './HomePage.css'
import { FloatingNav } from '../compoenets/FloatingNav.jsx'
import TextGenerateEffect from '../compoenets/TextGenerateEffect.jsx'

function HomePage() {
  const navItems = [{ name: 'Home', link: '/' }]
  const badges = [
    'Live deadline reminders',
    'Daily focus views',
    'Clean responsive dashboard with graphs',
  ]
  const menuItems = ['Dashboard', 'Deadlines', 'Daily Planner']

  return (
    <div className="homepage">
      <FloatingNav navItems={navItems} />

      <section className="homepage__hero">
        <h1 className="homepage__headline homepage__fade-in-up">
          Build Your
          <span className="homepage__headline-accent">
            <TextGenerateEffect
              words="Beautiful"
              className="homepage__beautiful-generate"
              duration={0.55}
              stagger={0.2}
            />
          </span>
          <br />
          <span className="homepage__headline-highlight">Task Manager</span>
          <span className="homepage__headline-squiggle"> faster</span>
        </h1>

        <p className="homepage__subtitle homepage__fade-in-up homepage__fade-in-up--delay-1">
          Organize daily tasks, track deadlines, and keep your workflow clean
          with a lightweight dashboard built for students and builders.
        </p>

        <div className="homepage__actions homepage__fade-in-up homepage__fade-in-up--delay-2">
          <button type="button" className="homepage__button homepage__button--primary">
            Start Planning
          </button>
        </div>

        <div className="homepage__badges homepage__fade-in-up homepage__fade-in-up--delay-3">
          {badges.map((label, idx) => (
            <div
              key={label}
              className="homepage__badge"
              style={{ '--badge-delay': `${0.2 + idx * 0.1}s` }}
            >
              <span className="homepage__badge-dot" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="homepage__lower" id="features">
        <div className="homepage__lower-inner">
          <div className="homepage__fade-in-up homepage__fade-in-up--delay-1">
            <h2 className="homepage__lower-title homepage__float-slow">HELLO!</h2>
            <p className="homepage__lower-copy">
              Your task manager should feel calm and sharp, not cluttered.
              This layout gives you a high-contrast space to focus on what
              matters next.
            </p>
          </div>

          <aside
            className="homepage__menu homepage__fade-in-up homepage__fade-in-up--delay-2"
            aria-label="Quick sections"
          >
            {menuItems.map((item, idx) => (
              <div
                key={item}
                className="homepage__menu-item"
                style={{ '--menu-delay': `${0.35 + idx * 0.1}s` }}
              >
                <span>{item}</span>
                <span>{String(idx + 1).padStart(2, '0')}</span>
              </div>
            ))}
          </aside>
        </div>
      </section>
    </div>
  )
}

export default HomePage
