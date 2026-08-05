import { useEffect, useMemo, useState } from 'react'
import { firestoreService } from '@/services'
import type { Device, User } from '@/models'
import type { UserRow } from '@/types/userManagement'
import { timestampToMillis } from '@/utils/formatTimestamp'
import { isRecoverableFirestoreListenError } from '@/utils/firestoreNetwork'
import {
  buildDeviceLookup,
  resolveAssignedDevice,
} from '@/utils/resolveAssignedDevice'

interface UseUserManagementResult {
  users: User[]
  devices: Device[]
  rows: UserRow[]
  departments: string[]
  loading: boolean
  error: string | null
}

function buildUserRows(users: User[], devices: Device[]): UserRow[] {
  const devicesById = buildDeviceLookup(devices)

  return users.map((user) => ({
    id: user.id,
    fullName: user.fullName || '—',
    email: user.email || '—',
    employeeId: user.employeeId || '—',
    department: user.department || '—',
    floor: user.floor || '—',
    deskNumber: user.deskNumber || '—',
    phoneNumber: user.phoneNumber || '—',
    role: user.role,
    status: user.status,
    assignedDevice: resolveAssignedDevice(user, devicesById),
    notes: user.notes || '',
    createdAt: timestampToMillis(user.createdAt),
  }))
}

/** Real-time users list for the User Management module. */
export function useUserManagement(): UseUserManagementResult {
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
        setError(subscribeError.message || 'Failed to load users.')
      },
    )

    const unsubscribeDevices = firestoreService.subscribeToDevices(
      (nextDevices) => {
        setDevices(nextDevices)
      },
      (subscribeError) => {
        if (isRecoverableFirestoreListenError(subscribeError)) {
          return
        }

        console.error('[Firestore] devices subscription failed', subscribeError)
      },
    )

    return () => {
      unsubscribeUsers()
      unsubscribeDevices()
    }
  }, [])

  const rows = useMemo(
    () => buildUserRows(users, devices),
    [users, devices],
  )

  const departments = useMemo(() => {
    const values = new Set<string>()
    for (const user of users) {
      const department = user.department?.trim()
      if (department) {
        values.add(department)
      }
    }
    return Array.from(values).sort((a, b) => a.localeCompare(b))
  }, [users])

  return {
    users,
    devices,
    rows,
    departments,
    loading,
    error,
  }
}
