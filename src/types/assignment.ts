import type { AssignmentStatus } from '@/models'

/** Row model for the Assignments DataGrid. */
export interface AssignmentRow {
  id: string
  deviceName: string
  platform: string
  brand: string
  assetTag: string
  assignedUser: string
  employeeId: string
  department: string
  floor: string
  deskNumber: string
  assignedAt: number | null
  status: AssignmentStatus
  notes: string
  deviceId: string
  userId: string
  assignedBy: string
  returnedAt: number | null
}

export interface AssignDeviceFormValues {
  userId: string
  deviceId: string
  assignmentDate: string
  notes: string
}
