import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthContext'
import { getDefaultRoute } from '@/constants/roles'
import { PATHS } from '@/routes/paths'

/** Requires a Firebase Auth session and loaded Firestore profile. */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to={PATHS.login} replace />
  }

  return <Outlet />
}

/** Guest-only routes (Login). Authenticated users go to their role default. */
export function GuestRoute() {
  const { isAuthenticated, role } = useAuth()

  if (isAuthenticated && role) {
    return <Navigate to={getDefaultRoute(role)} replace />
  }

  return <Outlet />
}
