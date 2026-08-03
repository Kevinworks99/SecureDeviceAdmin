import { useEffect, useMemo, useState } from 'react'
import { firestoreService } from '@/services'
import type { Device, User } from '@/models'
import type { EmployeeRow } from '@/types/employee'
import { timestampToMillis } from '@/utils/formatTimestamp'
import {
  buildDeviceLookup,
  resolveAssignedDevice,
} from '@/utils/resolveAssignedDevice'

interface UseEmployeesResult {
  rows: EmployeeRow[]
  loading: boolean
  error: string | null
}

function buildEmployeeRows(users: User[], devices: Device[]): EmployeeRow[] {
  const devicesById = buildDeviceLookup(devices)

  return users.map((user) => ({
    id: user.id,
    employeeName: user.fullName || '—',
    email: user.email || '—',
    department: user.department || '—',
    floor: user.floor || '—',
    deskNumber: user.deskNumber || '—',
    assignedDevice: resolveAssignedDevice(user, devicesById),
    assignedDeviceId: user.assignedDeviceId ?? user.currentDeviceId,
    loginStatus: user.isLoggedIn ? 'Online' : 'Offline',
    lastLoginAt: timestampToMillis(user.lastLoginAt),
    lastSeenAt: timestampToMillis(user.lastSeenAt),
  }))
}

/**
 * Real-time employees from Firestore `users`, enriched with `devices` names.
 */
export function useEmployees(): UseEmployeesResult {
  const [users, setUsers] = useState<User[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribeUsers = firestoreService.subscribeToUsers(
      (nextUsers) => {
        setUsers(nextUsers)
        setLoading(false)
        setError(null)
      },
      (subscribeError) => {
        setLoading(false)
        setError(subscribeError.message || 'Failed to load employees.')
      },
    )

    const unsubscribeDevices = firestoreService.subscribeToDevices(
      (nextDevices) => {
        setDevices(nextDevices)
      },
      (subscribeError) => {
        console.error('[Firestore] devices subscription failed', subscribeError)
      },
    )

    return () => {
      unsubscribeUsers()
      unsubscribeDevices()
    }
  }, [])

  const rows = useMemo(
    () => buildEmployeeRows(users, devices),
    [users, devices],
  )

  return {
    rows,
    loading,
    error,
  }
}
