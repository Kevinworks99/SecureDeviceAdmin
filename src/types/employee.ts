import type { LoginStatus } from '@/types'

/**
 * Flat row model used by the Employees DataGrid.
 * Timestamps are stored as epoch ms for reliable sorting/filtering.
 */
export interface EmployeeRow {
  id: string
  employeeName: string
  email: string
  department: string
  floor: string
  deskNumber: string
  assignedDevice: string
  assignedDeviceId: string | null
  loginStatus: LoginStatus
  lastLoginAt: number | null
  lastSeenAt: number | null
}
