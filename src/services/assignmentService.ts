import {
  Timestamp,
  doc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'
import { FIRESTORE_COLLECTIONS } from '@/firebase/collections'
import { db } from '@/firebase/firebase'
import type { AssignDeviceInput, Assignment } from '@/models'
import { logActivity } from '@/services/activityLogService'
import { firestoreService } from '@/services/firestoreService'
import { mapFirestoreError } from '@/utils/firestoreNetwork'
import { toDeviceStatusValue } from '@/utils/deviceStatus'

function hasAssignedDevice(assignedDeviceId: unknown): boolean {
  return typeof assignedDeviceId === 'string' && assignedDeviceId.trim().length > 0
}

function parseAssignmentDate(dateValue: string): Timestamp {
  const trimmed = dateValue.trim()
  if (!trimmed) {
    return Timestamp.now()
  }

  const parsed = new Date(`${trimmed}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return Timestamp.now()
  }

  return Timestamp.fromDate(parsed)
}

function deviceModelLabel(device: {
  deviceName?: string
  brand?: string
  model?: string
}): string {
  if (device.deviceName?.trim()) {
    return device.deviceName.trim()
  }

  return [device.brand, device.model].filter(Boolean).join(' ').trim()
}

/**
 * Assignment service — assign / return devices with atomic Firestore transactions.
 */
export class AssignmentService {
  private assignmentDoc(assignmentId: string) {
    return doc(db, FIRESTORE_COLLECTIONS.assignments, assignmentId)
  }

  private userDoc(userId: string) {
    return doc(db, FIRESTORE_COLLECTIONS.users, userId)
  }

  private deviceDoc(deviceId: string) {
    return doc(db, FIRESTORE_COLLECTIONS.devices, deviceId)
  }

  async assignDevice(input: AssignDeviceInput): Promise<Assignment> {
    const assignmentRef = doc(db, FIRESTORE_COLLECTIONS.assignments)
    const userRef = this.userDoc(input.userId)
    const deviceRef = this.deviceDoc(input.deviceId)

    try {
      await runTransaction(db, async (transaction) => {
        const userSnap = await transaction.get(userRef)
        const deviceSnap = await transaction.get(deviceRef)

        if (!userSnap.exists()) {
          throw new Error('Selected user was not found.')
        }

        if (!deviceSnap.exists()) {
          throw new Error('Selected device was not found.')
        }

        const userData = userSnap.data()
        const deviceData = deviceSnap.data()

        if (userData.status !== 'active') {
          throw new Error('Only active users can receive a device.')
        }

        if (userData.role !== 'user') {
          throw new Error('Devices can only be assigned to users with role "user".')
        }

        if (hasAssignedDevice(userData.assignedDeviceId)) {
          throw new Error(
            'This user already has a device assigned. Return it before assigning another.',
          )
        }

        const deviceStatus = toDeviceStatusValue(deviceData.status)
        if (deviceStatus !== 'available') {
          throw new Error(
            'This device is not available. Only available devices can be assigned.',
          )
        }

        const assignedAt = parseAssignmentDate(input.assignmentDate)
        const userName = String(
          userData.fullName || userData.displayName || userData.name || '',
        )
        const deviceName = String(deviceData.deviceName || deviceData.name || '')
        const brand = String(deviceData.brand || '')
        const platform = String(deviceData.platform || 'Android')
        const assetTag = String(deviceData.assetTag || '')
        const floor = String(userData.floor || '')
        const deskNumber = String(userData.deskNumber || '')

        transaction.set(assignmentRef, {
          assignmentId: assignmentRef.id,
          userId: input.userId,
          userName,
          employeeId: String(userData.employeeId || ''),
          department: String(userData.department || ''),
          floor,
          deskNumber,
          deviceId: input.deviceId,
          deviceName,
          brand,
          platform,
          assetTag,
          assignedAt,
          assignedBy: input.assignedBy,
          status: 'active',
          notes: input.notes.trim(),
          returnedAt: null,
        })

        transaction.update(deviceRef, {
          status: 'assigned',
          assignedUserId: input.userId,
          assignedUserName: userName,
          assignedFloor: floor,
          assignedDeskNumber: deskNumber,
          updatedAt: serverTimestamp(),
        })

        transaction.update(userRef, {
          assignedDeviceId: input.deviceId,
          assignedDeviceModel: deviceModelLabel({
            deviceName,
            brand,
            model: String(deviceData.model || ''),
          }),
          updatedAt: serverTimestamp(),
        })
      })

      const created = await firestoreService.getAssignmentById(assignmentRef.id)
      if (!created) {
        throw new Error('Assignment created but could not be loaded.')
      }

      await logActivity({
        action: 'DEVICE_ASSIGNED',
        module: 'Assignment',
        targetId: created.id,
        targetName: created.deviceName,
        description: `Assigned ${created.deviceName} to ${created.userName}`,
        metadata: {
          assignmentId: created.id,
          userId: created.userId,
          userName: created.userName,
          employeeId: created.employeeId,
          deviceId: created.deviceId,
          deviceName: created.deviceName,
          assetTag: created.assetTag,
          assignedBy: created.assignedBy,
        },
      })

      return created
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes('not found') ||
          error.message.includes('already') ||
          error.message.includes('not available') ||
          error.message.includes('Only ') ||
          error.message.includes('Devices can only'))
      ) {
        throw error
      }
      throw new Error(mapFirestoreError(error, 'Failed to assign device.'))
    }
  }

  async returnDevice(assignmentId: string): Promise<void> {
    const assignmentRef = this.assignmentDoc(assignmentId)
    type ReturnSnapshot = {
      deviceName: string
      userName: string
      userId: string
      deviceId: string
      employeeId: string
      assetTag: string
    }
    let returnedSnapshot: ReturnSnapshot | null = null

    try {
      await runTransaction(db, async (transaction) => {
        const assignmentSnap = await transaction.get(assignmentRef)

        if (!assignmentSnap.exists()) {
          throw new Error('Assignment was not found.')
        }

        const assignment = assignmentSnap.data()
        if (assignment.status === 'returned') {
          throw new Error('This device has already been returned.')
        }

        const userId = String(assignment.userId || '')
        const deviceId = String(assignment.deviceId || '')

        if (!userId || !deviceId) {
          throw new Error('Assignment is missing user or device references.')
        }

        const snapshot: ReturnSnapshot = {
          deviceName: String(assignment.deviceName || ''),
          userName: String(assignment.userName || ''),
          userId,
          deviceId,
          employeeId: String(assignment.employeeId || ''),
          assetTag: String(assignment.assetTag || ''),
        }
        returnedSnapshot = snapshot

        const userRef = this.userDoc(userId)
        const deviceRef = this.deviceDoc(deviceId)

        const userSnap = await transaction.get(userRef)
        const deviceSnap = await transaction.get(deviceRef)

        transaction.update(assignmentRef, {
          status: 'returned',
          returnedAt: serverTimestamp(),
        })

        if (deviceSnap.exists()) {
          transaction.update(deviceRef, {
            status: 'available',
            assignedUserId: '',
            assignedUserName: '',
            assignedFloor: '',
            assignedDeskNumber: '',
            updatedAt: serverTimestamp(),
          })
        }

        if (userSnap.exists()) {
          const currentAssignedId = String(
            userSnap.data().assignedDeviceId || '',
          )
          if (!currentAssignedId || currentAssignedId === deviceId) {
            transaction.update(userRef, {
              assignedDeviceId: '',
              assignedDeviceModel: '',
              updatedAt: serverTimestamp(),
            })
          }
        }
      })

      const returned = returnedSnapshot as ReturnSnapshot | null
      if (returned) {
        await logActivity({
          action: 'DEVICE_RETURNED',
          module: 'Assignment',
          targetId: assignmentId,
          targetName: returned.deviceName,
          description: `Returned ${returned.deviceName} from ${returned.userName}`,
          metadata: {
            assignmentId,
            userId: returned.userId,
            userName: returned.userName,
            employeeId: returned.employeeId,
            deviceId: returned.deviceId,
            deviceName: returned.deviceName,
            assetTag: returned.assetTag,
          },
        })
      }
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes('not found') ||
          error.message.includes('already been returned') ||
          error.message.includes('missing'))
      ) {
        throw error
      }
      throw new Error(mapFirestoreError(error, 'Failed to return device.'))
    }
  }
}

export const assignmentService = new AssignmentService()
