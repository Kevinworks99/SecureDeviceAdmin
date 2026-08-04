import type { Device } from '@/models'
import { timestampToMillis } from '@/utils/formatTimestamp'

function isBlank(value: string | null | undefined): boolean {
  const trimmed = String(value ?? '').trim()
  return !trimmed || trimmed === '—'
}

/** Login-created spam: no inventory identifiers and no device name. */
export function isLikelyAutoRegisteredDevice(device: Device): boolean {
  return (
    isBlank(device.deviceName) &&
    isBlank(device.assetTag) &&
    isBlank(device.imei) &&
    isBlank(device.serialNumber)
  )
}

function deviceRecency(device: Device): number {
  return (
    timestampToMillis(device.updatedAt) ??
    timestampToMillis(device.createdAt) ??
    0
  )
}

/**
 * Stable key for collapsing duplicate device docs.
 * Prefers real inventory IDs; falls back to brand/model/platform for auto-registered spam.
 */
export function getDeviceDedupeKey(device: Device): string {
  if (!isBlank(device.imei)) {
    return `imei:${device.imei.trim().toLowerCase()}`
  }
  if (!isBlank(device.serialNumber)) {
    return `serial:${device.serialNumber.trim().toLowerCase()}`
  }
  if (!isBlank(device.assetTag)) {
    return `asset:${device.assetTag.trim().toLowerCase()}`
  }
  if (!isBlank(device.deviceId) && device.deviceId !== device.id) {
    return `deviceId:${device.deviceId.trim().toLowerCase()}`
  }
  if (isLikelyAutoRegisteredDevice(device)) {
    const brand = device.brand.trim().toLowerCase()
    const model = device.model.trim().toLowerCase()
    const platform = device.platform.trim().toLowerCase()
    return `auto:${brand}|${model}|${platform}`
  }
  return `id:${device.id}`
}

/**
 * Keep one device per dedupe key (most recently updated).
 * Older duplicates are returned separately for optional cleanup.
 */
export function partitionDuplicateDevices(devices: Device[]): {
  unique: Device[]
  duplicates: Device[]
} {
  const bestByKey = new Map<string, Device>()
  const duplicates: Device[] = []

  const sorted = [...devices].sort(
    (a, b) => deviceRecency(b) - deviceRecency(a) || a.id.localeCompare(b.id),
  )

  for (const device of sorted) {
    const key = getDeviceDedupeKey(device)
    const existing = bestByKey.get(key)
    if (!existing) {
      bestByKey.set(key, device)
      continue
    }
    duplicates.push(device)
  }

  return {
    unique: Array.from(bestByKey.values()),
    duplicates,
  }
}

/** Devices list without duplicate docs (keeps newest per identity). */
export function dedupeDevices(devices: Device[]): Device[] {
  return partitionDuplicateDevices(devices).unique
}
