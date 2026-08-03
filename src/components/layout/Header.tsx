import { useMemo, useState, type MouseEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import MenuIcon from '@mui/icons-material/Menu'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import { useThemeMode } from '@/app/providers/ThemeModeContext'
import { useAuth } from '@/app/providers/AuthContext'
import { ADMIN_NAV_ITEMS, DRAWER_WIDTH } from '@/constants/navigation'
import { PATHS } from '@/routes/paths'
import { getErrorMessage } from '@/utils/getErrorMessage'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { mode, toggleMode } = useThemeMode()
  const { userProfile, logout } = useAuth()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const pageTitle = useMemo(() => {
    const match = ADMIN_NAV_ITEMS.find((item) =>
      location.pathname.startsWith(item.path),
    )
    return match?.label ?? 'Admin'
  }, [location.pathname])

  const initials = userProfile?.fullName
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? 'AD'

  const handleOpenMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    handleCloseMenu()
    try {
      await logout()
    } catch (error) {
      console.error('[Auth] logout failed', getErrorMessage(error, 'Sign out failed'))
    } finally {
      navigate(PATHS.login, { replace: true })
    }
  }

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { md: `${DRAWER_WIDTH}px` },
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          sx={{ display: { md: 'none' }, mr: 0.5 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" noWrap component="h1" sx={{ flexGrow: 1 }}>
          {pageTitle}
        </Typography>

        <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
          <IconButton onClick={toggleMode} color="inherit" aria-label="Toggle color mode">
            {mode === 'light' ? (
              <DarkModeOutlinedIcon />
            ) : (
              <LightModeOutlinedIcon />
            )}
          </IconButton>
        </Tooltip>

        <Tooltip title="Account">
          <IconButton
            onClick={handleOpenMenu}
            size="small"
            sx={{ ml: 0.5 }}
            aria-controls={anchorEl ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={anchorEl ? 'true' : undefined}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: 'primary.main',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {initials}
            </Avatar>
          </IconButton>
        </Tooltip>

        <Menu
          id="account-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          onClick={handleCloseMenu}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1, minWidth: 160 }}>
            <Typography variant="subtitle2">
              {userProfile?.fullName ?? 'Admin User'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {userProfile?.email ?? 'Not signed in'}
            </Typography>
          </Box>
          <MenuItem onClick={() => navigate(PATHS.settings)}>Settings</MenuItem>
          <MenuItem onClick={handleLogout}>Sign out</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}
