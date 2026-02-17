import './HomePage.css'

function HomePage() {
  return (
    <div className="homepage">
      <header className="homepage__nav">
        <div className="homepage__brand">taskflow</div>
        <nav className="homepage__links" aria-label="Homepage navigation">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#about">About</a>
          <a href="#faq">FAQ</a>
        </nav>
      </header>

      <section className="homepage__hero">
        <h1 className="homepage__headline">
          Build Your
          <span className="homepage__headline-accent"> Beautiful</span>
          <br />
          <span className="homepage__headline-highlight">Task Manager</span>
          <span className="homepage__headline-squiggle"> faster</span>
        </h1>

        <p className="homepage__subtitle">
          Organize daily tasks, track deadlines, and keep your workflow clean
          with a lightweight dashboard built for students and builders.
        </p>

        <div className="homepage__actions">
          <button type="button" className="homepage__button homepage__button--primary">
            Start Planning
          </button>
          <button type="button" className="homepage__button homepage__button--ghost">
            See Demo
          </button>
        </div>

        <div className="homepage__badges">
          <div className="homepage__badge">
            <span className="homepage__badge-dot" />
            <span>Live deadline reminders</span>
          </div>
          <div className="homepage__badge">
            <span className="homepage__badge-dot" />
            <span>Daily focus views</span>
          </div>
          <div className="homepage__badge">
            <span className="homepage__badge-dot" />
            <span>Clean responsive dashboard</span>
          </div>
        </div>
      </section>

      <section className="homepage__lower" id="features">
        <div className="homepage__lower-inner">
          <div>
            <h2 className="homepage__lower-title">HELLO!</h2>
            <p className="homepage__lower-copy">
              Your task manager should feel calm and sharp, not cluttered.
              This layout gives you a high-contrast space to focus on what
              matters next.
            </p>
          </div>

          <aside className="homepage__menu" aria-label="Quick sections">
            <div className="homepage__menu-item">
              <span>Dashboard</span>
              <span>01</span>
            </div>
            <div className="homepage__menu-item">
              <span>Deadlines</span>
              <span>02</span>
            </div>
            <div className="homepage__menu-item">
              <span>Daily Planner</span>
              <span>03</span>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}

export default HomePage
