import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'task-tracker-theme'
const THEMES = [
  { id: 'default', label: 'Default' },
  { id: 'claude', label: 'Claude' },
  { id: 'vintage-paper', label: 'Vintage Paper' },
  { id: 'perpetuity', label: 'Perpetuity' },
]

function readTheme() {
  if (typeof window === 'undefined') return 'claude'
  const saved = localStorage.getItem(STORAGE_KEY)
  return THEMES.some((theme) => theme.id === saved) ? saved : 'claude'
}

function applyTheme(theme) {
  const root = document.documentElement
  root.classList.remove('dark')
  root.dataset.theme = theme
  localStorage.setItem(STORAGE_KEY, theme)
  window.dispatchEvent(new CustomEvent('theme-updated', { detail: theme }))
}

function ThemeButton({ className = '' }) {
  const [theme, setTheme] = useState(readTheme)
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === STORAGE_KEY) {
        setTheme(readTheme())
      }
    }
    const onThemeUpdated = (event) => {
      const next = THEMES.some((item) => item.id === event.detail) ? event.detail : 'claude'
      setTheme(next)
    }
    const onDocumentClick = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    window.addEventListener('storage', onStorage)
    window.addEventListener('theme-updated', onThemeUpdated)
    document.addEventListener('mousedown', onDocumentClick)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('theme-updated', onThemeUpdated)
      document.removeEventListener('mousedown', onDocumentClick)
    }
  }, [])

  return (
    <div className="theme-dropdown" ref={wrapperRef}>
      <button
        type="button"
        className={className}
        onClick={() => setOpen((previous) => !previous)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        Select a theme
        <span className="theme-dropdown__caret">{open ? '▲' : '▼'}</span>
      </button>

      {open ? (
        <div className="theme-dropdown__menu" role="menu" aria-label="Theme options">
          {THEMES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitemradio"
              aria-checked={theme === item.id}
              className={`theme-dropdown__option ${
                theme === item.id ? 'theme-dropdown__option--active' : ''
              }`}
              onClick={() => {
                setTheme(item.id)
                setOpen(false)
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default ThemeButton
