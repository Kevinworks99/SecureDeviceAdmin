import type { Timestamp } from 'firebase/firestore'

export type ActivityModule = 'User' | 'Device' | 'Assignment' | 'Authentication'

export type ActivityAction =
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DISABLED'
  | 'USER_ENABLED'
  | 'USER_DELETED'
  | 'DEVICE_CREATED'
  | 'DEVICE_UPDATED'
  | 'DEVICE_DELETED'
  | 'DEVICE_STATUS_CHANGED'
  | 'DEVICE_ASSIGNED'
  | 'DEVICE_RETURNED'
  | 'LOGIN'
  | 'LOGOUT'

export interface ActivityLog {
  id: string
  logId: string
  action: ActivityAction | string
  module: ActivityModule | string
  performedByUid: string
  performedByName: string
  targetId: string
  targetName: string
  description: string
  metadata: Record<string, unknown>
  createdAt: Timestamp | null
}

export interface ActivityActor {
  uid: string
  name: string
}

export interface LogActivityInput {
  action: ActivityAction
  module: ActivityModule
  targetId?: string
  targetName?: string
  description: string
  metadata?: Record<string, unknown>
  actor?: ActivityActor
}
