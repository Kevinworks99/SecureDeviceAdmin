import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from 'firebase/firestore'
import { FIRESTORE_COLLECTIONS } from '@/firebase/collections'
import { auth, db } from '@/firebase/firebase'
import type {
  ActivityActor,
  ActivityLog,
  LogActivityInput,
} from '@/models'
import { mapActivityLogDocument } from '@/utils/firestoreMappers'
import { mapFirestoreError } from '@/utils/firestoreNetwork'

function resolveActor(actor?: ActivityActor): ActivityActor {
  if (actor?.uid) {
    return {
      uid: actor.uid,
      name: actor.name.trim() || actor.uid,
    }
  }

  const current = auth.currentUser
  if (current) {
    return {
      uid: current.uid,
      name: current.displayName || current.email || current.uid,
    }
  }

  return {
    uid: 'system',
    name: 'System',
  }
}

/**
 * Activity / audit log service.
 * Logging failures are swallowed so they never block primary operations.
 */
export class ActivityLogService {
  private logsCollection() {
    return collection(db, FIRESTORE_COLLECTIONS.activityLogs)
  }

  async logActivity(input: LogActivityInput): Promise<void> {
    try {
      const actor = resolveActor(input.actor)
      const ref = doc(this.logsCollection())

      await setDoc(ref, {
        logId: ref.id,
        action: input.action,
        module: input.module,
        performedByUid: actor.uid,
        performedByName: actor.name,
        targetId: input.targetId?.trim() || '',
        targetName: input.targetName?.trim() || '',
        description: input.description.trim(),
        metadata: input.metadata ?? {},
        createdAt: serverTimestamp(),
      })
    } catch (error) {
      console.error('[ActivityLog] Failed to write log', error)
    }
  }

  async getActivityLogs(max = 500): Promise<ActivityLog[]> {
    try {
      const snapshot = await getDocs(
        query(this.logsCollection(), orderBy('createdAt', 'desc'), limit(max)),
      )
      return snapshot.docs.map((document) =>
        mapActivityLogDocument(document.id, document.data()),
      )
    } catch (error) {
      throw new Error(mapFirestoreError(error, 'Failed to load activity logs.'))
    }
  }

  subscribeToActivityLogs(
    onData: (logs: ActivityLog[]) => void,
    onError?: (error: Error) => void,
    max = 500,
  ): Unsubscribe {
    return onSnapshot(
      query(this.logsCollection(), orderBy('createdAt', 'desc'), limit(max)),
      (snapshot) => {
        onData(
          snapshot.docs.map((document) =>
            mapActivityLogDocument(document.id, document.data()),
          ),
        )
      },
      (error) => {
        onError?.(
          new Error(mapFirestoreError(error, 'Activity logs subscription failed.')),
        )
      },
    )
  }
}

export const activityLogService = new ActivityLogService()

/** Convenience re-export matching the requested API surface. */
export const logActivity = (input: LogActivityInput) =>
  activityLogService.logActivity(input)

export const getActivityLogs = (max?: number) =>
  activityLogService.getActivityLogs(max)
