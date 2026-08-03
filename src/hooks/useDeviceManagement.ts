import { useEffect, useMemo, useState } from 'react'
import { firestoreService } from '@/services'
import type { Device } from '@/models'
import type { DeviceRow } from '@/types/device'
import { timestampToMillis } from '@/utils/formatTimestamp'
import { toDeviceStatusValue } from '@/utils/deviceStatus'

interface UseDeviceManagementResult {
  devices: Device[]
  rows: DeviceRow[]
  brands: string[]
  loading: boolean
  error: string | null
}

function purchaseDateSortValue(purchaseDate: string): number | null {
  if (!purchaseDate.trim()) {
    return null
  }
  const millis = Date.parse(purchaseDate)
  return Number.isNaN(millis) ? null : millis
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
    purchaseDateSort: purchaseDateSortValue(device.purchaseDate),
    updatedAt: timestampToMillis(device.updatedAt),
    notes: device.notes || '',
    ram: device.ram || '',
    storage: device.storage || '',
    color: device.color || '',
    assignedUserId: device.assignedUserId || device.assignedTo || '',
  }))
}

/** Real-time devices list for Device Management (excludes soft-deleted). */
export function useDeviceManagement(): UseDeviceManagementResult {
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
        setLoading(false)
        setError(subscribeError.message || 'Failed to load devices.')
      },
    )

    return unsubscribe
  }, [])

  const visibleDevices = useMemo(
    () =>
      devices.filter(
        (device) => toDeviceStatusValue(device.status) !== 'deleted',
      ),
    [devices],
  )

  const rows = useMemo(
    () => buildDeviceRows(visibleDevices),
    [visibleDevices],
  )

  const brands = useMemo(() => {
    const values = new Set<string>()
    for (const device of visibleDevices) {
      const brand = device.brand?.trim()
      if (brand) {
        values.add(brand)
      }
    }
    return Array.from(values).sort((a, b) => a.localeCompare(b))
  }, [visibleDevices])

  return {
    devices: visibleDevices,
    rows,
    brands,
    loading,
    error,
  }
}
