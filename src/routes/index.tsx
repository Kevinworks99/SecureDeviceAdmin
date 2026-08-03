import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthContext'
import { AuthLayout } from '@/layouts/AuthLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { UserLayout } from '@/layouts/UserLayout'
import { LoginPage } from '@/pages/Login/LoginPage'
import { DashboardPage } from '@/pages/Dashboard/DashboardPage'
import { UsersPage } from '@/pages/Users/UsersPage'
import { DevicesPage } from '@/pages/Devices/DevicesPage'
import { AssignmentsPage } from '@/pages/Assignments/AssignmentsPage'
import { ActivityLogsPage } from '@/pages/ActivityLogs/ActivityLogsPage'
import { SettingsPage } from '@/pages/Settings/SettingsPage'
import { HomePage } from '@/pages/Home/HomePage'
import { ProfilePage } from '@/pages/Profile/ProfilePage'
import { MyDevicePage } from '@/pages/MyDevice/MyDevicePage'
import { GuestRoute, ProtectedRoute } from '@/routes/ProtectedRoute'
import { RoleGuard } from '@/routes/RoleGuard'
import { getDefaultRoute } from '@/constants/roles'
import { ROLES } from '@/constants/roles'
import { PATHS } from '@/routes/paths'

function RootRedirect() {
  const { isAuthenticated, role } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to={PATHS.login} replace />
  }

  return <Navigate to={getDefaultRoute(role)} replace />
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path={PATHS.login} element={<LoginPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN]}>
              <DashboardLayout />
            </RoleGuard>
          }
        >
          <Route path={PATHS.dashboard} element={<DashboardPage />} />
          <Route path={PATHS.users} element={<UsersPage />} />
          <Route path={PATHS.devices} element={<DevicesPage />} />
          <Route path={PATHS.assignments} element={<AssignmentsPage />} />
          <Route path={PATHS.activityLogs} element={<ActivityLogsPage />} />
          <Route path={PATHS.settings} element={<SettingsPage />} />
        </Route>

        <Route
          element={
            <RoleGuard allowedRoles={[ROLES.USER]}>
              <UserLayout />
            </RoleGuard>
          }
        >
          <Route path={PATHS.home} element={<HomePage />} />
          <Route path={PATHS.profile} element={<ProfilePage />} />
          <Route path={PATHS.myDevice} element={<MyDevicePage />} />
        </Route>
      </Route>

      <Route path="*" element={<RootRedirect />} />
    </Routes>
  )
}
