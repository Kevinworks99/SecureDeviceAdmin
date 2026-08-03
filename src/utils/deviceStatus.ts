import type { DeviceStatusLabel, DeviceStatusValue } from '@/models'

const STATUS_ALIASES: Record<string, DeviceStatusLabel> = {
  available: 'Available',
  assigned: 'Assigned',
  repair: 'Repair',
  under_repair: 'Repair',
  underrepair: 'Repair',
  maintenance: 'Repair',
  lost: 'Lost',
  deleted: 'Deleted',
}

const LABEL_TO_VALUE: Record<string, DeviceStatusValue> = {
  Available: 'available',
  Assigned: 'assigned',
  Repair: 'repair',
  Lost: 'lost',
  Deleted: 'deleted',
}

/** Normalize raw Firestore status values into display labels. */
export function normalizeDeviceStatus(value: unknown): DeviceStatusLabel | string {
  if (typeof value !== 'string' || !value.trim()) {
    return 'Available'
  }

  const trimmed = value.trim()
  const key = trimmed.toLowerCase().replace(/[\s-]+/g, '_')
  return STATUS_ALIASES[key] ?? trimmed
}

/** Normalize to the lowercase Firestore storage value. */
export function toDeviceStatusValue(value: unknown): DeviceStatusValue | string {
  if (typeof value !== 'string' || !value.trim()) {
    return 'available'
  }

  const trimmed = value.trim()
  if (LABEL_TO_VALUE[trimmed]) {
    return LABEL_TO_VALUE[trimmed]
  }

  const key = trimmed.toLowerCase().replace(/[\s-]+/g, '_')
  if (key === 'under_repair' || key === 'underrepair' || key === 'maintenance') {
    return 'repair'
  }

  if (
    key === 'available' ||
    key === 'assigned' ||
    key === 'repair' ||
    key === 'lost' ||
    key === 'deleted'
  ) {
    return key
  }

  return trimmed.toLowerCase()
}

export const DEVICE_STATUS_OPTIONS: DeviceStatusLabel[] = [
  'Available',
  'Assigned',
  'Repair',
  'Lost',
]

export const DEVICE_MANAGE_STATUS_OPTIONS: DeviceStatusValue[] = [
  'available',
  'assigned',
  'repair',
  'lost',
]
