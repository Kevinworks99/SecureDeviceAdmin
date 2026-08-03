import type { UserRole } from '@/models'
import { PATHS } from '@/routes/paths'

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  USER: 'user',
} as const satisfies Record<string, UserRole>

export const SUPER_ADMIN_ROUTES = [
  PATHS.dashboard,
  PATHS.users,
  PATHS.devices,
  PATHS.assignments,
  PATHS.activityLogs,
  PATHS.settings,
] as const

export const USER_ROUTES = [
  PATHS.home,
  PATHS.profile,
  PATHS.myDevice,
] as const

/** Default landing page after login for each role. */
export function getDefaultRoute(role: UserRole | null | undefined): string {
  if (role === ROLES.SUPER_ADMIN) {
    return PATHS.dashboard
  }
  if (role === ROLES.USER) {
    return PATHS.home
  }
  return PATHS.login
}
