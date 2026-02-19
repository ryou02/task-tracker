import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthProvider'
import ThemeButton from './ThemeButton.jsx'
import settingsIcon from '../assets/settings.png'
import logoIcon from '../assets/logo.png'
import './SideNavbar.css'

function SideNavbar() {
  const navigate = useNavigate()
  const { signOut, user } = useAuth()
  const [settingsOpen, setSettingsOpen] = useState(false)

  const userEmail = user?.email || 'No email'
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null
  const avatarFallback = userEmail?.trim()?.[0]?.toUpperCase() || '?'

  async function handleLogout() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="side-navbar" aria-label="App navigation">
      <div className="side-navbar__inner">
        <div className="side-navbar__brand">
          <img src={logoIcon} alt="" />
          <span>task tracker</span>
        </div>

        <nav className="side-navbar__links">
          <NavLink to="/dashboard" className={({ isActive }) => `side-navbar__link${isActive ? ' side-navbar__link--active' : ''}`}>
            Dashboard
          </NavLink>
          <NavLink to="/daily" className={({ isActive }) => `side-navbar__link${isActive ? ' side-navbar__link--active' : ''}`}>
            Daily Tasks
          </NavLink>
          <NavLink to="/deadlines" className={({ isActive }) => `side-navbar__link${isActive ? ' side-navbar__link--active' : ''}`}>
            Deadlines
          </NavLink>
          <NavLink to="/calender" className={({ isActive }) => `side-navbar__link${isActive ? ' side-navbar__link--active' : ''}`}>
            Calender
          </NavLink>
        </nav>

        <div className="side-navbar__settings-wrap">
          <button
            type="button"
            className="side-navbar__settings-btn"
            onClick={() => setSettingsOpen((previous) => !previous)}
            aria-label="Open settings"
            aria-expanded={settingsOpen}
          >
            <span className="side-navbar__settings-user">
              <span className="side-navbar__settings-avatar" aria-hidden="true">
                {avatarUrl ? <img src={avatarUrl} alt="" referrerPolicy="no-referrer" /> : avatarFallback}
              </span>
              <span className="side-navbar__settings-email">{userEmail}</span>
            </span>
            <img src={settingsIcon} alt="" />
          </button>
        </div>
      </div>

      {settingsOpen ? (
        <div
          className="side-navbar__modal-backdrop"
          role="presentation"
          onClick={() => setSettingsOpen(false)}
        >
          <section
            className="side-navbar__settings-modal"
            aria-label="Settings"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="side-navbar__modal-head">
              <div>
                <p className="side-navbar__modal-label">Signed in as</p>
                <p className="side-navbar__modal-email">{userEmail}</p>
              </div>
            </header>

            <div className="side-navbar__modal-actions">
              <ThemeButton className="side-navbar__hud-theme" />
              <button
                type="button"
                className="side-navbar__hud-logout"
                onClick={handleLogout}
              >
                Log out
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </aside>
  )
}

export default SideNavbar
