import Chip from '@mui/material/Chip'
import type { UserStatus } from '@/models'

interface UserStatusBadgeProps {
  status: UserStatus | null | undefined
}

const STATUS_STYLES: Record<
  string,
  { color: 'success' | 'warning' | 'error' | 'default'; label: string }
> = {
  active: { color: 'success', label: 'Active' },
  disabled: { color: 'warning', label: 'Disabled' },
  deleted: { color: 'error', label: 'Deleted' },
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  if (!status) {
    return null
  }

  const normalized = status.toLowerCase()
  const style = STATUS_STYLES[normalized]

  if (!style) {
    return (
      <Chip
        size="small"
        label={status}
        variant="outlined"
        sx={{ fontWeight: 600 }}
      />
    )
  }

  return (
    <Chip
      size="small"
      label={style.label}
      color={style.color}
      variant="filled"
      sx={{ fontWeight: 600, minWidth: 84 }}
    />
  )
}
