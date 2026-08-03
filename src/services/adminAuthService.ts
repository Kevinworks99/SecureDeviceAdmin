import { initializeApp, getApps } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  getAuth,
  initializeAuth,
  inMemoryPersistence,
  signOut,
  type Auth,
} from 'firebase/auth'
import { auth } from '@/firebase/firebase'
import { firebaseConfig } from '@/firebase/config'
import { getErrorMessage } from '@/utils/getErrorMessage'

const SECONDARY_APP_NAME = 'AdminUserCreator'

let secondaryAuthInstance: Auth | null = null

/**
 * Secondary Auth instance with in-memory persistence so creating a user
 * does not affect the primary admin session (recommended Firebase pattern).
 */
function getSecondaryAuth(): Auth {
  if (secondaryAuthInstance) {
    return secondaryAuthInstance
  }

  const existingApp = getApps().find((app) => app.name === SECONDARY_APP_NAME)
  const app = existingApp ?? initializeApp(firebaseConfig, SECONDARY_APP_NAME)

  try {
    secondaryAuthInstance = initializeAuth(app, {
      persistence: inMemoryPersistence,
    })
  } catch {
    // initializeAuth throws if already initialized for this app
    secondaryAuthInstance = getAuth(app)
  }

  return secondaryAuthInstance
}

function mapCreateUserError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = String((error as { code: string }).code)
    const message =
      'message' in error ? String((error as { message: string }).message) : ''

    switch (code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered in Firebase Authentication.'
      case 'auth/invalid-email':
        return 'Enter a valid email address.'
      case 'auth/weak-password':
        return 'Password must be at least 6 characters (8+ recommended).'
      case 'auth/operation-not-allowed':
        return 'Email/Password sign-up is disabled. In Firebase Console go to Authentication → Sign-in method → enable Email/Password (including sign-up).'
      case 'auth/admin-restricted-operation':
        return 'Client-side user creation is blocked for this project. Use Firebase Admin SDK (Cloud Function) to create users, or enable client sign-up in Authentication settings.'
      case 'auth/missing-email':
        return 'Email is required.'
      case 'auth/missing-password':
        return 'Password is required.'
      case 'auth/network-request-failed':
        return 'Network error. Check your connection and try again.'
      default:
        if (message) {
          return message.replace(/^Firebase:\s*/i, '')
        }
        break
    }
  }

  return getErrorMessage(error, 'Failed to create authentication account.')
}

async function assertEmailAvailableInAuth(email: string): Promise<void> {
  const methods = await fetchSignInMethodsForEmail(auth, email)
  if (methods.length > 0) {
    throw new Error(
      'This email is already registered in Firebase Authentication.',
    )
  }
}

/**
 * Creates a Firebase Auth user without signing out the current admin session.
 */
export async function createAuthUserAccount(
  email: string,
  password: string,
): Promise<string> {
  const normalizedEmail = email.trim().toLowerCase()
  const trimmedPassword = password.trim()

  if (!normalizedEmail) {
    throw new Error('Email is required.')
  }

  if (!trimmedPassword || trimmedPassword.length < 6) {
    throw new Error('Password must be at least 6 characters.')
  }

  await assertEmailAvailableInAuth(normalizedEmail)

  const secondaryAuth = getSecondaryAuth()

  try {
    const credential = await createUserWithEmailAndPassword(
      secondaryAuth,
      normalizedEmail,
      trimmedPassword,
    )
    const uid = credential.user.uid
    await signOut(secondaryAuth)
    return uid
  } catch (error) {
    await signOut(secondaryAuth).catch(() => undefined)
    throw new Error(mapCreateUserError(error))
  }
}
