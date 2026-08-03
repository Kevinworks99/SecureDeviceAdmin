import Chip from '@mui/material/Chip'
import type { LoginStatus } from '@/types'

interface LoginStatusBadgeProps {
  status: LoginStatus | null | undefined
}

export function LoginStatusBadge({ status }: LoginStatusBadgeProps) {
  if (!status) {
    return null
  }

  const isOnline = status === 'Online'

  return (
    <Chip
      size="small"
      label={status}
      color={isOnline ? 'success' : 'default'}
      variant={isOnline ? 'filled' : 'outlined'}
      sx={{
        fontWeight: 600,
        minWidth: 72,
        ...(!isOnline
          ? {
              color: 'text.secondary',
              borderColor: 'divider',
              bgcolor: (theme) =>
                theme.palette.mode === 'light'
                  ? 'action.hover'
                  : 'action.selected',
            }
          : {}),
      }}
    />
  )
}
