/**
 * Cloud Firestore collection names used by Secure Device Locker.
 * Collections are created in Firestore when the first document is written.
 */
export const FIRESTORE_COLLECTIONS = {
  users: 'users',
  devices: 'devices',
  assignments: 'assignments',
  activityLogs: 'activityLogs',
  settings: 'settings',
} as const

export type FirestoreCollectionName =
  (typeof FIRESTORE_COLLECTIONS)[keyof typeof FIRESTORE_COLLECTIONS]
