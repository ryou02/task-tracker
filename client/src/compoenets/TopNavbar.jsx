import { Link } from 'react-router-dom'

function TopNavbar() {
  return (
    <header>
      <nav>
        <Link to="/">Home</Link> | <Link to="/login">Login</Link>
      </nav>
    </header>
  )
}

export default TopNavbar
