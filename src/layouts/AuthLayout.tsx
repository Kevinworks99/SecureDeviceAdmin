import { Outlet } from 'react-router-dom'
import Box from '@mui/material/Box'

export function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        background: (theme) =>
          theme.palette.mode === 'light'
            ? 'linear-gradient(160deg, #e8f1fb 0%, #f5f7fa 45%, #eef6f4 100%)'
            : 'linear-gradient(160deg, #0f1419 0%, #1a2332 50%, #122028 100%)',
      }}
    >
      <Outlet />
    </Box>
  )
}
