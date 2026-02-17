import { Link } from 'react-router-dom'

function SideNavbar() {
  return (
    <aside>
      <nav>
        <ul>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/deadlines">Deadlines</Link>
          </li>
          <li>
            <Link to="/daily">Daily</Link>
          </li>
        </ul>
      </nav>
    </aside>
  )
}

export default SideNavbar
