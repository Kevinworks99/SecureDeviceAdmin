import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/app/App'
import { firebaseApp, auth, db } from '@/firebase/firebase'
import { authService, firestoreService } from '@/services'
import '@/index.css'

if (import.meta.env.DEV) {
  console.info('[Firebase] Services ready', {
    app: firebaseApp.name,
    projectId: firebaseApp.options.projectId,
    auth: Boolean(auth),
    db: Boolean(db),
    currentUser: authService.getCurrentUser()?.uid ?? null,
    firestoreService: firestoreService.constructor.name,
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
