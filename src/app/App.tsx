import { AppProviders } from '@/app/providers/AppProviders'
import { AppRouter } from '@/routes'

export default function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  )
}
