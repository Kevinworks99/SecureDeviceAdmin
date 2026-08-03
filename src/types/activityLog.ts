import type { ActivityAction, ActivityModule } from '@/models'

export interface ActivityLogRow {
  id: string
  createdAt: number | null
  module: ActivityModule | string
  action: ActivityAction | string
  performedByName: string
  targetName: string
  description: string
  performedByUid: string
  targetId: string
  metadata: Record<string, unknown>
}

export const ACTIVITY_MODULES: ActivityModule[] = [
  'User',
  'Device',
  'Assignment',
  'Authentication',
]

export const ACTIVITY_ACTIONS: ActivityAction[] = [
  'USER_CREATED',
  'USER_UPDATED',
  'USER_DISABLED',
  'USER_ENABLED',
  'USER_DELETED',
  'DEVICE_CREATED',
  'DEVICE_UPDATED',
  'DEVICE_DELETED',
  'DEVICE_STATUS_CHANGED',
  'DEVICE_ASSIGNED',
  'DEVICE_RETURNED',
  'LOGIN',
  'LOGOUT',
]
