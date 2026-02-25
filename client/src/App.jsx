import { Navigate, Route, Routes } from 'react-router-dom'
import DailyPage from './pages/DailyPage.jsx'
import CalenderPage from './pages/CalenderPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import DeadlinesPage from './pages/DeadlinesPage.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import PomodoroPage from './pages/PomodoroPage.jsx'
import AppShell from './compoenets/AppShell.jsx'
import AgentChatWidget from './compoenets/AgentChatWidget.jsx'
import ProtectedRoute from './compoenets/ProtectedRoute.jsx'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/deadlines" element={<DeadlinesPage />} />
            <Route path="/daily" element={<DailyPage />} />
            <Route path="/calender" element={<CalenderPage />} />
            <Route path="/calendar" element={<Navigate to="/calender" replace />} />
            <Route path="/pomodoro" element={<PomodoroPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AgentChatWidget />
    </>
  )
}

export default App
