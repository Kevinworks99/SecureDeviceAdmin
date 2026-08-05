import {
  collection,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  onSnapshot,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore'
import { FIRESTORE_COLLECTIONS } from '@/firebase/collections'
import { db } from '@/firebase/firebase'
import type { Assignment, Device, User } from '@/models'
import {
  mapAssignmentDocument,
  mapDeviceDocument,
  mapUserDocument,
} from '@/utils/firestoreMappers'
import {
  isRecoverableFirestoreListenError,
  mapFirestoreError,
  withFirestoreRetry,
} from '@/utils/firestoreNetwork'

/**
 * Firestore service for Secure Device Locker collections.
 */
export class FirestoreService {
  private readonly firestore: Firestore

  constructor(firestore: Firestore = db) {
    this.firestore = firestore
  }

  private usersCollection() {
    return collection(this.firestore, FIRESTORE_COLLECTIONS.users)
  }

  private devicesCollection() {
    return collection(this.firestore, FIRESTORE_COLLECTIONS.devices)
  }

  private assignmentsCollection() {
    return collection(this.firestore, FIRESTORE_COLLECTIONS.assignments)
  }

  private userDoc(userId: string) {
    return doc(this.firestore, FIRESTORE_COLLECTIONS.users, userId)
  }

  private assignmentDoc(assignmentId: string) {
    return doc(this.firestore, FIRESTORE_COLLECTIONS.assignments, assignmentId)
  }

  /** Fetch all users from the `users` collection. */
  async getUsers(): Promise<User[]> {
    try {
      return await withFirestoreRetry(async () => {
        const snapshot = await getDocs(this.usersCollection())
        return snapshot.docs.map((document) =>
          mapUserDocument(document.id, document.data()),
        )
      }, this.firestore)
    } catch (error) {
      throw new Error(mapFirestoreError(error, 'Failed to load users.'))
    }
  }

  /** Fetch all devices from the `devices` collection. */
  async getDevices(): Promise<Device[]> {
    try {
      return await withFirestoreRetry(async () => {
        const snapshot = await getDocs(this.devicesCollection())
        return snapshot.docs.map((document) =>
          mapDeviceDocument(document.id, document.data()),
        )
      }, this.firestore)
    } catch (error) {
      throw new Error(mapFirestoreError(error, 'Failed to load devices.'))
    }
  }

  /** Fetch a single user by document id (always from server for auth accuracy). */
  async getUserById(id: string): Promise<User | null> {
    try {
      return await withFirestoreRetry(async () => {
        const snapshot = await getDocFromServer(this.userDoc(id))

        if (!snapshot.exists()) {
          return null
        }

        return mapUserDocument(snapshot.id, snapshot.data())
      }, this.firestore)
    } catch (error) {
      throw new Error(mapFirestoreError(error, `Failed to load user "${id}".`))
    }
  }

  /** Fetch a single device by document id. */
  async getDeviceById(id: string): Promise<Device | null> {
    try {
      return await withFirestoreRetry(async () => {
        const snapshot = await getDoc(
          doc(this.firestore, FIRESTORE_COLLECTIONS.devices, id),
        )

        if (!snapshot.exists()) {
          return null
        }

        return mapDeviceDocument(snapshot.id, snapshot.data())
      }, this.firestore)
    } catch (error) {
      throw new Error(mapFirestoreError(error, `Failed to load device "${id}".`))
    }
  }

  /** Fetch a single assignment by document id. */
  async getAssignmentById(id: string): Promise<Assignment | null> {
    try {
      return await withFirestoreRetry(async () => {
        const snapshot = await getDoc(this.assignmentDoc(id))

        if (!snapshot.exists()) {
          return null
        }

        return mapAssignmentDocument(snapshot.id, snapshot.data())
      }, this.firestore)
    } catch (error) {
      throw new Error(
        mapFirestoreError(error, `Failed to load assignment "${id}".`),
      )
    }
  }

  /** Realtime listener for users (used by Employees dashboard). */
  subscribeToUsers(
    onData: (users: User[]) => void,
    onError?: (error: Error) => void,
  ): Unsubscribe {
    return onSnapshot(
      this.usersCollection(),
      (snapshot) => {
        onData(
          snapshot.docs.map((document) =>
            mapUserDocument(document.id, document.data()),
          ),
        )
      },
      (error) => {
        onError?.(
          new Error(mapFirestoreError(error, 'Users subscription failed.')),
        )
      },
    )
  }

  /** Realtime listener for devices. */
  subscribeToDevices(
    onData: (devices: Device[]) => void,
    onError?: (error: Error) => void,
  ): Unsubscribe {
    return onSnapshot(
      this.devicesCollection(),
      (snapshot) => {
        onData(
          snapshot.docs.map((document) =>
            mapDeviceDocument(document.id, document.data()),
          ),
        )
      },
      (error) => {
        if (isRecoverableFirestoreListenError(error)) {
          onError?.(error)
          return
        }

        onError?.(
          new Error(mapFirestoreError(error, 'Devices subscription failed.')),
        )
      },
    )
  }

  /** Realtime listener for assignments. */
  subscribeToAssignments(
    onData: (assignments: Assignment[]) => void,
    onError?: (error: Error) => void,
  ): Unsubscribe {
    return onSnapshot(
      this.assignmentsCollection(),
      (snapshot) => {
        onData(
          snapshot.docs.map((document) =>
            mapAssignmentDocument(document.id, document.data()),
          ),
        )
      },
      (error) => {
        onError?.(
          new Error(
            mapFirestoreError(error, 'Assignments subscription failed.'),
          ),
        )
      },
    )
  }
}

export const firestoreService = new FirestoreService()
