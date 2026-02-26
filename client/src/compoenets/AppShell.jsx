import { Outlet } from 'react-router-dom'

import AgentChatWidget from './AgentChatWidget.jsx'
import SideNavbar from './SideNavbar.jsx'
import './AppShell.css'

function AppShell() {
  return (
    <div className="app-shell">
      <SideNavbar />
      <main className="app-shell__content">
        <div className="app-shell__zoom-wrap">
          <Outlet />
        </div>
      </main>
      <AgentChatWidget />
    </div>
  )
}

export default AppShell
