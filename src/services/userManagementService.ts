import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { AUTH_STATIC_PASSWORD } from '@/constants/auth'
import { FIRESTORE_COLLECTIONS } from '@/firebase/collections'
import { db } from '@/firebase/firebase'
import type {
  CreateUserDocumentInput,
  UpdateUserDocumentInput,
  User,
  UserStatus,
} from '@/models'
import { createAuthUserAccount } from '@/services/adminAuthService'
import { logActivity } from '@/services/activityLogService'
import { firestoreService } from '@/services/firestoreService'
import type { CreateUserFormValues } from '@/types/userManagement'
import { mapFirestoreError } from '@/utils/firestoreNetwork'

export class UserManagementService {
  private usersCollection() {
    return collection(db, FIRESTORE_COLLECTIONS.users)
  }

  private userDoc(uid: string) {
    return doc(db, FIRESTORE_COLLECTIONS.users, uid)
  }

  async isEmailTaken(email: string, excludeUid?: string): Promise<boolean> {
    const snapshot = await getDocs(
      query(this.usersCollection(), where('email', '==', email.trim().toLowerCase())),
    )
    return snapshot.docs.some((document) => document.id !== excludeUid)
  }

  async isEmployeeIdTaken(
    employeeId: string,
    excludeUid?: string,
  ): Promise<boolean> {
    const snapshot = await getDocs(
      query(this.usersCollection(), where('employeeId', '==', employeeId.trim())),
    )
    return snapshot.docs.some((document) => document.id !== excludeUid)
  }

  async createUser(input: CreateUserFormValues): Promise<User> {
    const email = input.email.trim().toLowerCase()

    if (await this.isEmailTaken(email)) {
      throw new Error('This email is already in use.')
    }

    if (await this.isEmployeeIdTaken(input.employeeId)) {
      throw new Error('This Employee ID is already in use.')
    }

    const uid = await createAuthUserAccount(email, AUTH_STATIC_PASSWORD)

    const document: CreateUserDocumentInput = {
      uid,
      fullName: input.fullName.trim(),
      email,
      employeeId: input.employeeId.trim(),
      department: input.department.trim(),
      floor: input.floor.trim(),
      deskNumber: input.deskNumber.trim(),
      phoneNumber: input.phoneNumber.trim(),
      role: input.role,
      status: input.status,
      notes: input.notes.trim(),
    }

    try {
      await setDoc(this.userDoc(uid), {
        ...document,
        assignedDeviceId: '',
        assignedDeviceModel: '',
        isLoggedIn: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      throw new Error(
        mapFirestoreError(
          error,
          'Auth account created but Firestore document failed. Contact support.',
        ),
      )
    }

    const created = await firestoreService.getUserById(uid)
    if (!created) {
      throw new Error('User created but could not be loaded.')
    }

    await logActivity({
      action: 'USER_CREATED',
      module: 'User',
      targetId: uid,
      targetName: created.fullName || created.email,
      description: `Created user ${created.fullName || created.email}`,
      metadata: {
        email: created.email,
        employeeId: created.employeeId,
        role: created.role,
        status: created.status,
      },
    })

    return created
  }

  async updateUser(uid: string, input: UpdateUserDocumentInput): Promise<void> {
    const existing = await firestoreService.getUserById(uid)

    try {
      await updateDoc(this.userDoc(uid), {
        fullName: input.fullName.trim(),
        department: input.department.trim(),
        floor: input.floor.trim(),
        deskNumber: input.deskNumber.trim(),
        phoneNumber: input.phoneNumber.trim(),
        role: input.role,
        status: input.status,
        notes: input.notes.trim(),
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      throw new Error(mapFirestoreError(error, 'Failed to update user.'))
    }

    const targetName = input.fullName.trim() || existing?.fullName || uid

    await logActivity({
      action: 'USER_UPDATED',
      module: 'User',
      targetId: uid,
      targetName,
      description: `Updated user ${targetName}`,
      metadata: {
        previousStatus: existing?.status,
        status: input.status,
        role: input.role,
        department: input.department,
      },
    })

    if (existing && existing.status !== input.status) {
      if (input.status === 'disabled') {
        await logActivity({
          action: 'USER_DISABLED',
          module: 'User',
          targetId: uid,
          targetName,
          description: `Disabled user ${targetName}`,
          metadata: { previousStatus: existing.status },
        })
      } else if (input.status === 'active' && existing.status === 'disabled') {
        await logActivity({
          action: 'USER_ENABLED',
          module: 'User',
          targetId: uid,
          targetName,
          description: `Enabled user ${targetName}`,
          metadata: { previousStatus: existing.status },
        })
      } else if (input.status === 'deleted') {
        await logActivity({
          action: 'USER_DELETED',
          module: 'User',
          targetId: uid,
          targetName,
          description: `Deleted user ${targetName}`,
          metadata: { previousStatus: existing.status },
        })
      }
    }
  }

  async setUserStatus(uid: string, status: UserStatus): Promise<void> {
    const existing = await firestoreService.getUserById(uid)

    try {
      const updates: Record<string, unknown> = {
        status,
        updatedAt: serverTimestamp(),
      }

      if (status !== 'active') {
        updates.isLoggedIn = false
      }

      await updateDoc(this.userDoc(uid), updates)
    } catch (error) {
      throw new Error(mapFirestoreError(error, 'Failed to update user status.'))
    }

    const targetName = existing?.fullName || existing?.email || uid

    if (status === 'disabled') {
      await logActivity({
        action: 'USER_DISABLED',
        module: 'User',
        targetId: uid,
        targetName,
        description: `Disabled user ${targetName}`,
        metadata: { previousStatus: existing?.status },
      })
    } else if (status === 'active') {
      await logActivity({
        action: 'USER_ENABLED',
        module: 'User',
        targetId: uid,
        targetName,
        description: `Enabled user ${targetName}`,
        metadata: { previousStatus: existing?.status },
      })
    } else if (status === 'deleted') {
      await logActivity({
        action: 'USER_DELETED',
        module: 'User',
        targetId: uid,
        targetName,
        description: `Deleted user ${targetName}`,
        metadata: { previousStatus: existing?.status },
      })
    }
  }

  async softDeleteUser(uid: string): Promise<void> {
    return this.setUserStatus(uid, 'deleted')
  }

  async toggleUserEnabled(uid: string, currentStatus: UserStatus): Promise<void> {
    const nextStatus: UserStatus =
      currentStatus === 'active' ? 'disabled' : 'active'
    return this.setUserStatus(uid, nextStatus)
  }
}

export const userManagementService = new UserManagementService()
