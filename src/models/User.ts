import type { Timestamp } from 'firebase/firestore'

export type UserRole = 'super_admin' | 'user'

export type UserStatus = 'active' | 'disabled' | 'deleted' | string

/**
 * Slim profile loaded after authentication for RBAC.
 */
export interface UserProfile {
  id: string
  fullName: string
  email: string
  role: UserRole
  status: UserStatus
}

/**
 * Full user document stored in Firestore `users/{uid}`.
 */
export interface User {
  id: string
  uid: string
  fullName: string
  email: string
  employeeId: string
  role: UserRole
  status: UserStatus
  department: string
  floor: string
  deskNumber: string
  phoneNumber: string
  notes: string
  assignedDeviceId: string | null
  assignedDeviceModel: string | null
  currentDeviceId: string | null
  currentDeviceModel: string | null
  currentDeviceName: string | null
  appVersion: string | null
  isLoggedIn: boolean
  lastLoginAt: Timestamp | null
  lastLogoutAt: Timestamp | null
  lastSeenAt: Timestamp | null
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

export interface CreateUserDocumentInput {
  uid: string
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

export interface UpdateUserDocumentInput {
  fullName: string
  department: string
  floor: string
  deskNumber: string
  phoneNumber: string
  role: UserRole
  status: UserStatus
  notes: string
}
