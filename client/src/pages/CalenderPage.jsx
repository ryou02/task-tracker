import { useEffect, useMemo, useState } from 'react'

import TextGenerateEffect from '../compoenets/TextGenerateEffect.jsx'
import { supabase } from '../lib/supabase'
import './CalenderPage.css'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function toIsoDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function shiftMonth(date, direction) {
  return new Date(date.getFullYear(), date.getMonth() + direction, 1)
}

function buildCalendarDays(monthDate) {
  const first = startOfMonth(monthDate)
  const last = endOfMonth(monthDate)
  const days = []

  for (let idx = 0; idx < first.getDay(); idx += 1) {
    days.push(null)
  }

  for (let day = 1; day <= last.getDate(); day += 1) {
    days.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), day))
  }

  const trailingSlots = (7 - (days.length % 7)) % 7
  for (let idx = 0; idx < trailingSlots; idx += 1) {
    days.push(null)
  }

  return days
}

function formatHeading(date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function formatSelectedDate(dateString) {
  if (!dateString) return ''
  const date = new Date(`${dateString}T00:00:00`)
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function CalenderPage() {
  const [visibleMonth, setVisibleMonth] = useState(startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState(toIsoDate(new Date()))
  const [deadlinesByDate, setDeadlinesByDate] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadMonth() {
      setLoading(true)
      setError('')

      const monthStart = toIsoDate(startOfMonth(visibleMonth))
      const monthEnd = toIsoDate(endOfMonth(visibleMonth))

      const { data, error: monthError } = await supabase
        .from('deadlines')
        .select('id, assignment_name, due_on, subjects(name, color_bg, color_text)')
        .gte('due_on', monthStart)
        .lte('due_on', monthEnd)
        .order('due_on', { ascending: true })

      if (monthError) {
        setError(monthError.message)
        setDeadlinesByDate({})
        setLoading(false)
        return
      }

      const grouped = {}
      ;(data || []).forEach((row) => {
        const key = row.due_on
        if (!grouped[key]) grouped[key] = []
        grouped[key].push({
          id: row.id,
          name: row.assignment_name,
          subject: row.subjects?.name || 'subject',
          colorBg: row.subjects?.color_bg || '#DDDeda',
          colorText: row.subjects?.color_text || '#3D3A32',
        })
      })

      setDeadlinesByDate(grouped)
      setLoading(false)
    }

    loadMonth()
  }, [visibleMonth])

  const days = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth])
  const selectedTasks = deadlinesByDate[selectedDate] || []
  const todayIso = toIsoDate(new Date())

  function goToMonth(direction) {
    setVisibleMonth((previous) => shiftMonth(previous, direction))
  }

  return (
    <main className="calender-page">
      <section className="calender">
        <header className="calender__header">
          <p className="calender__eyebrow">Planner</p>
          <h1 className="calender__title">
            Due date
            <span className="calender__title-accent">
              {' '}
              <TextGenerateEffect
                words="calender"
                className="calender__title-generate"
                duration={0.55}
                stagger={0.2}
                startDelay={0.25}
              />
            </span>
          </h1>
          <p className="calender__subtitle">
            Select any day to see assignments due. Colors match each subject from your deadlines
            setup.
          </p>
        </header>

        {error ? <p className="calender__error">{error}</p> : null}

        <section className="calender__layout">
          <section className="calender__grid-card" aria-label="Monthly calendar">
            <div className="calender__toolbar">
              <button type="button" className="calender__month-btn" onClick={() => goToMonth(-1)}>
                Prev
              </button>
              <h2>{formatHeading(visibleMonth)}</h2>
              <button type="button" className="calender__month-btn" onClick={() => goToMonth(1)}>
                Next
              </button>
            </div>

            <div className="calender__weekday-row">
              {WEEKDAYS.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>

            <div className="calender__grid">
              {days.map((date, idx) => {
                if (!date) {
                  return <div key={`empty-${idx}`} className="calender__cell calender__cell--empty" />
                }

                const iso = toIsoDate(date)
                const taskCount = deadlinesByDate[iso]?.length || 0
                const isSelected = selectedDate === iso
                const isToday = todayIso === iso

                return (
                  <button
                    key={iso}
                    type="button"
                    className={`calender__cell ${isSelected ? 'calender__cell--selected' : ''}`}
                    onClick={() => setSelectedDate(iso)}
                    aria-label={`Show tasks due on ${iso}`}
                  >
                    <span className={`calender__day ${isToday ? 'calender__day--today' : ''}`}>
                      {date.getDate()}
                    </span>
                    <span className="calender__count">
                      {taskCount > 0 ? `${taskCount} due` : '\u00a0'}
                    </span>
                  </button>
                )
              })}
            </div>

            {loading ? <p className="calender__loading">Loading deadlines...</p> : null}
          </section>

          <section className="calender__tasks-card" aria-label="Tasks due on selected day">
            <h3>{formatSelectedDate(selectedDate)}</h3>
            {loading ? (
              <p className="calender__muted">Please wait...</p>
            ) : selectedTasks.length === 0 ? (
              <p className="calender__muted">No tasks due on this day.</p>
            ) : (
              <ul className="calender__task-list">
                {selectedTasks.map((task) => (
                  <li key={task.id}>
                    <span className="calender__task-name">{task.name}</span>
                    <span
                      className="calender__subject"
                      style={{ background: task.colorBg, color: task.colorText }}
                    >
                      {task.subject}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </section>
      </section>
    </main>
  )
}

export default CalenderPage
