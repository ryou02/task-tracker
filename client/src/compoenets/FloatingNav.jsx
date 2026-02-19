import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export function FloatingNav({ navItems, className }) {
  const [visible, setVisible] = useState(true)
  const location = useLocation()

  useEffect(() => {
    let previousY = window.scrollY

    const handleScroll = () => {
      const currentY = window.scrollY
      const direction = currentY - previousY

      if (currentY < 50) {
        setVisible(true)
      } else if (direction < 0) {
        setVisible(true)
      } else {
        setVisible(false)
      }

      previousY = currentY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  function isActivePath(path) {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <div
      className={`fixed inset-x-0 top-10 z-[5000] mx-auto flex max-w-fit items-center justify-center transition-all duration-200 ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-24 opacity-0'
      } ${className || ''}`}
    >
      <div
        className="flex w-[min(92vw,780px)] items-center justify-center gap-3 rounded-full px-3 py-2 backdrop-blur-md"
        style={{
          border: '1px solid var(--app-border)',
          background: 'color-mix(in srgb, var(--app-panel) 95%, transparent)',
          boxShadow: 'var(--app-shadow)',
        }}
      >
        {navItems.map((navItem, idx) => (
          <Link
            key={`link-${idx}`}
            to={navItem.link}
            className="relative flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors"
            style={
              isActivePath(navItem.link)
                ? { background: 'var(--app-accent)', color: 'var(--app-ink-invert)' }
                : { color: 'var(--app-soft)' }
            }
          >
            <span className="block sm:hidden">{navItem.icon}</span>
            <span className="hidden sm:block">{navItem.name}</span>
          </Link>
        ))}

        <div className="h-6 w-px" style={{ background: 'var(--app-border)' }} />

        <Link
          to="/login"
          className="relative rounded-full px-5 py-2.5 text-sm font-semibold transition-all"
          style={
            isActivePath('/login')
              ? { background: 'var(--app-accent)', color: 'var(--app-ink-invert)' }
              : {
                  background: 'color-mix(in srgb, var(--app-accent) 10%, var(--app-panel))',
                  color: 'var(--app-text)',
                }
          }
        >
          <span>Login</span>
        </Link>
      </div>
    </div>
  )
}
