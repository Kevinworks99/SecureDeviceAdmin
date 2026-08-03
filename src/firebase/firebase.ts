import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { initializeFirestore, type Firestore } from 'firebase/firestore'
import { assertFirebaseConfig, firebaseConfig } from '@/firebase/config'

assertFirebaseConfig()

export const firebaseApp: FirebaseApp =
  getApps().length > 0 ? getApps()[0]! : initializeApp(firebaseConfig)

/** Firebase Authentication instance */
export const auth: Auth = getAuth(firebaseApp)

/**
 * Cloud Firestore instance.
 * Long-polling improves connectivity in restrictive networks / dev environments.
 */
export const db: Firestore = initializeFirestore(firebaseApp, {
  experimentalForceLongPolling: true,
})

if (import.meta.env.DEV) {
  console.info('[Firebase] Initialized', {
    name: firebaseApp.name,
    projectId: firebaseApp.options.projectId,
  })
}
