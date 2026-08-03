import { useEffect, useMemo, useState } from 'react'
import { firestoreService } from '@/services'
import type { Assignment, Device, User } from '@/models'
import type { AssignmentRow } from '@/types/assignment'
import { timestampToMillis } from '@/utils/formatTimestamp'

interface UseAssignmentsResult {
  assignments: Assignment[]
  users: User[]
  devices: Device[]
  rows: AssignmentRow[]
  departments: string[]
  loading: boolean
  error: string | null
}

function buildAssignmentRows(assignments: Assignment[]): AssignmentRow[] {
  return assignments.map((assignment) => ({
    id: assignment.id,
    deviceName: assignment.deviceName || '—',
    platform: assignment.platform || '—',
    brand: assignment.brand || '—',
    assetTag: assignment.assetTag || '—',
    assignedUser: assignment.userName || '—',
    employeeId: assignment.employeeId || '—',
    department: assignment.department || '—',
    floor: assignment.floor || '—',
    deskNumber: assignment.deskNumber || '—',
    assignedAt: timestampToMillis(assignment.assignedAt),
    status: assignment.status || 'active',
    notes: assignment.notes || '',
    deviceId: assignment.deviceId,
    userId: assignment.userId,
    assignedBy: assignment.assignedBy,
    returnedAt: timestampToMillis(assignment.returnedAt),
  }))
}

/** Real-time assignments with users/devices for the assign wizard. */
export function useAssignments(): UseAssignmentsResult {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [assignmentsReady, setAssignmentsReady] = useState(false)
  const [usersReady, setUsersReady] = useState(false)
  const [devicesReady, setDevicesReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribeAssignments = firestoreService.subscribeToAssignments(
      (next) => {
        setAssignments(next)
        setAssignmentsReady(true)
        setError(null)
      },
      (subscribeError) => {
        setAssignmentsReady(true)
        setError(subscribeError.message || 'Failed to load assignments.')
      },
    )

    const unsubscribeUsers = firestoreService.subscribeToUsers(
      (next) => {
        setUsers(next)
        setUsersReady(true)
      },
      () => {
        setUsersReady(true)
      },
    )

    const unsubscribeDevices = firestoreService.subscribeToDevices(
      (next) => {
        setDevices(next)
        setDevicesReady(true)
      },
      () => {
        setDevicesReady(true)
      },
    )

    return () => {
      unsubscribeAssignments()
      unsubscribeUsers()
      unsubscribeDevices()
    }
  }, [])

  const rows = useMemo(
    () => buildAssignmentRows(assignments),
    [assignments],
  )

  const departments = useMemo(() => {
    const values = new Set<string>()
    for (const assignment of assignments) {
      const department = assignment.department?.trim()
      if (department) {
        values.add(department)
      }
    }
    return Array.from(values).sort((a, b) => a.localeCompare(b))
  }, [assignments])

  return {
    assignments,
    users,
    devices,
    rows,
    departments,
    loading: !(assignmentsReady && usersReady && devicesReady),
    error,
  }
}
