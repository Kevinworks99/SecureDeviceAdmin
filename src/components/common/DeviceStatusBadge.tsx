import Chip from '@mui/material/Chip'
import type { DeviceStatusLabel } from '@/models'
import { normalizeDeviceStatus } from '@/utils/deviceStatus'

interface DeviceStatusBadgeProps {
  status: string | null | undefined
}

const STATUS_STYLES: Record<
  DeviceStatusLabel,
  {
    color: 'success' | 'info' | 'warning' | 'error' | 'default'
    label: DeviceStatusLabel
  }
> = {
  Available: { color: 'success', label: 'Available' },
  Assigned: { color: 'info', label: 'Assigned' },
  Repair: { color: 'warning', label: 'Repair' },
  Lost: { color: 'error', label: 'Lost' },
  Deleted: { color: 'default', label: 'Deleted' },
}

export function DeviceStatusBadge({ status }: DeviceStatusBadgeProps) {
  if (!status) {
    return null
  }

  const normalized = normalizeDeviceStatus(status)
  const style = STATUS_STYLES[normalized as DeviceStatusLabel]

  if (!style) {
    return (
      <Chip
        size="small"
        label={normalized}
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
      variant={style.label === 'Deleted' ? 'outlined' : 'filled'}
      sx={{ fontWeight: 600, minWidth: 84 }}
    />
  )
}
