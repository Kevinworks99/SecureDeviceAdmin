import type { UserRole, UserStatus } from '@/models'

/** Row model for the Users DataGrid. */
export interface UserRow {
  id: string
  fullName: string
  email: string
  employeeId: string
  department: string
  floor: string
  deskNumber: string
  phoneNumber: string
  role: UserRole
  status: UserStatus
  assignedDevice: string
  notes: string
  createdAt: number | null
}

export interface CreateUserFormValues {
  fullName: string
  email: string
  employeeId: string
  department: string
  floor: string
  deskNumber: string
  phoneNumber: string
  role: UserRole
  status: UserStatus
  notes: string
}

export interface EditUserFormValues {
  fullName: string
  department: string
  floor: string
  deskNumber: string
  phoneNumber: string
  role: UserRole
  status: UserStatus
  notes: string
}
