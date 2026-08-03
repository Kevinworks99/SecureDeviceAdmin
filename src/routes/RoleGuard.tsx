import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthContext'
import { LoadingSpinner } from '@/components'
import { getDefaultRoute } from '@/constants/roles'
import type { UserRole } from '@/models'
import { PATHS } from '@/routes/paths'

interface RoleGuardProps {
  allowedRoles: UserRole[]
  children: ReactNode
}

/**
 * Restricts a route to specific roles.
 * Unauthorized roles are redirected to their default landing page.
 */
export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { loading, isAuthenticated, role } = useAuth()

  if (loading) {
    return <LoadingSpinner fullScreen label="Checking permissions…" />
  }

  if (!isAuthenticated) {
    return <Navigate to={PATHS.login} replace />
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to={getDefaultRoute(role)} replace />
  }

  return <>{children}</>
}
