import { useEffect, useMemo, useState } from 'react'

import { supabase } from '../lib/supabase'
import './DashboardPage.css'

function toIsoDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function logKey(habitId, entryDate) {
  return `${habitId}:${entryDate}`
}

function getMonday(date) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  const mondayOffset = (copy.getDay() + 6) % 7
  copy.setDate(copy.getDate() - mondayOffset)
  return copy
}

function formatCardDate(date) {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}

function formatDueLabel(dateString) {
  if (!dateString) return ''
  const date = new Date(`${dateString}T00:00:00`)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

function computeDaysLeft(dateString) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(`${dateString}T00:00:00`)
  due.setHours(0, 0, 0, 0)
  return Math.round((due - today) / 86400000)
}

function DashboardPage() {
  const [habits, setHabits] = useState([])
  const [logsByKey, setLogsByKey] = useState({})
  const [upcomingTasks, setUpcomingTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const weekDates = useMemo(() => {
    const monday = getMonday(new Date())
    return Array.from({ length: 7 }, (_, idx) => {
      const date = new Date(monday)
      date.setDate(monday.getDate() + idx)
      return date
    })
  }, [])

  async function loadDashboardData() {
    setLoading(true)
    setError('')

    const startIso = toIsoDate(weekDates[0])
    const endIso = toIsoDate(weekDates[weekDates.length - 1])

    const [habitsResponse, logsResponse, deadlinesResponse] = await Promise.all([
      supabase
        .from('daily_habits')
        .select('id, name, sort_order, created_at')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true }),
      supabase
        .from('daily_habit_logs')
        .select('id, habit_id, entry_date, done')
        .gte('entry_date', startIso)
        .lte('entry_date', endIso),
      supabase
        .from('deadlines')
        .select('id, assignment_name, due_on, subjects(name, color_bg, color_text)')
        .gte('due_on', toIsoDate(new Date()))
        .order('due_on', { ascending: true })
        .limit(8),
    ])

    if (habitsResponse.error) {
      setError(habitsResponse.error.message)
      setLoading(false)
      return
    }
    if (logsResponse.error) {
      setError(logsResponse.error.message)
      setLoading(false)
      return
    }
    if (deadlinesResponse.error) {
      setError(deadlinesResponse.error.message)
      setLoading(false)
      return
    }

    setHabits(habitsResponse.data || [])

    const nextLogs = {}
    ;(logsResponse.data || []).forEach((row) => {
      nextLogs[logKey(row.habit_id, row.entry_date)] = {
        id: row.id || null,
        habit_id: row.habit_id,
        entry_date: row.entry_date,
        done: row.done,
      }
    })
    setLogsByKey(nextLogs)

    setUpcomingTasks(
      (deadlinesResponse.data || []).map((row) => ({
        id: row.id,
        name: row.assignment_name,
        subject: row.subjects?.name || 'subject',
        color_bg: row.subjects?.color_bg || '#DDDeda',
        color_text: row.subjects?.color_text || '#3D3A32',
        due: formatDueLabel(row.due_on),
        daysLeft: computeDaysLeft(row.due_on),
      })),
    )

    setLoading(false)
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function toggleHabitForDay(habitId, entryDate) {
    const key = logKey(habitId, entryDate)
    const existing = logsByKey[key]

    if (existing) {
      const nextDone = !existing.done
      setLogsByKey((previous) => ({
        ...previous,
        [key]: { ...previous[key], done: nextDone },
      }))

      const { error: updateError } = await supabase
        .from('daily_habit_logs')
        .update({ done: nextDone })
        .match(
          existing.id
            ? { id: existing.id }
            : { habit_id: habitId, entry_date: entryDate },
        )

      if (updateError) {
        setError(updateError.message)
        setLogsByKey((previous) => ({
          ...previous,
          [key]: { ...previous[key], done: existing.done },
        }))
      }
      return
    }

    setLogsByKey((previous) => ({
      ...previous,
      [key]: { id: null, habit_id: habitId, entry_date: entryDate, done: true },
    }))

    const { error: insertError } = await supabase
      .from('daily_habit_logs')
      .insert({
        habit_id: habitId,
        entry_date: entryDate,
        done: true,
      })

    if (insertError) {
      setError(insertError.message)
      setLogsByKey((previous) => {
        const next = { ...previous }
        delete next[key]
        return next
      })
      return
    }

  }

  const dayCards = useMemo(
    () =>
      weekDates.map((date) => {
        const entryDate = toIsoDate(date)
        const tasks = habits.map((habit) => ({
          habitId: habit.id,
          entryDate,
          name: habit.name,
          done: Boolean(logsByKey[logKey(habit.id, entryDate)]?.done),
        }))
        const completed = tasks.filter((task) => task.done).length
        const progress = habits.length === 0 ? 0 : Math.round((completed / habits.length) * 100)

        return {
          day: date.toLocaleDateString('en-US', { weekday: 'long' }),
          date: formatCardDate(date),
          progress,
          tasks,
          completed,
          notCompleted: Math.max(0, tasks.length - completed),
        }
      }),
    [habits, logsByKey, weekDates],
  )

  return (
    <main className="dashboard-page">
      <section className="dashboard-header">
        <p className="dashboard-header__eyebrow">Overview</p>
        <h1 className="dashboard-header__title">
          Weekly
          <span className="dashboard-header__accent"> dashboard</span>
        </h1>
        <p className="dashboard-header__subtitle">
          Daily cards now come directly from your habits tracker for the current week.
          Completion rings use checked habits, and each tasks list is your habits for that day.
        </p>
      </section>

      {error ? <p className="dashboard-error">{error}</p> : null}

      <section className="dashboard-cards" aria-label="Daily summary cards">
        {dayCards.map((card) => (
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
            {loading ? (
              <p className="dashboard-card__empty">Loading...</p>
            ) : card.tasks.length === 0 ? (
              <p className="dashboard-card__empty">No habits yet.</p>
            ) : (
              <ul className="dashboard-card__tasks">
                {card.tasks.map((task) => (
                  <li key={`${card.day}-${task.habitId}`}>
                    <button
                      type="button"
                      className={`dashboard-check ${task.done ? 'dashboard-check--done' : ''}`}
                      aria-label={`Toggle ${task.name} for ${card.day}`}
                      aria-pressed={task.done}
                      onClick={() => toggleHabitForDay(task.habitId, task.entryDate)}
                    >
                      {task.done ? '✓' : ''}
                    </button>
                    <span className={task.done ? 'dashboard-task--done' : ''}>{task.name}</span>
                  </li>
                ))}
              </ul>
            )}

            <footer className="dashboard-card__footer">
              <span>Completed {card.completed}</span>
              <span>Not completed {card.notCompleted}</span>
            </footer>
          </article>
        ))}
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
              {upcomingTasks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="dashboard-upcoming__empty">
                    No upcoming deadlines.
                  </td>
                </tr>
              ) : (
                upcomingTasks.map((task) => (
                  <tr key={task.id}>
                    <td>{task.name}</td>
                    <td>
                      <span
                        className="dashboard-subject"
                        style={{
                          background: task.color_bg,
                          color: task.color_text,
                        }}
                      >
                        {task.subject}
                      </span>
                    </td>
                    <td>{task.due}</td>
                    <td className="dashboard-days-cell">
                      <span className="dashboard-days-left">{task.daysLeft}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

export default DashboardPage
