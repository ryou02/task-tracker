import './DashboardPage.css'

const dayCards = [
  {
    day: 'Monday',
    date: '22.01.2026',
    progress: 67,
    tasks: [
      { name: 'Outline project plan', done: true },
      { name: 'Read mat136 notes', done: true },
      { name: 'Reply to team messages', done: false },
      { name: 'Gym workout', done: true },
      { name: 'Budget update', done: false },
    ],
  },
  {
    day: 'Tuesday',
    date: '23.01.2026',
    progress: 83,
    tasks: [
      { name: 'Finish weekly slides', done: true },
      { name: 'Buy groceries', done: true },
      { name: 'Deep clean desk', done: false },
      { name: 'Wake up at 6:00', done: true },
      { name: 'Read 20 pages', done: true },
    ],
  },
  {
    day: 'Wednesday',
    date: '24.01.2026',
    progress: 92,
    tasks: [
      { name: 'Film content clip', done: true },
      { name: 'Water plants', done: true },
      { name: 'Quiz revision', done: true },
      { name: 'Cold shower', done: true },
      { name: 'Cook healthy meal', done: false },
    ],
  },
  {
    day: 'Thursday',
    date: '25.01.2026',
    progress: 100,
    tasks: [
      { name: 'Check email inbox', done: true },
      { name: 'Review financial report', done: true },
      { name: 'Team call', done: true },
      { name: 'Read before bed', done: true },
      { name: 'Journal notes', done: true },
    ],
  },
  {
    day: 'Friday',
    date: '26.01.2026',
    progress: 92,
    tasks: [
      { name: 'Prep for deadlines', done: true },
      { name: 'Daily planner review', done: true },
      { name: 'Code session', done: true },
      { name: 'Social detox', done: false },
      { name: 'Weekly reset', done: true },
    ],
  },
]

const upcomingTasks = [
  { name: 'MAT136 Webwork Set 5', subject: 'mat136', due: 'Sunday, Feb 22', daysLeft: 5 },
  { name: 'SOC100 Quiz', subject: 'soc100', due: 'Monday, Feb 23', daysLeft: 6 },
  { name: 'MAT223 CAP', subject: 'mat223', due: 'Monday, Feb 23', daysLeft: 6 },
  { name: 'AI internship application', subject: 'other', due: 'Tuesday, Feb 24', daysLeft: 7 },
]

function daysLeftClass(daysLeft) {
  if (daysLeft <= 7) return 'dashboard-days-cell--urgent'
  if (daysLeft <= 14) return 'dashboard-days-cell--soon'
  return 'dashboard-days-cell--later'
}

function DashboardPage() {
  return (
    <main className="dashboard-page">
      <section className="dashboard-header">
        <p className="dashboard-header__eyebrow">Overview</p>
        <h1 className="dashboard-header__title">
          Weekly
          <span className="dashboard-header__accent"> dashboard</span>
        </h1>
        <p className="dashboard-header__subtitle">
          Review your daily completion rates, keep your priorities visible, and
          stay ahead of your upcoming deadlines.
        </p>
      </section>

      <section className="dashboard-cards" aria-label="Daily summary cards">
        {dayCards.map((card) => {
          const completed = card.tasks.filter((task) => task.done).length
          const notCompleted = card.tasks.length - completed

          return (
            <article key={card.day} className="dashboard-card">
              <header className="dashboard-card__head">
                <h2>{card.day}</h2>
                <p>{card.date}</p>
              </header>

              <div className="dashboard-card__progress-wrap">
                <div
                  className="dashboard-ring"
                  style={{
                    background: `conic-gradient(#c86f45 ${card.progress}%, #ded6c8 ${card.progress}% 100%)`,
                  }}
                >
                  <div className="dashboard-ring__inner">{card.progress}%</div>
                </div>
              </div>

              <h3 className="dashboard-card__tasks-title">Tasks</h3>
              <ul className="dashboard-card__tasks">
                {card.tasks.map((task) => (
                  <li key={task.name}>
                    <span className={`dashboard-check ${task.done ? 'dashboard-check--done' : ''}`}>
                      {task.done ? '✓' : ''}
                    </span>
                    <span className={task.done ? 'dashboard-task--done' : ''}>{task.name}</span>
                  </li>
                ))}
              </ul>

              <footer className="dashboard-card__footer">
                <span>Completed {completed}</span>
                <span>Not completed {notCompleted}</span>
              </footer>
            </article>
          )
        })}
      </section>

      <section className="dashboard-upcoming" aria-label="Upcoming tasks due">
        <div className="dashboard-upcoming__head">
          <h2>Upcoming Tasks Due</h2>
          <p>Focus on these next so nothing slips.</p>
        </div>

        <div className="dashboard-upcoming__table-wrap">
          <table className="dashboard-upcoming__table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Subject</th>
                <th>Due on</th>
                <th>Days left</th>
              </tr>
            </thead>
            <tbody>
              {upcomingTasks.map((task) => (
                <tr key={task.name}>
                  <td>{task.name}</td>
                  <td>
                    <span className={`dashboard-subject dashboard-subject--${task.subject}`}>
                      {task.subject}
                    </span>
                  </td>
                  <td>{task.due}</td>
                  <td className={`dashboard-days-cell ${daysLeftClass(task.daysLeft)}`}>
                    <span className="dashboard-days-left">{task.daysLeft}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

export default DashboardPage
