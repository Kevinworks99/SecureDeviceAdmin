import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import { ThemeModeProvider } from './ThemeModeContext'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <BrowserRouter>
      <ThemeModeProvider>
        <AuthProvider>{children}</AuthProvider>
      </ThemeModeProvider>
    </BrowserRouter>
  )
}
