import { useEffect, useMemo, useRef, useState } from 'react'
import { firestoreService } from '@/services'
import { deviceManagementService } from '@/services/deviceManagementService'
import type { Device } from '@/models'
import type { DeviceRow } from '@/types/device'
import {
  dedupeDevices,
  partitionDuplicateDevices,
} from '@/utils/dedupeDevices'
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

/** Real-time devices list for Device Management (excludes soft-deleted + duplicates). */
export function useDeviceManagement(): UseDeviceManagementResult {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const cleanedDuplicateIdsRef = useRef(new Set<string>())

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

  const activeDevices = useMemo(
    () =>
      devices.filter(
        (device) => toDeviceStatusValue(device.status) !== 'deleted',
      ),
    [devices],
  )

  const visibleDevices = useMemo(
    () => dedupeDevices(activeDevices),
    [activeDevices],
  )

  // Soft-delete older duplicate docs once so they stay gone across the app.
  useEffect(() => {
    const { duplicates } = partitionDuplicateDevices(activeDevices)
    const pending = duplicates.filter(
      (device) => !cleanedDuplicateIdsRef.current.has(device.id),
    )
    if (pending.length === 0) {
      return
    }

    for (const device of pending) {
      cleanedDuplicateIdsRef.current.add(device.id)
    }

    void Promise.all(
      pending.map(async (device) => {
        try {
          await deviceManagementService.softDeleteDevice(device.id)
        } catch (cleanupError) {
          cleanedDuplicateIdsRef.current.delete(device.id)
          console.error(
            '[devices] failed to soft-delete duplicate',
            device.id,
            cleanupError,
          )
        }
      }),
    )
  }, [activeDevices])

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
