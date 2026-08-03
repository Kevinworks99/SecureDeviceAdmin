import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { UserAvatar, UserStatusBadge } from '@/components'
import type { User } from '@/models'
import { formatTimestamp } from '@/utils/formatTimestamp'
import {
  buildDeviceLookup,
  resolveAssignedDevice,
} from '@/utils/resolveAssignedDevice'
import type { Device } from '@/models'

interface ViewUserDialogProps {
  open: boolean
  user: User | null
  devices: Device[]
  onClose: () => void
  onEdit: () => void
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" spacing={2} sx={{ py: 0.75 }}>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ minWidth: 140, flexShrink: 0 }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
        {value || '—'}
      </Typography>
    </Stack>
  )
}

export function ViewUserDialog({
  open,
  user,
  devices,
  onClose,
  onEdit,
}: ViewUserDialogProps) {
  if (!user) {
    return null
  }

  const devicesById = buildDeviceLookup(devices)
  const assignedDevice = resolveAssignedDevice(user, devicesById)

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>User Details</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <UserAvatar fullName={user.fullName} size={48} />
            <Stack spacing={0.5}>
              <Typography variant="h6">{user.fullName || '—'}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
              <UserStatusBadge status={user.status} />
            </Stack>
          </Stack>

          <Divider />

          <DetailRow label="Employee ID" value={user.employeeId} />
          <DetailRow label="Department" value={user.department} />
          <DetailRow label="Floor" value={user.floor} />
          <DetailRow label="Desk Number" value={user.deskNumber} />
          <DetailRow label="Phone" value={user.phoneNumber} />
          <DetailRow
            label="Role"
            value={user.role === 'super_admin' ? 'Super Admin' : 'User'}
          />
          <DetailRow label="Assigned Device" value={assignedDevice} />
          <DetailRow label="UID" value={user.uid || user.id} />
          <DetailRow
            label="Created"
            value={formatTimestamp(user.createdAt)}
          />
          <DetailRow
            label="Last Login"
            value={formatTimestamp(user.lastLoginAt)}
          />
          {user.notes ? (
            <>
              <Divider />
              <DetailRow label="Notes" value={user.notes} />
            </>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={onEdit}>
          Edit
        </Button>
      </DialogActions>
    </Dialog>
  )
}
