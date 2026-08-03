/**
 * Shared static password used by the admin console login flow.
 * Users authenticate with company email + this password in Firebase Auth.
 *
 * Enable Email/Password in Firebase Console → Authentication → Sign-in method.
 * Create each admin user with password matching this value.
 */
export const AUTH_STATIC_PASSWORD = '123456'
