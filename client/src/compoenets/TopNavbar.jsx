import { Link } from 'react-router-dom'
import './TopNavbar.css'

function TopNavbar() {
  return (
    <header className="top-navbar">
      <nav className="top-navbar__inner" aria-label="Primary">
        <div className="top-navbar__brand">task tracker</div>
        <div className="top-navbar__links">
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
        </div>
      </nav>
    </header>
  )
}

export default TopNavbar
