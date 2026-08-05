import { useEffect, useMemo, useState } from 'react'
import { firestoreService } from '@/services'
import type { Device } from '@/models'
import type { DeviceRow } from '@/types/device'
import { timestampToMillis } from '@/utils/formatTimestamp'
import { toDeviceStatusValue } from '@/utils/deviceStatus'
import { isRecoverableFirestoreListenError } from '@/utils/firestoreNetwork'

interface UseDevicesResult {
  rows: DeviceRow[]
  loading: boolean
  error: string | null
}

function buildDeviceRows(devices: Device[]): DeviceRow[] {
  return devices.map((device) => ({
    id: device.id,
    deviceName: device.deviceName || '—',
    brand: device.brand || '—',
    platform: device.platform || '—',
    model: device.model || '—',
    assetTag: device.assetTag || '—',
    imei: device.imei || '—',
    serialNumber: device.serialNumber || '—',
    osVersion: device.osVersion || device.androidVersion || '—',
    status: toDeviceStatusValue(device.status),
    assignedUser: device.assignedUserName || device.assignedEmployeeName || '—',
    floor: device.assignedFloor || '—',
    deskNumber: device.assignedDeskNumber || '—',
    purchaseDate: device.purchaseDate || '—',
    purchaseDateSort: null,
    updatedAt: timestampToMillis(device.updatedAt),
    notes: device.notes || '',
    ram: device.ram || '',
    storage: device.storage || '',
    color: device.color || '',
    assignedUserId: device.assignedUserId || device.assignedTo || '',
  }))
}

/**
 * Real-time device inventory from Firestore `devices`.
 * Prefer `useDeviceManagement` for the admin CRUD page.
 */
export function useDevices(): UseDevicesResult {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = firestoreService.subscribeToDevices(
      (nextDevices) => {
        setDevices(nextDevices)
        setLoading(false)
        setError(null)
      },
      (subscribeError) => {
        if (isRecoverableFirestoreListenError(subscribeError)) {
          setLoading(false)
          setError(null)
          return
        }

        setLoading(false)
        setError(subscribeError.message || 'Failed to load devices.')
      },
    )

    return unsubscribe
  }, [])

  const rows = useMemo(() => buildDeviceRows(devices), [devices])

  return {
    rows,
    loading,
    error,
  }
}
