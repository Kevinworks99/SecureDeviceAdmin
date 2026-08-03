import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import { useAuth } from '@/app/providers/AuthContext'

export function HomePage() {
  const { userProfile } = useAuth()

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h5" component="h1">
          Welcome, {userProfile?.fullName ?? 'User'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your Secure Device Locker portal.
        </Typography>
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Use the navigation above to view your profile or assigned device.
        </Typography>
      </Paper>
    </Stack>
  )
}
