import { useEffect, useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Alert from '@mui/material/Alert'
import Grid from '@mui/material/Grid'
import { LoadingSpinner } from '@/components'
import { useAuth } from '@/app/providers/AuthContext'
import { firestoreService } from '@/services'
import type { User } from '@/models'
import { formatTimestamp } from '@/utils/formatTimestamp'

export function MyDevicePage() {
  const { currentUser } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentUser) {
      return
    }

    let cancelled = false

    const load = async () => {
      try {
        const profile = await firestoreService.getUserById(currentUser.uid)
        if (!cancelled) {
          setUser(profile)
          setError(null)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Failed to load device information.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [currentUser])

  if (loading) {
    return <LoadingSpinner label="Loading device…" />
  }

  const fields = [
    { label: 'Device ID', value: user?.currentDeviceId ?? '—' },
    { label: 'Device Model', value: user?.currentDeviceModel ?? '—' },
    { label: 'App Version', value: user?.appVersion ?? '—' },
    { label: 'Last Login', value: formatTimestamp(user?.lastLoginAt) },
    { label: 'Last Seen', value: formatTimestamp(user?.lastSeenAt) },
  ]

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h5" component="h1">
          My Device
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your currently assigned locker device.
        </Typography>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

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
