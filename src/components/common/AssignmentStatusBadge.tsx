import Chip from '@mui/material/Chip'
import type { AssignmentStatus } from '@/models'

interface AssignmentStatusBadgeProps {
  status: AssignmentStatus | null | undefined
}

export function AssignmentStatusBadge({ status }: AssignmentStatusBadgeProps) {
  if (!status) {
    return null
  }

  const normalized = status.toLowerCase()
  const isActive = normalized === 'active'
  const isReturned = normalized === 'returned'

  return (
    <Chip
      size="small"
      label={isActive ? 'Active' : isReturned ? 'Returned' : status}
      color={isActive ? 'success' : isReturned ? 'default' : 'warning'}
      variant={isReturned ? 'outlined' : 'filled'}
      sx={{ fontWeight: 600, minWidth: 84 }}
    />
  )
}
