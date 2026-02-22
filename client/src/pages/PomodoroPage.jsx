import { useEffect, useMemo, useState } from 'react'

import TextGenerateEffect from '../compoenets/TextGenerateEffect.jsx'
import './PomodoroPage.css'

const MODES = {
  focus: 'focus',
  short: 'short',
  long: 'long',
}

function formatClock(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function PomodoroPage() {
  const [focusMinutes, setFocusMinutes] = useState(25)
  const [shortMinutes, setShortMinutes] = useState(5)
  const [longMinutes, setLongMinutes] = useState(15)

  const durations = useMemo(
    () => ({
      [MODES.focus]: Math.max(1, focusMinutes) * 60,
      [MODES.short]: Math.max(1, shortMinutes) * 60,
      [MODES.long]: Math.max(1, longMinutes) * 60,
    }),
    [focusMinutes, longMinutes, shortMinutes],
  )

  const [mode, setMode] = useState(MODES.focus)
  const [secondsLeft, setSecondsLeft] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [endTimeMs, setEndTimeMs] = useState(null)
  const [completedFocusSessions, setCompletedFocusSessions] = useState(0)

  useEffect(() => {
    setSecondsLeft(durations[mode])
    setEndTimeMs(null)
  }, [durations, mode])

  useEffect(() => {
    if (!running || endTimeMs === null) return undefined

    let finished = false

    const intervalId = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTimeMs - Date.now()) / 1000))
      setSecondsLeft((previous) => (previous === remaining ? previous : remaining))

      if (remaining > 0 || finished) return
      finished = true

      setRunning(false)
      setEndTimeMs(null)

      if (mode === MODES.focus) {
        setCompletedFocusSessions((previous) => {
          const next = previous + 1
          setMode(next % 4 === 0 ? MODES.long : MODES.short)
          return next
        })
      } else {
        setMode(MODES.focus)
      }
    }, 250)

    return () => window.clearInterval(intervalId)
  }, [endTimeMs, mode, running])

  function selectMode(nextMode) {
    setMode(nextMode)
    setRunning(false)
    setEndTimeMs(null)
  }

  function resetCurrent() {
    setRunning(false)
    setEndTimeMs(null)
    setSecondsLeft(durations[mode])
  }

  function updateMinutes(setter, nextValue) {
    if (Number.isNaN(nextValue)) return
    setter(Math.min(120, Math.max(1, nextValue)))
  }

  function toggleTimer() {
    if (running) {
      const remaining = endTimeMs ? Math.max(0, Math.ceil((endTimeMs - Date.now()) / 1000)) : secondsLeft
      setRunning(false)
      setEndTimeMs(null)
      setSecondsLeft(remaining)
      return
    }

    const startFrom = secondsLeft > 0 ? secondsLeft : durations[mode]
    setSecondsLeft(startFrom)
    setEndTimeMs(Date.now() + startFrom * 1000)
    setRunning(true)
  }

  return (
    <main className="pomodoro-page">
      <section className="pomodoro">
        <header className="pomodoro__header">
          <p className="pomodoro__eyebrow">Focus</p>
          <h1 className="pomodoro__title">
            Pomodoro
            <span className="pomodoro__title-accent">
              {' '}
              <TextGenerateEffect
                words="timer"
                className="pomodoro__title-generate"
                duration={0.55}
                stagger={0.2}
                startDelay={0.25}
              />
            </span>
          </h1>
          <p className="pomodoro__subtitle">
            Start focused sprints, take short breaks, and roll into long breaks every 4 completed
            sessions.
          </p>
        </header>

        <section
          className={`pomodoro__panel pomodoro__panel--${mode}`}
          aria-label="Pomodoro timer"
        >
          <div className="pomodoro__mode-tabs">
            <button
              type="button"
              className={`pomodoro__mode-btn ${mode === MODES.focus ? 'pomodoro__mode-btn--active' : ''}`}
              onClick={() => selectMode(MODES.focus)}
            >
              Focus
            </button>
            <button
              type="button"
              className={`pomodoro__mode-btn ${mode === MODES.short ? 'pomodoro__mode-btn--active' : ''}`}
              onClick={() => selectMode(MODES.short)}
            >
              Short break
            </button>
            <button
              type="button"
              className={`pomodoro__mode-btn ${mode === MODES.long ? 'pomodoro__mode-btn--active' : ''}`}
              onClick={() => selectMode(MODES.long)}
            >
              Long break
            </button>
          </div>

          <p className={`pomodoro__clock ${running ? 'pomodoro__clock--running' : ''}`} aria-live="polite">
            {formatClock(secondsLeft)}
          </p>

          <div className="pomodoro__actions">
            <button
              type="button"
              className="pomodoro__primary"
              onClick={toggleTimer}
            >
              {running ? 'Pause' : 'Start'}
            </button>
            <button type="button" className="pomodoro__secondary" onClick={resetCurrent}>
              Reset
            </button>
          </div>

          <p className="pomodoro__meta">Completed focus sessions: {completedFocusSessions}</p>
        </section>

        <section className="pomodoro__settings" aria-label="Pomodoro durations">
          <h2>Durations (minutes)</h2>
          <div className="pomodoro__settings-grid">
            <label>
              Focus
              <input
                type="number"
                min={1}
                max={120}
                value={focusMinutes}
                onChange={(event) => updateMinutes(setFocusMinutes, Number(event.target.value))}
              />
            </label>
            <label>
              Short break
              <input
                type="number"
                min={1}
                max={120}
                value={shortMinutes}
                onChange={(event) => updateMinutes(setShortMinutes, Number(event.target.value))}
              />
            </label>
            <label>
              Long break
              <input
                type="number"
                min={1}
                max={120}
                value={longMinutes}
                onChange={(event) => updateMinutes(setLongMinutes, Number(event.target.value))}
              />
            </label>
          </div>
        </section>
      </section>
    </main>
  )
}

export default PomodoroPage
