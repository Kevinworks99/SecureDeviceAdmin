import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type Auth,
  type Unsubscribe,
  type User as FirebaseAuthUser,
} from 'firebase/auth'
import { AUTH_STATIC_PASSWORD } from '@/constants/auth'
import { auth } from '@/firebase/firebase'
import { getErrorMessage } from '@/utils/getErrorMessage'

function mapAuthError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = String((error as { code: string }).code)

    switch (code) {
      case 'auth/invalid-email':
        return 'Enter a valid company email address.'
      case 'auth/user-disabled':
        return 'This account has been disabled. Contact an administrator.'
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
      case 'auth/invalid-login-credentials':
        return 'Unable to sign in. Check your company email and try again.'
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a moment and try again.'
      case 'auth/network-request-failed':
        return 'Network error. Check your connection and try again.'
      default:
        break
    }
  }

  return getErrorMessage(error, 'Unable to sign in. Please try again.')
}

/**
 * Authentication service — Firebase Auth operations only.
 * Keep UI components free of direct Firebase Auth calls.
 */
export class AuthService {
  private readonly authInstance: Auth

  constructor(authInstance: Auth = auth) {
    this.authInstance = authInstance
  }

  /** Sign in with email and an explicit password. */
  async signIn(email: string, password: string): Promise<FirebaseAuthUser> {
    try {
      const credential = await signInWithEmailAndPassword(
        this.authInstance,
        email.trim(),
        password,
      )
      return credential.user
    } catch (error) {
      throw new Error(mapAuthError(error))
    }
  }

  /**
   * Admin console login: company email + static password from constants.
   */
  async signInWithCompanyEmail(email: string): Promise<FirebaseAuthUser> {
    return this.signIn(email, AUTH_STATIC_PASSWORD)
  }

  /** Sign out the current Firebase Auth session. */
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(this.authInstance)
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to sign out.'))
    }
  }

  /** Returns the currently authenticated Firebase user, if any. */
  getCurrentUser(): FirebaseAuthUser | null {
    return this.authInstance.currentUser
  }

  /** Subscribe to auth session changes. */
  onAuthStateChanged(
    callback: (user: FirebaseAuthUser | null) => void,
  ): Unsubscribe {
    return onAuthStateChanged(this.authInstance, callback)
  }
}

export const authService = new AuthService()
