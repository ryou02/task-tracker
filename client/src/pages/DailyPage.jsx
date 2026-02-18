import { useEffect, useMemo, useState } from 'react'
import './DailyPage.css'

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

const habits = [
  'Wake up at 5:00',
  'Gym',
  'No Doomscrolling',
  'Reading / Learning',
  'Project Work',
  'Budget Tracking',
  'No Alcohol',
  'Social Media Detox',
]

function seededCompletion(habitIndex, dayIndex, monthIndex) {
  return (habitIndex * 3 + dayIndex + monthIndex * 2) % (habitIndex % 2 === 0 ? 4 : 5) !== 0
}

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

function createCompletionGrid(dayCount, monthIndex) {
  return habits.map((_, habitIndex) =>
    Array.from({ length: dayCount }, (_, dayIndex) =>
      seededCompletion(habitIndex, dayIndex + 1, monthIndex),
    ),
  )
}

function DailyPage() {
  const currentYear = new Date().getFullYear()
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())

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

  const [completionGrid, setCompletionGrid] = useState(() =>
    createCompletionGrid(allDates.length, selectedMonth),
  )

  useEffect(() => {
    setCompletionGrid(createCompletionGrid(allDates.length, selectedMonth))
  }, [allDates.length, selectedMonth])

  function toggleDay(habitIndex, dayIndex) {
    setCompletionGrid((previous) =>
      previous.map((row, rowIndex) =>
        rowIndex === habitIndex
          ? row.map((cell, cellIndex) => (cellIndex === dayIndex ? !cell : cell))
          : row,
      ),
    )
  }

  const dailyProgress = useMemo(
    () =>
      allDates.map((_, dayIndex) => {
        const completedCount = completionGrid.reduce(
          (count, row) => count + (row[dayIndex] ? 1 : 0),
          0,
        )
        return Math.round((completedCount / habits.length) * 100)
      }),
    [allDates, completionGrid],
  )

  const totalCompleted = useMemo(
    () => completionGrid.flat().reduce((sum, done) => sum + (done ? 1 : 0), 0),
    [completionGrid],
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
          <span className="daily-intro__accent"> tracker</span>
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
              onClick={() =>
                setSelectedMonth((previous) => (previous === 0 ? 11 : previous - 1))
              }
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
              onClick={() =>
                setSelectedMonth((previous) => (previous === 11 ? 0 : previous + 1))
              }
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
            <button type="button" className="daily-add-btn">
              + Add task
            </button>
          </div>
        </header>

        <section className="daily-explainer" aria-label="Tracker explanation">
          <p>
            Check each box when you complete a habit. Your completion rate is
            recalculated for every day and drawn as the curved progress graph below.
          </p>
        </section>

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
                  <th
                    key={`label-${date.toISOString()}`}
                    className="daily-day-label"
                  >
                    {date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)}
                  </th>
                ))}
              </tr>
              <tr>
                {allDates.map((date) => (
                  <th
                    key={`date-${date.toISOString()}`}
                    className="daily-day-number"
                  >
                    {date.getDate()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {habits.map((habit, habitIndex) => (
                <tr key={habit}>
                  <td className="daily-habit-name">{habit}</td>
                  {allDates.map((date, dayIndex) => {
                    const completed = completionGrid[habitIndex][dayIndex]
                    return (
                      <td key={`${habit}-${date.toISOString()}`} className="daily-checkbox-cell">
                        <button
                          type="button"
                          className={`daily-checkbox ${
                            completed ? 'daily-checkbox--done' : 'daily-checkbox--todo'
                          }`}
                          aria-pressed={completed}
                          aria-label={`${habit} on day ${date.getDate()}`}
                          onClick={() => toggleDay(habitIndex, dayIndex)}
                        >
                          {completed ? '✓' : ''}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
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
    </main>
  )
}

export default DailyPage
