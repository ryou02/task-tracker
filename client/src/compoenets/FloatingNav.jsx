import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export function FloatingNav({ navItems, className }) {
  const [visible, setVisible] = useState(true)

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

  return (
    <div
      className={`fixed inset-x-0 top-10 z-[5000] mx-auto flex max-w-fit items-center justify-center transition-all duration-200 ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-24 opacity-0'
      } ${className || ''}`}
    >
      <div className="flex w-[min(92vw,780px)] items-center justify-center gap-3 rounded-full border border-[#d8d0c3] bg-[#faf7f2]/95 px-3 py-2 shadow-[0_10px_34px_rgba(61,58,50,0.16)] backdrop-blur-md">
        {navItems.map((navItem, idx) => (
          <Link
            key={`link-${idx}`}
            to={navItem.link}
            className="relative flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-[#6f6b61] transition-colors hover:bg-[#ede7dc] hover:text-[#3d3a32]"
          >
            <span className="block sm:hidden">{navItem.icon}</span>
            <span className="hidden sm:block">{navItem.name}</span>
          </Link>
        ))}

        <div className="h-6 w-px bg-[#d8d0c3]" />

        <Link
          to="/login"
          className="relative rounded-full bg-[#c86f45] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#af5a35] hover:shadow-[0_8px_20px_rgba(200,111,69,0.35)]"
        >
          <span>Login</span>
        </Link>
      </div>
    </div>
  )
}
