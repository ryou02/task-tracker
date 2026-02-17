import { Navigate, Route, Routes } from 'react-router-dom'
import DailyPage from './pages/DailyPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import DeadlinesPage from './pages/DeadlinesPage.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/deadlines" element={<DeadlinesPage />} />
      <Route path="/daily" element={<DailyPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
