import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthProvider'
import './SideNavbar.css'

function SideNavbar() {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  async function handleLogout() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="side-navbar" aria-label="App navigation">
      <div className="side-navbar__inner">
        <div className="side-navbar__brand">task tracker</div>

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
        </nav>

        <button type="button" className="side-navbar__logout" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </aside>
  )
}

export default SideNavbar
