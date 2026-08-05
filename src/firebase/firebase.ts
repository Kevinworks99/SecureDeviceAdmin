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
 * Auto-detected long-polling keeps restrictive networks working without forcing
 * every watch stream through long-polling in normal browsers.
 */
export const db: Firestore = initializeFirestore(firebaseApp, {
  experimentalAutoDetectLongPolling: true,
})

if (import.meta.env.DEV) {
  console.info('[Firebase] Initialized', {
    name: firebaseApp.name,
    projectId: firebaseApp.options.projectId,
  })
}
