import './DeadlinesPage.css'

const deadlines = [
  {
    subject: 'mat136',
    subjectClass: 'deadlines__subject-pill--mat136',
    task: 'tutorial worksheet',
    daysLeft: -2,
    dueOn: 'Sunday, Feb 15',
  },
  {
    subject: 'mat223',
    subjectClass: 'deadlines__subject-pill--mat223',
    task: 'textbook readings',
    daysLeft: -1,
    dueOn: 'Monday, Feb 16',
  },
  {
    subject: 'soc100',
    subjectClass: 'deadlines__subject-pill--soc100',
    task: 'weekly reading response',
    daysLeft: 3,
    dueOn: 'Thursday, Feb 20',
  },
  {
    subject: 'mat136',
    subjectClass: 'deadlines__subject-pill--mat136',
    task: 'webwork set 4',
    daysLeft: 5,
    dueOn: 'Saturday, Feb 22',
  },
  {
    subject: 'other',
    subjectClass: 'deadlines__subject-pill--other',
    task: 'internship application',
    daysLeft: 7,
    dueOn: 'Monday, Feb 24',
  },
  {
    subject: 'soc100',
    subjectClass: 'deadlines__subject-pill--soc100',
    task: 'quiz prep',
    daysLeft: 9,
    dueOn: 'Wednesday, Feb 26',
  },
]

function dayClass(daysLeft) {
  if (daysLeft < 0) return 'deadlines__days-cell--late'
  if (daysLeft <= 3) return 'deadlines__days-cell--soon'
  return 'deadlines__days-cell--upcoming'
}

function DeadlinesPage() {
  return (
    <main className="deadlines-page">
      <section className="deadlines">
        <header className="deadlines__header">
          <p className="deadlines__eyebrow">Planner</p>
          <h1 className="deadlines__title">
            Deadlines
            <span className="deadlines__title-squiggle"> board</span>
          </h1>
          <p className="deadlines__subtitle">
            Track each task by subject, see days left at a glance, and keep due
            dates clean and visible.
          </p>
        </header>

        <section className="deadlines__composer" aria-label="New deadline">
          <select defaultValue="mat136" aria-label="Subject">
            <option value="mat136">mat136</option>
            <option value="mat223">mat223</option>
            <option value="soc100">soc100</option>
            <option value="other">other</option>
          </select>
          <input type="text" value="New task name" readOnly aria-label="Task name" />
          <input type="text" value="Select due date" readOnly aria-label="Due date" />
          <button type="button">Add Task</button>
        </section>

        <section className="deadlines__table-wrap" aria-label="Task deadlines table">
          <div className="deadlines__table-title">tasks</div>
          <table className="deadlines__table">
            <thead>
              <tr>
                <th>subject</th>
                <th>assignment name</th>
                <th>days left</th>
                <th>due on</th>
              </tr>
            </thead>
            <tbody>
              {deadlines.map((item) => (
                <tr key={`${item.subject}-${item.task}`}>
                  <td>
                    <span className={`deadlines__subject-pill ${item.subjectClass}`}>
                      {item.subject}
                    </span>
                  </td>
                  <td>{item.task}</td>
                  <td className={`deadlines__days-cell ${dayClass(item.daysLeft)}`}>
                    {item.daysLeft}
                  </td>
                  <td>{item.dueOn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </section>
    </main>
  )
}

export default DeadlinesPage
