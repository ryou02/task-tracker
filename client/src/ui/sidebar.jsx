import { createContext, useContext } from 'react'
import { NavLink } from 'react-router-dom'

const SidebarContext = createContext({ open: true })

function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function Sidebar({ open, children, className = '' }) {
  return (
    <SidebarContext.Provider value={{ open }}>
      <aside
        className={cx('acet-sidebar', open ? 'acet-sidebar--open' : 'acet-sidebar--closed', className)}
        aria-label="App sidebar"
      >
        {children}
      </aside>
    </SidebarContext.Provider>
  )
}

export function SidebarBody({ children, className = '' }) {
  return <div className={cx('acet-sidebar__body', className)}>{children}</div>
}

export function SidebarLink({ link, className = '', onClick }) {
  const { open } = useContext(SidebarContext)

  const content = (
    <>
      <span className="acet-sidebar__icon" aria-hidden="true">
        {link.icon}
      </span>
      <span className={cx('acet-sidebar__label', open ? 'acet-sidebar__label--open' : '')}>
        {link.label}
      </span>
    </>
  )

  if (link.href.startsWith('/')) {
    return (
      <NavLink
        to={link.href}
        onClick={onClick}
        aria-label={link.label}
        className={({ isActive }) =>
          cx('acet-sidebar__link', isActive ? 'acet-sidebar__link--active' : '', className)
        }
      >
        {content}
      </NavLink>
    )
  }

  return (
    <a href={link.href} onClick={onClick} className={cx('acet-sidebar__link', className)}>
      {content}
    </a>
  )
}
