import type { Timestamp } from 'firebase/firestore'

export type AssignmentStatus = 'active' | 'returned' | string

/**
 * Device assignment document stored in Firestore `assignments/{assignmentId}`.
 */
export interface Assignment {
  id: string
  assignmentId: string
  userId: string
  userName: string
  employeeId: string
  department: string
  floor: string
  deskNumber: string
  deviceId: string
  deviceName: string
  brand: string
  platform: string
  assetTag: string
  assignedAt: Timestamp | null
  assignedBy: string
  status: AssignmentStatus
  notes: string
  returnedAt: Timestamp | null
}

export interface AssignDeviceInput {
  userId: string
  deviceId: string
  assignmentDate: string
  notes: string
  assignedBy: string
}
