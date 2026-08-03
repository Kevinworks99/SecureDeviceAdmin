import { enableNetwork, type Firestore } from 'firebase/firestore'
import { db } from '@/firebase/firebase'
import { getErrorMessage } from '@/utils/getErrorMessage'

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 800

function isOfflineError(error: unknown): boolean {
  const message = getErrorMessage(error, '').toLowerCase()
  return (
    message.includes('offline') ||
    message.includes('unavailable') ||
    (typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      String((error as { code: string }).code) === 'unavailable')
  )
}

/** Ensure Firestore network is enabled before server reads. */
export async function ensureFirestoreOnline(
  firestore: Firestore = db,
): Promise<void> {
  try {
    await enableNetwork(firestore)
  } catch {
    // Network may already be enabled.
  }
}

/** Map Firestore errors to user-friendly messages. */
export function mapFirestoreError(error: unknown, fallback: string): string {
  const message = getErrorMessage(error, fallback)

  if (message.toLowerCase().includes('offline')) {
    return 'Unable to reach Firestore. Check your internet connection and try again.'
  }

  if (message.toLowerCase().includes('permission')) {
    return 'Missing or insufficient permissions. Check Firestore security rules.'
  }

  return message || fallback
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

/**
 * Run a Firestore read with network recovery and limited retries
 * for transient offline/unavailable errors.
 */
export async function withFirestoreRetry<T>(
  operation: () => Promise<T>,
  firestore: Firestore = db,
): Promise<T> {
  let lastError: unknown

  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    try {
      await ensureFirestoreOnline(firestore)
      return await operation()
    } catch (error) {
      lastError = error
      if (!isOfflineError(error) || attempt === MAX_RETRIES - 1) {
        throw error
      }
      await delay(RETRY_DELAY_MS * (attempt + 1))
    }
  }

  throw lastError
}
