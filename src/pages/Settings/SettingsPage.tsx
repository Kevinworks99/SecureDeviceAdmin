import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useThemeMode } from '@/app/providers/ThemeModeContext'
import { sessionSettingsService } from '@/services/sessionSettingsService'
import {
  DEFAULT_SESSION_DURATION_MINUTES,
  MAX_SESSION_DURATION_MINUTES,
  MIN_SESSION_DURATION_MINUTES,
  getSessionDurationValidationMessage,
  normalizeSessionDurationMinutes,
} from '@/utils/sessionDuration'

export function SettingsPage() {
  const { mode, setMode } = useThemeMode()
  const [sessionDurationInput, setSessionDurationInput] = useState(
    String(DEFAULT_SESSION_DURATION_MINUTES),
  )
  const [sessionLoading, setSessionLoading] = useState(true)
  const [sessionSaving, setSessionSaving] = useState(false)
  const [sessionMessage, setSessionMessage] = useState<string | null>(null)
  const [sessionError, setSessionError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadSessionSettings() {
      try {
        const settings = await sessionSettingsService.getSessionSettings()
        if (cancelled) {
          return
        }
        setSessionDurationInput(String(settings.sessionDurationMinutes))
        setSessionLoading(false)
        setSessionError(null)
      } catch (error) {
        if (cancelled) {
          return
        }
        setSessionLoading(false)
        setSessionError(
          error instanceof Error
            ? error.message
            : 'Failed to load session settings.',
        )
      }
    }

    void loadSessionSettings()

    return () => {
      cancelled = true
    }
  }, [])

  const handleSaveSessionDuration = async () => {
    const sessionDurationMinutes = normalizeSessionDurationMinutes(
      sessionDurationInput,
    )

    if (sessionDurationMinutes == null) {
      setSessionMessage(null)
      setSessionError(getSessionDurationValidationMessage())
      return
    }

    setSessionSaving(true)
    setSessionMessage(null)
    setSessionError(null)

    try {
      await sessionSettingsService.updateSessionDurationMinutes(
        sessionDurationMinutes,
      )
      setSessionMessage('Global session expire time saved.')
    } catch (error) {
      setSessionError(
        error instanceof Error
          ? error.message
          : 'Failed to save session settings.',
      )
    } finally {
      setSessionSaving(false)
    }
  }

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h5" component="h2">
          Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure console preferences and appearance.
        </Typography>
      </Stack>

      <Paper sx={{ p: 2.5, maxWidth: 720 }}>
        <Typography variant="h6" gutterBottom>
          Global Session Expire Time
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Default Android session timeout for devices without a custom setting.
        </Typography>

        <Stack spacing={2} sx={{ maxWidth: 360 }}>
          {sessionMessage ? (
            <Alert severity="success">{sessionMessage}</Alert>
          ) : null}
          {sessionError ? <Alert severity="error">{sessionError}</Alert> : null}

          <TextField
            label="Session Expire Time"
            type="number"
            value={sessionDurationInput}
            disabled={sessionLoading || sessionSaving}
            onChange={(event) => {
              setSessionDurationInput(event.target.value)
              setSessionMessage(null)
            }}
            helperText={`${MIN_SESSION_DURATION_MINUTES} to ${MAX_SESSION_DURATION_MINUTES} minutes`}
            slotProps={{
              htmlInput: {
                min: MIN_SESSION_DURATION_MINUTES,
                max: MAX_SESSION_DURATION_MINUTES,
                step: 1,
              },
            }}
          />

          <Button
            variant="contained"
            onClick={handleSaveSessionDuration}
            disabled={sessionLoading || sessionSaving}
            sx={{ alignSelf: 'flex-start' }}
          >
            {sessionSaving ? 'Saving…' : 'Save Session Time'}
          </Button>
        </Stack>

        <Divider sx={{ my: 2.5 }} />

        <Typography variant="h6" gutterBottom>
          Appearance
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Choose how the admin console looks on this device.
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={mode === 'dark'}
              onChange={(_, checked) => setMode(checked ? 'dark' : 'light')}
            />
          }
          label="Dark mode"
        />

        <Divider sx={{ my: 2.5 }} />

        <Typography variant="h6" gutterBottom>
          Notifications
        </Typography>
        <Box>
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Email alerts for non-compliant devices"
          />
        </Box>
        <Box>
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Security alert digest"
          />
        </Box>
      </Paper>
    </Stack>
  )
}
