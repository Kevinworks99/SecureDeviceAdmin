import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { useThemeMode } from '@/app/providers/ThemeModeContext'

export function SettingsPage() {
  const { mode, setMode } = useThemeMode()

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
