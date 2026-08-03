import type { Timestamp } from 'firebase/firestore'

/**
 * Canonical device statuses shown in the admin console.
 */
export type DeviceStatusLabel =
  | 'Available'
  | 'Assigned'
  | 'Repair'
  | 'Lost'
  | 'Deleted'

/** Stored Firestore status values (lowercase). */
export type DeviceStatusValue =
  | 'available'
  | 'assigned'
  | 'repair'
  | 'lost'
  | 'deleted'

export type DeviceStatus = DeviceStatusLabel | DeviceStatusValue | string

export type DevicePlatform = 'Android' | 'iOS' | string

/**
 * Locker device document stored in Firestore `devices/{id}`.
 */
export interface Device {
  id: string
  deviceName: string
  brand: string
  platform: DevicePlatform
  model: string
  assetTag: string
  imei: string
  serialNumber: string
  osVersion: string
  /** @deprecated Prefer osVersion; kept for legacy documents. */
  androidVersion: string
  ram: string
  storage: string
  color: string
  purchaseDate: string
  notes: string
  deviceId: string
  status: DeviceStatus
  assignedUserId: string
  assignedUserName: string
  assignedFloor: string
  assignedDeskNumber: string
  /** @deprecated Prefer assignedUserId; kept for legacy documents. */
  assignedTo: string | null
  /** @deprecated Prefer assignedUserName; kept for legacy documents. */
  assignedEmployeeName: string | null
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

export interface CreateDeviceInput {
  deviceName: string
  brand: string
  platform: DevicePlatform
  model: string
  assetTag: string
  imei: string
  serialNumber: string
  osVersion: string
  ram: string
  storage: string
  color: string
  purchaseDate: string
  notes: string
}

export interface UpdateDeviceInput extends CreateDeviceInput {
  status: DeviceStatusValue | string
  assignedUserId: string
  assignedUserName: string
  assignedFloor: string
  assignedDeskNumber: string
}
