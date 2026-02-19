import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'

import logoIcon from '../assets/logo.png'
import { useAuth } from '../context/AuthProvider'
import ThemeButton from './ThemeButton.jsx'
import { Sidebar, SidebarBody, SidebarLink } from '../ui/sidebar.jsx'
import './SideNavbar.css'

function IconGrid() {
  return <span className="acet-icon-grid" />
}

function IconCheck() {
  return <span className="acet-icon-check" />
}

function IconDeadline() {
  return <span className="acet-icon-deadline" />
}

function IconCalendar() {
  return <span className="acet-icon-calendar" />
}

function IconClock() {
  return <span className="acet-icon-clock" />
}

function SideNavbar() {
  const navigate = useNavigate()
  const { signOut, user } = useAuth()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsRef = useRef(null)

  const userEmail = user?.email || 'No email'
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null
  const avatarFallback = userEmail?.trim()?.[0]?.toUpperCase() || '?'

  const links = [
    { label: 'Dashboard', href: '/dashboard', icon: <IconGrid /> },
    { label: 'Daily Tasks', href: '/daily', icon: <IconCheck /> },
    { label: 'Deadlines', href: '/deadlines', icon: <IconDeadline /> },
    { label: 'Calender', href: '/calender', icon: <IconCalendar /> },
    { label: 'Pomodoro', href: '/pomodoro', icon: <IconClock /> },
  ]

  async function handleLogout() {
    await signOut()
    navigate('/login', { replace: true })
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (!settingsRef.current?.contains(event.target)) {
        setSettingsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <Sidebar open setOpen={() => {}} className="side-navbar">
      <SidebarBody className="side-navbar__inner">
        <div className="side-navbar__top">
          <div className="side-navbar__brand">
            <img src={logoIcon} alt="" />
            <span className="side-navbar__brand-label">task tracker</span>
          </div>

          <nav className="side-navbar__links">
            {links.map((link) => (
              <SidebarLink key={link.href} link={link} />
            ))}
          </nav>
        </div>

        <div className="side-navbar__bottom">
          <button
            type="button"
            className="side-navbar__user-btn"
            onClick={() => setSettingsOpen(true)}
            aria-expanded={settingsOpen}
            aria-label="Open account actions"
          >
            <span className="side-navbar__avatar" aria-hidden="true">
              {avatarUrl ? <img src={avatarUrl} alt="" referrerPolicy="no-referrer" /> : avatarFallback}
            </span>
            <span className="side-navbar__email">{userEmail}</span>
            <span className="side-navbar__chevron">▼</span>
          </button>
        </div>
      </SidebarBody>

      {settingsOpen && typeof document !== 'undefined'
        ? createPortal(
            <div className="side-navbar__modal-backdrop" role="presentation" onClick={() => setSettingsOpen(false)}>
              <section
                className="side-navbar__settings-modal"
                aria-label="Account actions"
                ref={settingsRef}
                onClick={(event) => event.stopPropagation()}
              >
                <header className="side-navbar__modal-head">
                  <p className="side-navbar__modal-label">Signed in as</p>
                  <p className="side-navbar__modal-email">{userEmail}</p>
                </header>

                <div className="side-navbar__modal-actions">
                  <ThemeButton className="side-navbar__theme-btn" />

                  <button type="button" className="side-navbar__logout-btn" onClick={handleLogout}>
                    <span className="acet-icon-logout" aria-hidden="true" />
                    <span className="side-navbar__logout-label">Log out</span>
                  </button>
                </div>
              </section>
            </div>,
            document.body,
          )
        : null}
    </Sidebar>
  )
}

export default SideNavbar
