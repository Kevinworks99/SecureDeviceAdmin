import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import { useAuth } from '@/app/providers/AuthContext'

export function ProfilePage() {
  const { userProfile } = useAuth()

  const fields = [
    { label: 'Full Name', value: userProfile?.fullName ?? '—' },
    { label: 'Email', value: userProfile?.email ?? '—' },
    { label: 'Role', value: userProfile?.role ?? '—' },
    { label: 'Status', value: userProfile?.status ?? '—' },
  ]

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h5" component="h1">
          Profile
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your account information.
        </Typography>
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {fields.map((field) => (
            <Grid key={field.label} size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">
                {field.label}
              </Typography>
              <Typography variant="body1">{field.value}</Typography>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Stack>
  )
}
