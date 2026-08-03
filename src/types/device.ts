import type { DevicePlatform, DeviceStatus, DeviceStatusValue } from '@/models'

/** Row model for the Devices DataGrid. */
export interface DeviceRow {
  id: string
  deviceName: string
  brand: string
  platform: string
  model: string
  assetTag: string
  imei: string
  serialNumber: string
  osVersion: string
  status: DeviceStatus
  assignedUser: string
  floor: string
  deskNumber: string
  purchaseDate: string
  purchaseDateSort: number | null
  updatedAt: number | null
  notes: string
  ram: string
  storage: string
  color: string
  assignedUserId: string
}

export interface DeviceFormValues {
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
  status?: DeviceStatusValue | string
  assignedUserId?: string
  assignedUserName?: string
  assignedFloor?: string
  assignedDeskNumber?: string
}

export const DEVICE_PLATFORMS = ['Android', 'iOS'] as const

export const DEVICE_STATUS_FILTER_VALUES: DeviceStatusValue[] = [
  'available',
  'assigned',
  'repair',
  'lost',
]
