import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User as FirebaseAuthUser } from 'firebase/auth'
import { authService, firestoreService, logActivity } from '@/services'
import type { UserProfile, UserRole } from '@/models'
import { LoadingSpinner } from '@/components'
import { validateUserProfile } from '@/utils/authProfile'
import { getErrorMessage } from '@/utils/getErrorMessage'

interface AuthContextValue {
  currentUser: FirebaseAuthUser | null
  userProfile: UserProfile | null
  role: UserRole | null
  loading: boolean
  isAuthenticated: boolean
  authError: string | null
  clearAuthError: () => void
  signInWithCompanyEmail: (email: string) => Promise<UserProfile>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseAuthUser | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  const loadProfile = useCallback(async (uid: string): Promise<UserProfile> => {
    const user = await firestoreService.getUserById(uid)
    return validateUserProfile(user)
  }, [])

  const handleAuthFailure = useCallback(async (message: string) => {
    setAuthError(message)
    setCurrentUser(null)
    setUserProfile(null)
    await authService.signOut()
  }, [])

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (authUser) => {
      setLoading(true)

      if (!authUser) {
        setCurrentUser(null)
        setUserProfile(null)
        setLoading(false)
        return
      }

      try {
        const profile = await loadProfile(authUser.uid)
        setCurrentUser(authUser)
        setUserProfile(profile)
        setAuthError(null)
      } catch (error) {
        await handleAuthFailure(
          getErrorMessage(error, 'Unable to load your user profile.'),
        )
      } finally {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [loadProfile, handleAuthFailure])

  const signInWithCompanyEmail = useCallback(
    async (email: string): Promise<UserProfile> => {
      setAuthError(null)
      const authUser = await authService.signInWithCompanyEmail(email)

      try {
        const profile = await loadProfile(authUser.uid)
        setCurrentUser(authUser)
        setUserProfile(profile)

        await logActivity({
          action: 'LOGIN',
          module: 'Authentication',
          targetId: profile.id,
          targetName: profile.fullName || profile.email,
          description: `${profile.fullName || profile.email} signed in`,
          metadata: {
            email: profile.email,
            role: profile.role,
          },
          actor: {
            uid: profile.id,
            name: profile.fullName || profile.email,
          },
        })

        return profile
      } catch (error) {
        await handleAuthFailure(
          getErrorMessage(error, 'Unable to load your user profile.'),
        )
        throw error
      }
    },
    [loadProfile, handleAuthFailure],
  )

  const logout = useCallback(async () => {
    const profile = userProfile
    setAuthError(null)

    if (profile) {
      await logActivity({
        action: 'LOGOUT',
        module: 'Authentication',
        targetId: profile.id,
        targetName: profile.fullName || profile.email,
        description: `${profile.fullName || profile.email} signed out`,
        metadata: {
          email: profile.email,
          role: profile.role,
        },
        actor: {
          uid: profile.id,
          name: profile.fullName || profile.email,
        },
      })
    }

    setCurrentUser(null)
    setUserProfile(null)
    await authService.signOut()
  }, [userProfile])

  const clearAuthError = useCallback(() => {
    setAuthError(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      userProfile,
      role: userProfile?.role ?? null,
      loading,
      isAuthenticated: Boolean(currentUser && userProfile),
      authError,
      clearAuthError,
      signInWithCompanyEmail,
      logout,
    }),
    [
      currentUser,
      userProfile,
      loading,
      authError,
      clearAuthError,
      signInWithCompanyEmail,
      logout,
    ],
  )

  if (loading) {
    return <LoadingSpinner fullScreen label="Checking session…" />
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
