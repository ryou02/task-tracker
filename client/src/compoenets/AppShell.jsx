import { Outlet } from 'react-router-dom'

import SideNavbar from './SideNavbar.jsx'
import './AppShell.css'

function AppShell() {
  return (
    <div className="app-shell">
      <SideNavbar />
      <main className="app-shell__content">
        <Outlet />
      </main>
    </div>
  )
}

export default AppShell
