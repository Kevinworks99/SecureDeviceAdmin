import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import { useAuth } from '@/app/providers/AuthContext'
import { useThemeMode } from '@/app/providers/ThemeModeContext'
import { PATHS } from '@/routes/paths'
import { getErrorMessage } from '@/utils/getErrorMessage'

export function UserLayout() {
  const navigate = useNavigate()
  const { mode, toggleMode } = useThemeMode()
  const { userProfile, logout } = useAuth()
  const [signingOut, setSigningOut] = useState(false)

  const initials = userProfile?.fullName
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? 'U'

  const handleLogout = async () => {
    setSigningOut(true)
    try {
      await logout()
      navigate(PATHS.login, { replace: true })
    } catch (error) {
      console.error('[Auth] logout failed', getErrorMessage(error, 'Sign out failed'))
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="inherit">
        <Toolbar sx={{ gap: 1 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Secure Device Locker
          </Typography>

          <Button
            size="small"
            onClick={() => navigate(PATHS.home)}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            Home
          </Button>
          <Button
            size="small"
            onClick={() => navigate(PATHS.profile)}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            Profile
          </Button>
          <Button
            size="small"
            onClick={() => navigate(PATHS.myDevice)}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            My Device
          </Button>

          <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
            <IconButton onClick={toggleMode} color="inherit" aria-label="Toggle color mode">
              {mode === 'light' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
            </IconButton>
          </Tooltip>

          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14 }}>
            {initials}
          </Avatar>

          <Button size="small" onClick={handleLogout} disabled={signingOut}>
            Sign out
          </Button>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ p: { xs: 2, sm: 3 } }}>
        <Outlet />
      </Box>
    </Box>
  )
}
