import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

interface LoadingSpinnerProps {
  label?: string
  fullScreen?: boolean
  size?: number
}

export function LoadingSpinner({
  label = 'Loading…',
  fullScreen = false,
  size = 40,
}: LoadingSpinnerProps) {
  return (
    <Box
      role="status"
      aria-live="polite"
      aria-busy="true"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        ...(fullScreen
          ? { minHeight: '100vh', width: '100%' }
          : { py: 6, width: '100%' }),
      }}
    >
      <CircularProgress size={size} />
      {label ? (
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      ) : null}
    </Box>
  )
}
