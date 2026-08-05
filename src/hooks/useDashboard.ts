import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/app/providers/AuthContext'
import { firestoreService } from '@/services'
import type { Assignment, Device, User } from '@/models'
import type {
  DashboardAssignmentRow,
  DashboardDeviceRow,
  DashboardPresenceRow,
  DashboardPresenceStatus,
  DashboardUserRow,
} from '@/types/dashboard'
import { timestampToMillis } from '@/utils/formatTimestamp'
import { toDeviceStatusValue } from '@/utils/deviceStatus'
import { isRecoverableFirestoreListenError } from '@/utils/firestoreNetwork'

interface UseDashboardResult {
  presenceUsers: DashboardPresenceRow[]
  recentAssignments: DashboardAssignmentRow[]
  recentUsers: DashboardUserRow[]
  recentDevices: DashboardDeviceRow[]
  assignments: Assignment[]
  loading: boolean
  error: string | null
}

function isDeletedStatus(status: unknown): boolean {
  return String(status ?? '')
    .trim()
    .toLowerCase() === 'deleted'
}

/** Live login presence from Android app `isLoggedIn` field. */
function buildPresenceUsers(users: User[]): DashboardPresenceRow[] {
  return users
    .filter((user) => !isDeletedStatus(user.status))
    .map((user) => {
      const status: DashboardPresenceStatus = user.isLoggedIn
        ? 'active'
        : 'inactive'

      return {
        id: user.id,
        fullName: user.fullName || '—',
        email: user.email || '—',
        currentDeviceName: user.currentDeviceName || '—',
        floor: user.floor || '—',
        deskNumber: user.deskNumber || '—',
        notes: user.notes || '—',
        lastLoginAt: timestampToMillis(user.lastLoginAt),
        lastLogoutAt: timestampToMillis(user.lastLogoutAt),
        status,
      }
    })
    .sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === 'active' ? -1 : 1
      }
      return a.fullName.localeCompare(b.fullName)
    })
}

function buildRecentAssignments(
  assignments: Assignment[],
): DashboardAssignmentRow[] {
  return [...assignments]
    .sort(
      (a, b) =>
        (timestampToMillis(b.assignedAt) ?? 0) -
        (timestampToMillis(a.assignedAt) ?? 0),
    )
    .slice(0, 10)
    .map((assignment) => ({
      id: assignment.id,
      deviceName: assignment.deviceName || '—',
      userName: assignment.userName || '—',
      employeeId: assignment.employeeId || '—',
      assignedAt: timestampToMillis(assignment.assignedAt),
      status: assignment.status || 'active',
    }))
}

function buildRecentUsers(users: User[]): DashboardUserRow[] {
  return users
    .filter((user) => !isDeletedStatus(user.status))
    .map((user) => ({
      id: user.id,
      fullName: user.fullName || '—',
      email: user.email || '—',
      employeeId: user.employeeId || '—',
      department: user.department || '—',
      status: user.status || 'active',
      createdAt: timestampToMillis(user.createdAt),
    }))
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
    .slice(0, 10)
}

function buildRecentDevices(devices: Device[]): DashboardDeviceRow[] {
  return devices
    .filter((device) => !isDeletedStatus(device.status))
    .map((device) => ({
      id: device.id,
      deviceName: device.deviceName || '—',
      brand: device.brand || '—',
      platform: device.platform || '—',
      status: toDeviceStatusValue(device.status),
      createdAt: timestampToMillis(device.createdAt),
      updatedAt: timestampToMillis(device.updatedAt),
    }))
    .sort(
      (a, b) =>
        (b.createdAt ?? b.updatedAt ?? 0) - (a.createdAt ?? a.updatedAt ?? 0),
    )
    .slice(0, 10)
}

function toDashboardSubscribeError(
  collectionLabel: string,
  subscribeError: Error,
): string {
  if (isRecoverableFirestoreListenError(subscribeError)) {
    return ''
  }

  if (subscribeError.message.toLowerCase().includes('permission')) {
    return `Unable to load ${collectionLabel}. Firestore rules for this collection may be missing or denying signed-in reads.`
  }
  return subscribeError.message || `Failed to load ${collectionLabel}.`
}

/**
 * Real-time dashboard: live user presence + recent users / devices / assignments.
 */
export function useDashboard(): UseDashboardResult {
  const { isAuthenticated } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [usersReady, setUsersReady] = useState(false)
  const [devicesReady, setDevicesReady] = useState(false)
  const [assignmentsReady, setAssignmentsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      setUsers([])
      setDevices([])
      setAssignments([])
      setUsersReady(false)
      setDevicesReady(false)
      setAssignmentsReady(false)
      setError(null)
      return
    }

    setUsersReady(false)
    setDevicesReady(false)
    setAssignmentsReady(false)
    setError(null)

    const unsubscribeUsers = firestoreService.subscribeToUsers(
      (nextUsers) => {
        setUsers(nextUsers)
        setUsersReady(true)
        setError(null)
      },
      (subscribeError) => {
        if (isRecoverableFirestoreListenError(subscribeError)) {
          setUsersReady(true)
          return
        }

        setUsersReady(true)
        setError(toDashboardSubscribeError('users', subscribeError))
      },
    )

    const unsubscribeDevices = firestoreService.subscribeToDevices(
      (nextDevices) => {
        setDevices(nextDevices)
        setDevicesReady(true)
      },
      (subscribeError) => {
        if (isRecoverableFirestoreListenError(subscribeError)) {
          setDevicesReady(true)
          return
        }

        setDevicesReady(true)
        setError((prev) =>
          prev ?? toDashboardSubscribeError('devices', subscribeError),
        )
      },
    )

    const unsubscribeAssignments = firestoreService.subscribeToAssignments(
      (nextAssignments) => {
        setAssignments(nextAssignments)
        setAssignmentsReady(true)
      },
      (subscribeError) => {
        if (isRecoverableFirestoreListenError(subscribeError)) {
          setAssignmentsReady(true)
          return
        }

        setAssignmentsReady(true)
        setError((prev) =>
          prev ?? toDashboardSubscribeError('assignments', subscribeError),
        )
      },
    )

    return () => {
      unsubscribeUsers()
      unsubscribeDevices()
      unsubscribeAssignments()
    }
  }, [isAuthenticated])

  const presenceUsers = useMemo(() => buildPresenceUsers(users), [users])

  const recentAssignments = useMemo(
    () => buildRecentAssignments(assignments),
    [assignments],
  )

  const recentUsers = useMemo(() => buildRecentUsers(users), [users])

  const recentDevices = useMemo(() => buildRecentDevices(devices), [devices])

  return {
    presenceUsers,
    recentAssignments,
    recentUsers,
    recentDevices,
    assignments,
    loading: !(usersReady && devicesReady && assignmentsReady),
    error,
  }
}
