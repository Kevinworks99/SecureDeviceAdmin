import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  type Firestore,
} from 'firebase/firestore'
import { FIRESTORE_COLLECTIONS } from '@/firebase/collections'
import { db } from '@/firebase/firebase'
import { mapFirestoreError, withFirestoreRetry } from '@/utils/firestoreNetwork'
import {
  DEFAULT_SESSION_DURATION_MINUTES,
  getSessionDurationValidationMessage,
  normalizeSessionDurationMinutes,
} from '@/utils/sessionDuration'

export interface SessionSettings {
  sessionDurationMinutes: number
}

export class SessionSettingsService {
  private readonly firestore: Firestore

  constructor(firestore: Firestore = db) {
    this.firestore = firestore
  }

  private sessionDoc() {
    return doc(this.firestore, FIRESTORE_COLLECTIONS.settings, 'session')
  }

  private mapSessionSettings(data: unknown): SessionSettings {
    const rawValue =
      data && typeof data === 'object'
        ? (data as { sessionDurationMinutes?: unknown }).sessionDurationMinutes
        : null

    return {
      sessionDurationMinutes:
        normalizeSessionDurationMinutes(rawValue) ??
        DEFAULT_SESSION_DURATION_MINUTES,
    }
  }

  async getSessionSettings(): Promise<SessionSettings> {
    try {
      return await withFirestoreRetry(async () => {
        const snapshot = await getDoc(this.sessionDoc())
        return this.mapSessionSettings(snapshot.exists() ? snapshot.data() : null)
      }, this.firestore)
    } catch (error) {
      throw new Error(
        mapFirestoreError(error, 'Failed to load session settings.'),
      )
    }
  }

  async updateSessionDurationMinutes(minutes: number): Promise<void> {
    const normalized = normalizeSessionDurationMinutes(minutes)

    if (normalized == null) {
      throw new Error(getSessionDurationValidationMessage())
    }

    try {
      await setDoc(
        this.sessionDoc(),
        {
          sessionDurationMinutes: normalized,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
    } catch (error) {
      throw new Error(
        mapFirestoreError(error, 'Failed to save session settings.'),
      )
    }
  }
}

export const sessionSettingsService = new SessionSettingsService()
