import { useEffect, useMemo, useState } from 'react'

import TextGenerateEffect from '../compoenets/TextGenerateEffect.jsx'
import './DailyPage.css'
import trashIcon from '../assets/trash.png'
import { supabase } from '../lib/supabase'

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function buildSmoothPath(points) {
  if (points.length < 2) return ''

  let path = `M ${points[0].x} ${points[0].y}`
  for (let idx = 1; idx < points.length - 1; idx += 1) {
    const current = points[idx]
    const next = points[idx + 1]
    const controlX = (current.x + next.x) / 2
    const controlY = (current.y + next.y) / 2
    path += ` Q ${current.x} ${current.y} ${controlX} ${controlY}`
  }

  const lastControl = points[points.length - 1]
  path += ` Q ${lastControl.x} ${lastControl.y} ${lastControl.x} ${lastControl.y}`
  return path
}

function toIsoDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function logKey(habitId, entryDate) {
  return `${habitId}:${entryDate}`
}

function DailyPage() {
  const currentYear = new Date().getFullYear()
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())

  const [habits, setHabits] = useState([])
  const [enteringHabitIds, setEnteringHabitIds] = useState(new Set())
  const [removingHabitIds, setRemovingHabitIds] = useState(new Set())
  const [logsByKey, setLogsByKey] = useState({})
  const [loading, setLoading] = useState(true)

  const [habitModalOpen, setHabitModalOpen] = useState(false)
  const [newHabitName, setNewHabitName] = useState('')
  const [habitError, setHabitError] = useState('')
  const [editingHabitId, setEditingHabitId] = useState(null)
  const [editingHabitName, setEditingHabitName] = useState('')

  const allDates = useMemo(() => {
    const daysInMonth = new Date(currentYear, selectedMonth + 1, 0).getDate()
    return Array.from(
      { length: daysInMonth },
      (_, idx) => new Date(currentYear, selectedMonth, idx + 1),
    )
  }, [currentYear, selectedMonth])

  const weekGroups = useMemo(() => {
    const groups = []
    let cursor = 0
    let week = 1

    while (cursor < allDates.length) {
      const end = Math.min(cursor + 7, allDates.length)
      groups.push({ label: `Week ${week}`, count: end - cursor })
      cursor = end
      week += 1
    }

    return groups
  }, [allDates.length])

  async function loadHabits(highlightId = null) {
    const { data, error } = await supabase
      .from('daily_habits')
      .select('id, name, sort_order, created_at')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      setHabitError(error.message)
      return []
    }

    const rows = data || []
    setHabits(rows)
    if (highlightId) {
      setEnteringHabitIds((previous) => new Set([...previous, highlightId]))
      window.setTimeout(() => {
        setEnteringHabitIds((previous) => {
          const next = new Set(previous)
          next.delete(highlightId)
          return next
        })
      }, 520)
    }
    return rows
  }

  async function loadLogs() {
    const startDate = toIsoDate(new Date(currentYear, selectedMonth, 1))
    const endDate = toIsoDate(new Date(currentYear, selectedMonth + 1, 0))

    const { data, error } = await supabase
      .from('daily_habit_logs')
      .select('id, habit_id, entry_date, done')
      .gte('entry_date', startDate)
      .lte('entry_date', endDate)

    if (error) {
      setHabitError(error.message)
      return
    }

    const next = {}
    ;(data || []).forEach((row) => {
      next[logKey(row.habit_id, row.entry_date)] = {
        id: row.id,
        done: row.done,
      }
    })
    setLogsByKey(next)
  }

  async function reloadAll() {
    setLoading(true)
    await loadHabits()
    await loadLogs()
    setLoading(false)
  }

  useEffect(() => {
    reloadAll()
  }, [])

  useEffect(() => {
    loadLogs()
  }, [selectedMonth])

  async function toggleDay(habitId, date) {
    const entryDate = toIsoDate(date)
    const key = logKey(habitId, entryDate)
    const existing = logsByKey[key]

    if (existing) {
      const nextDone = !existing.done
      setLogsByKey((previous) => ({
        ...previous,
        [key]: { ...previous[key], done: nextDone },
      }))

      const { error } = await supabase
        .from('daily_habit_logs')
        .update({ done: nextDone })
        .eq('id', existing.id)

      if (error) {
        setHabitError(error.message)
        setLogsByKey((previous) => ({
          ...previous,
          [key]: { ...previous[key], done: existing.done },
        }))
      }
      return
    }

    setLogsByKey((previous) => ({
      ...previous,
      [key]: { id: `temp-${key}`, done: true },
    }))

    const { data, error } = await supabase
      .from('daily_habit_logs')
      .insert({
        habit_id: habitId,
        entry_date: entryDate,
        done: true,
      })
      .select('id, habit_id, entry_date, done')
      .single()

    if (error) {
      setHabitError(error.message)
      setLogsByKey((previous) => {
        const next = { ...previous }
        delete next[key]
        return next
      })
      return
    }

    setLogsByKey((previous) => ({
      ...previous,
      [key]: { id: data.id, done: data.done },
    }))
  }

  async function addHabit() {
    const name = newHabitName.trim()
    if (!name) {
      setHabitError('Enter a habit name.')
      return false
    }

    const normalizedName = name.toLowerCase()
    const exists = habits.some(
      (habit) => habit.name.trim().toLowerCase() === normalizedName,
    )
    if (exists) {
      setHabitError('Habit already exists.')
      return false
    }

    const nextSort = habits.length
    const { data, error } = await supabase
      .from('daily_habits')
      .insert({
        name,
        sort_order: nextSort,
      })
      .select('id')
      .single()

    if (error) {
      if (error.code === '23505') {
        setHabitError('Habit already exists.')
      } else {
        setHabitError(error.message)
      }
      await loadHabits()
      return false
    }

    setNewHabitName('')
    setHabitError('')
    await loadHabits(data?.id || null)
    return true
  }

  async function renameHabit(habitId, nextName) {
    const trimmed = nextName.trim()
    if (!trimmed) {
      setHabitError('Habit name cannot be empty.')
      return
    }

    const normalizedName = trimmed.toLowerCase()
    const duplicate = habits.find(
      (habit) =>
        habit.id !== habitId && habit.name.trim().toLowerCase() === normalizedName,
    )
    if (duplicate) {
      setHabitError('Habit already exists.')
      return
    }

    const { error } = await supabase
      .from('daily_habits')
      .update({ name: trimmed })
      .eq('id', habitId)

    if (error) {
      if (error.code === '23505') {
        setHabitError('Habit already exists.')
      } else {
        setHabitError(error.message)
      }
      await loadHabits()
      return
    }

    setHabits((previous) =>
      previous.map((habit) => (habit.id === habitId ? { ...habit, name: trimmed } : habit)),
    )
  }

  function startHabitInlineEdit(habit) {
    setEditingHabitId(habit.id)
    setEditingHabitName(habit.name)
  }

  async function submitHabitInlineEdit(habitId) {
    await renameHabit(habitId, editingHabitName)
    setEditingHabitId(null)
  }

  async function removeHabit(habitId) {
    if (removingHabitIds.has(habitId)) return
    setRemovingHabitIds((previous) => new Set([...previous, habitId]))

    window.setTimeout(async () => {
      const { error } = await supabase.from('daily_habits').delete().eq('id', habitId)
      if (error) {
        setHabitError(error.message)
        setRemovingHabitIds((previous) => {
          const next = new Set(previous)
          next.delete(habitId)
          return next
        })
        return
      }

      setHabits((previous) => previous.filter((habit) => habit.id !== habitId))
      setLogsByKey((previous) => {
        const next = {}
        Object.entries(previous).forEach(([key, value]) => {
          if (!key.startsWith(`${habitId}:`)) {
            next[key] = value
          }
        })
        return next
      })
      setRemovingHabitIds((previous) => {
        const next = new Set(previous)
        next.delete(habitId)
        return next
      })
    }, 220)
  }

  const dailyProgress = useMemo(
    () =>
      allDates.map((date) => {
        if (habits.length === 0) return 0

        const entryDate = toIsoDate(date)
        const completedCount = habits.reduce((count, habit) => {
          const row = logsByKey[logKey(habit.id, entryDate)]
          return count + (row?.done ? 1 : 0)
        }, 0)

        return Math.round((completedCount / habits.length) * 100)
      }),
    [allDates, habits, logsByKey],
  )

  const totalCompleted = useMemo(
    () =>
      Object.values(logsByKey).reduce(
        (sum, row) => sum + (row?.done ? 1 : 0),
        0,
      ),
    [logsByKey],
  )

  const averageProgress = Math.round(
    dailyProgress.reduce((sum, value) => sum + value, 0) / Math.max(1, dailyProgress.length),
  )

  const chart = useMemo(() => {
    const chartWidth = 960
    const chartHeight = 210
    const padding = 16
    const graphWidth = chartWidth - padding * 2
    const graphHeight = chartHeight - padding * 2

    const points = dailyProgress.map((value, idx) => ({
      x: Number(
        (
          padding +
          (idx / Math.max(1, dailyProgress.length - 1)) * graphWidth
        ).toFixed(2),
      ),
      y: Number((chartHeight - padding - (value / 100) * graphHeight).toFixed(2)),
      value,
    }))

    const baseY = chartHeight - padding
    const linePath = buildSmoothPath(points)
    const areaPath =
      points.length > 0
        ? `${linePath} L ${points[points.length - 1].x} ${baseY} L ${points[0].x} ${baseY} Z`
        : ''

    return { chartWidth, chartHeight, linePath, areaPath }
  }, [dailyProgress])

  return (
    <main className="daily-page">
      <section className="daily-intro">
        <p className="daily-intro__eyebrow">Daily Planner</p>
        <h1 className="daily-intro__title">
          Daily
          <span className="daily-intro__accent">
            {' '}
            <TextGenerateEffect
              words="tracker"
              className="daily-intro__generate"
              duration={0.55}
              stagger={0.2}
              startDelay={0.5}
            />
          </span>
        </h1>
        <p className="daily-intro__subtitle">
          Mark habits each day, watch weekly consistency, and use the progress
          curve to spot where your routine is improving.
        </p>
      </section>

      <section className="daily-card">
        <header className="daily-toolbar">
          <div className="daily-month-control" aria-label="Month navigation">
            <button
              type="button"
              className="daily-icon-btn"
              aria-label="Previous month"
              onClick={() => setSelectedMonth((previous) => (previous === 0 ? 11 : previous - 1))}
            >
              &#x2039;
            </button>

            <select
              className="daily-month-select"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(Number(event.target.value))}
              aria-label="Select month"
            >
              {monthNames.map((month, idx) => (
                <option key={month} value={idx}>
                  {month}
                </option>
              ))}
            </select>

            <h1 className="daily-month-title">{currentYear}</h1>

            <button
              type="button"
              className="daily-icon-btn"
              aria-label="Next month"
              onClick={() => setSelectedMonth((previous) => (previous === 11 ? 0 : previous + 1))}
            >
              &#x203A;
            </button>
          </div>

          <div className="daily-toolbar-actions">
            <div className="daily-metric">
              <span className="daily-metric-label">Number of habits</span>
              <span className="daily-metric-value">{habits.length}</span>
            </div>
            <div className="daily-metric">
              <span className="daily-metric-label">Completed habits</span>
              <span className="daily-metric-value">{totalCompleted}</span>
            </div>
            <button
              type="button"
              className="daily-add-btn"
              onClick={() => {
                setHabitModalOpen(true)
                setHabitError('')
                setNewHabitName('')
              }}
            >
              + Add habit
            </button>
          </div>
        </header>

        <section className="daily-explainer" aria-label="Tracker explanation">
          <p>
            Check each box when you complete a habit. Your completion rate is
            recalculated for every day and drawn as the curved progress graph below.
          </p>
        </section>

        {habitError ? <p className="daily-error">{habitError}</p> : null}

        <section className="daily-grid-wrap" aria-label="Habit tracker table">
          <table className="daily-table">
            <thead>
              <tr>
                <th rowSpan={3} className="daily-my-habits">
                  My Habits
                </th>
                {weekGroups.map((week) => (
                  <th key={week.label} colSpan={week.count} className="daily-week-group">
                    {week.label}
                  </th>
                ))}
              </tr>
              <tr>
                {allDates.map((date) => (
                  <th key={`label-${date.toISOString()}`} className="daily-day-label">
                    {date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)}
                  </th>
                ))}
              </tr>
              <tr>
                {allDates.map((date) => (
                  <th key={`date-${date.toISOString()}`} className="daily-day-number">
                    {date.getDate()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="daily-empty" colSpan={allDates.length + 1}>
                    Loading habits...
                  </td>
                </tr>
              ) : habits.length === 0 ? (
                <tr>
                  <td className="daily-empty" colSpan={allDates.length + 1}>
                    No habits yet. Click &quot;Add habit&quot; to start tracking.
                  </td>
                </tr>
              ) : (
                habits.map((habit, idx) => (
                  <tr
                    key={habit.id}
                    className={`daily-row ${
                      enteringHabitIds.has(habit.id) ? 'daily-row--entering' : ''
                    } ${removingHabitIds.has(habit.id) ? 'daily-row--deleting' : ''}`}
                    style={{ '--row-index': idx }}
                  >
                    <td
                      className="daily-habit-name-cell"
                      onClick={() => {
                        if (editingHabitId !== habit.id) startHabitInlineEdit(habit)
                      }}
                    >
                      <div className="daily-habit-name-wrap">
                        {editingHabitId === habit.id ? (
                          <input
                            className="daily-habit-inline-input"
                            value={editingHabitName}
                            onChange={(event) => setEditingHabitName(event.target.value)}
                            onBlur={() => submitHabitInlineEdit(habit.id)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') submitHabitInlineEdit(habit.id)
                              if (event.key === 'Escape') setEditingHabitId(null)
                            }}
                            autoFocus
                          />
                        ) : (
                          <button
                            type="button"
                            className="daily-habit-name"
                            onMouseDown={() => startHabitInlineEdit(habit)}
                          >
                            {habit.name}
                          </button>
                        )}

                        {editingHabitId === habit.id ? (
                          <button
                            type="button"
                            className="daily-habit-row-delete"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={(event) => {
                              event.stopPropagation()
                              removeHabit(habit.id)
                            }}
                            aria-label={`Delete ${habit.name}`}
                          >
                            <img src={trashIcon} alt="" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                    {allDates.map((date) => {
                      const key = logKey(habit.id, toIsoDate(date))
                      const completed = logsByKey[key]?.done || false

                      return (
                        <td key={`${habit.id}-${date.toISOString()}`} className="daily-checkbox-cell">
                          <button
                            type="button"
                            className={`daily-checkbox ${
                              completed ? 'daily-checkbox--done' : 'daily-checkbox--todo'
                            }`}
                            aria-pressed={completed}
                            aria-label={`${habit.name} on day ${date.getDate()}`}
                            onClick={() => toggleDay(habit.id, date)}
                          >
                            {completed ? '✓' : ''}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <section className="daily-progress">
          <div className="daily-progress-head">
            <h2>Progress</h2>
            <p>{averageProgress}% avg completion</p>
          </div>

          <div className="daily-progress-plot">
            <div className="daily-y-axis" aria-hidden="true">
              <span>100%</span>
              <span>50%</span>
              <span>0%</span>
            </div>

            <div className="daily-progress-chart" aria-label="Daily completion chart">
              <svg
                viewBox={`0 0 ${chart.chartWidth} ${chart.chartHeight}`}
                role="img"
                aria-label="Curved completion graph"
                preserveAspectRatio="none"
              >
                <path d={chart.areaPath} className="daily-area-path" />
                <path d={chart.linePath} className="daily-line-path" />
              </svg>
            </div>
          </div>
        </section>
      </section>

      {habitModalOpen ? (
        <div className="daily-habit-modal-backdrop" role="presentation">
          <section className="daily-habit-modal" aria-label="Manage habits">
            <header className="daily-habit-modal__head">
              <h3>Manage Habits</h3>
              <button type="button" onClick={() => setHabitModalOpen(false)}>
                x
              </button>
            </header>

            <div className="daily-habit-modal__add">
              <input
                type="text"
                placeholder="Habit name"
                value={newHabitName}
                autoComplete="off"
                onChange={(event) => setNewHabitName(event.target.value)}
                onKeyDown={async (event) => {
                  if (event.key !== 'Enter') return
                  const created = await addHabit()
                  if (created) setHabitModalOpen(false)
                }}
              />
              <button
                type="button"
                onClick={async () => {
                  const created = await addHabit()
                  if (created) setHabitModalOpen(false)
                }}
              >
                Add
              </button>
            </div>
            {habitError ? <p className="daily-habit-modal__error">{habitError}</p> : null}
          </section>
        </div>
      ) : null}
    </main>
  )
}

export default DailyPage
