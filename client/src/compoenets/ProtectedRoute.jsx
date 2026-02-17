import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '../context/AuthProvider'

function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div style={{ padding: '2rem' }}>Checking session...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export default ProtectedRoute
