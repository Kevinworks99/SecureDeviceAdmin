import { AUTH_ERROR_MESSAGES } from '@/constants/authErrors'
import type { User, UserProfile, UserRole } from '@/models'

function asUserRole(value: unknown): UserRole {
  if (value === 'super_admin' || value === 'user') {
    return value
  }
  return 'user'
}

/** Map a full Firestore User into the slim auth profile. */
export function toUserProfile(user: User): UserProfile {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    status: user.status,
  }
}

/** Validate profile exists and account is active. Throws on failure. */
export function validateUserProfile(user: User | null): UserProfile {
  if (!user) {
    throw new Error(AUTH_ERROR_MESSAGES.PROFILE_NOT_FOUND)
  }

  if (user.status !== 'active') {
    throw new Error(AUTH_ERROR_MESSAGES.ACCOUNT_DISABLED)
  }

  return toUserProfile(user)
}

export function parseUserRole(value: unknown): UserRole {
  return asUserRole(value)
}
