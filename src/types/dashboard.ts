import type { AssignmentStatus } from '@/models'

/** Live app session status from Firestore `users.isLoggedIn`. */
export type DashboardPresenceStatus = 'active' | 'inactive'

export interface DashboardPresenceRow {
  id: string
  fullName: string
  email: string
  currentDeviceName: string
  floor: string
  deskNumber: string
  notes: string
  lastLoginAt: number | null
  lastLogoutAt: number | null
  status: DashboardPresenceStatus
}

export interface DashboardAssignmentRow {
  id: string
  deviceName: string
  userName: string
  employeeId: string
  assignedAt: number | null
  status: AssignmentStatus
}

export interface DashboardUserRow {
  id: string
  fullName: string
  email: string
  employeeId: string
  department: string
  status: string
  createdAt: number | null
}

export interface DashboardDeviceRow {
  id: string
  deviceName: string
  brand: string
  platform: string
  status: string
  createdAt: number | null
  updatedAt: number | null
}
