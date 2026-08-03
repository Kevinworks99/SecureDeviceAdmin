import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import IconButton from '@mui/material/IconButton'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/app/providers/AuthContext'
import { useThemeMode } from '@/app/providers/ThemeModeContext'
import { getDefaultRoute } from '@/constants/roles'
import { getErrorMessage } from '@/utils/getErrorMessage'

interface LoginFormValues {
  email: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const { mode, toggleMode } = useThemeMode()
  const { signInWithCompanyEmail, authError, clearAuthError } = useAuth()
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
    },
  })

  useEffect(() => {
    if (authError) {
      setSnackbarMessage(authError)
      setSnackbarOpen(true)
    }
  }, [authError])

  const showError = (message: string) => {
    setSnackbarMessage(message)
    setSnackbarOpen(true)
  }

  const onSubmit = async (values: LoginFormValues) => {
    clearAuthError()

    try {
      const profile = await signInWithCompanyEmail(values.email)
      navigate(getDefaultRoute(profile.role), { replace: true })
    } catch (error) {
      showError(getErrorMessage(error, 'Unable to sign in. Please try again.'))
    }
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 440, position: 'relative' }}>
      <IconButton
        onClick={toggleMode}
        aria-label="Toggle color mode"
        sx={{ position: 'absolute', top: -48, right: 0 }}
      >
        {mode === 'light' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
      </IconButton>

      <Card>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={3}>
            <Stack spacing={1.5} sx={{ alignItems: 'center', textAlign: 'center' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 52,
                  height: 52,
                  borderRadius: 2,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                }}
              >
                <SecurityOutlinedIcon />
              </Box>
              <Box>
                <Typography variant="h5" component="h1">
                  Secure Device Locker
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Sign in with your company email
                </Typography>
              </Box>
            </Stack>

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Stack spacing={2.5}>
                <TextField
                  label="Company Email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  fullWidth
                  error={Boolean(errors.email)}
                  helperText={errors.email?.message}
                  {...register('email', {
                    required: 'Company email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Enter a valid company email address',
                    },
                  })}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing in…' : 'Login'}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={(_, reason) => {
          if (reason === 'clickaway') {
            return
          }
          setSnackbarOpen(false)
          clearAuthError()
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="error"
          variant="filled"
          onClose={() => {
            setSnackbarOpen(false)
            clearAuthError()
          }}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}
