import type { DocumentData, Timestamp } from 'firebase/firestore'
import type { Assignment, ActivityLog, Device, User } from '@/models'
import { parseUserRole } from '@/utils/authProfile'
import { normalizeDeviceStatus } from '@/utils/deviceStatus'

function asDisplayString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') {
    return value
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  return fallback
}

function asNullableString(value: unknown): string | null {
  if (typeof value === 'string' && value.length > 0) {
    return value
  }
  if (typeof value === 'number') {
    return String(value)
  }
  return null
}

function asTimestamp(value: unknown): Timestamp | null {
  if (
    value &&
    typeof value === 'object' &&
    'toMillis' in value &&
    typeof (value as Timestamp).toMillis === 'function'
  ) {
    return value as Timestamp
  }
  return null
}

/** Map a Firestore user document into the User model. */
export function mapUserDocument(id: string, data: DocumentData): User {
  const isLoggedIn =
    typeof data.isLoggedIn === 'boolean'
      ? data.isLoggedIn
      : data.loginStatus === 'Online'

  const uid = asDisplayString(data.uid, id)

  return {
    id,
    uid,
    fullName: asDisplayString(data.fullName || data.displayName || data.name),
    email: asDisplayString(data.email),
    employeeId: asDisplayString(data.employeeId),
    role: parseUserRole(data.role),
    status: asDisplayString(data.status, 'active'),
    department: asDisplayString(data.department),
    floor: asDisplayString(data.floor),
    deskNumber: asDisplayString(data.deskNumber),
    phoneNumber: asDisplayString(data.phoneNumber),
    notes: asDisplayString(data.notes),
    assignedDeviceId: asNullableString(data.assignedDeviceId),
    assignedDeviceModel: asNullableString(data.assignedDeviceModel),
    currentDeviceId: asNullableString(data.currentDeviceId),
    currentDeviceModel: asNullableString(data.currentDeviceModel),
    currentDeviceName: asNullableString(data.currentDeviceName),
    appVersion: asNullableString(data.appVersion),
    isLoggedIn,
    lastLoginAt: asTimestamp(data.lastLoginAt),
    lastLogoutAt: asTimestamp(data.lastLogoutAt),
    lastSeenAt: asTimestamp(data.lastSeenAt),
    createdAt: asTimestamp(data.createdAt),
    updatedAt: asTimestamp(data.updatedAt),
  }
}

/** Map a Firestore device document into the Device model. */
export function mapDeviceDocument(id: string, data: DocumentData): Device {
  const osVersion = asDisplayString(data.osVersion || data.androidVersion)
  const assignedUserId = asDisplayString(
    data.assignedUserId || data.assignedTo,
  )
  const assignedUserName = asDisplayString(
    data.assignedUserName || data.assignedEmployeeName,
  )

  return {
    id,
    deviceName: asDisplayString(data.deviceName || data.name),
    brand: asDisplayString(data.brand),
    platform: asDisplayString(data.platform, 'Android'),
    model: asDisplayString(data.model),
    assetTag: asDisplayString(data.assetTag),
    imei: asDisplayString(data.imei),
    serialNumber: asDisplayString(data.serialNumber),
    osVersion,
    androidVersion: osVersion,
    ram: asDisplayString(data.ram),
    storage: asDisplayString(data.storage),
    color: asDisplayString(data.color),
    purchaseDate: asDisplayString(data.purchaseDate),
    notes: asDisplayString(data.notes),
    deviceId: asDisplayString(data.deviceId || id),
    status: normalizeDeviceStatus(data.status),
    assignedUserId,
    assignedUserName,
    assignedFloor: asDisplayString(data.assignedFloor),
    assignedDeskNumber: asDisplayString(data.assignedDeskNumber),
    assignedTo: asNullableString(assignedUserId),
    assignedEmployeeName: asNullableString(assignedUserName),
    createdAt: asTimestamp(data.createdAt),
    updatedAt: asTimestamp(data.updatedAt),
  }
}

/** Map a Firestore assignment document into the Assignment model. */
export function mapAssignmentDocument(
  id: string,
  data: DocumentData,
): Assignment {
  return {
    id,
    assignmentId: asDisplayString(data.assignmentId, id),
    userId: asDisplayString(data.userId),
    userName: asDisplayString(data.userName),
    employeeId: asDisplayString(data.employeeId),
    department: asDisplayString(data.department),
    floor: asDisplayString(data.floor),
    deskNumber: asDisplayString(data.deskNumber),
    deviceId: asDisplayString(data.deviceId),
    deviceName: asDisplayString(data.deviceName),
    brand: asDisplayString(data.brand),
    platform: asDisplayString(data.platform),
    assetTag: asDisplayString(data.assetTag),
    assignedAt: asTimestamp(data.assignedAt),
    assignedBy: asDisplayString(data.assignedBy),
    status: asDisplayString(data.status, 'active'),
    notes: asDisplayString(data.notes),
    returnedAt: asTimestamp(data.returnedAt),
  }
}

function asMetadata(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return {}
}

/** Map a Firestore activity log document into the ActivityLog model. */
export function mapActivityLogDocument(
  id: string,
  data: DocumentData,
): ActivityLog {
  return {
    id,
    logId: asDisplayString(data.logId, id),
    action: asDisplayString(data.action),
    module: asDisplayString(data.module),
    performedByUid: asDisplayString(data.performedByUid),
    performedByName: asDisplayString(data.performedByName),
    targetId: asDisplayString(data.targetId),
    targetName: asDisplayString(data.targetName),
    description: asDisplayString(data.description),
    metadata: asMetadata(data.metadata),
    createdAt: asTimestamp(data.createdAt),
  }
}
