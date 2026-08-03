import type { SvgIconComponent } from '@mui/icons-material'

export type ThemeMode = 'light' | 'dark'

export type LoginStatus = 'Online' | 'Offline'

export type AccentColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'

export interface NavItem {
  label: string
  path: string
  icon: SvgIconComponent
}

export interface DashboardStat {
  id: string
  title: string
  value: string | number
  subtitle?: string
  icon: SvgIconComponent
  color?: AccentColor
}

export interface LoginActivityRow {
  id: string
  employeeName: string
  email: string
  department: string
  floor: string
  deskNumber: string
  assignedDevice: string
  loginStatus: LoginStatus
  loginTime: string
}

export interface AssignmentRow {
  id: number
  employeeName: string
  deviceName: string
  assignedAt: string
  status: 'Active' | 'Pending' | 'Returned'
}

export interface ActivityLogRow {
  id: number
  actor: string
  action: string
  resource: string
  timestamp: string
}
