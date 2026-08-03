import type { Device, User } from '@/models'

export function buildDeviceLookup(devices: Device[]): Map<string, Device> {
  const devicesById = new Map<string, Device>()

  for (const device of devices) {
    devicesById.set(device.id, device)
    if (device.deviceId) {
      devicesById.set(device.deviceId, device)
    }
  }

  return devicesById
}

/** Resolve a display label for a user's assigned / current device. */
export function resolveAssignedDevice(
  user: User,
  devicesById: Map<string, Device>,
): string {
  if (user.assignedDeviceModel) {
    return user.assignedDeviceModel
  }

  if (user.currentDeviceModel) {
    return user.currentDeviceModel
  }

  const lookupId = user.assignedDeviceId ?? user.currentDeviceId
  if (!lookupId) {
    return '—'
  }

  const device = devicesById.get(lookupId)
  if (!device) {
    return lookupId
  }

  const label =
    device.deviceName ||
    [device.brand, device.model].filter(Boolean).join(' ').trim() ||
    device.serialNumber

  return label || lookupId
}
