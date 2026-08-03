import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { DeviceStatusBadge } from '@/components'
import type { Device } from '@/models'
import { formatTimestamp } from '@/utils/formatTimestamp'

interface ViewDeviceDialogProps {
  open: boolean
  device: Device | null
  onClose: () => void
  onEdit: () => void
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" spacing={2} sx={{ py: 0.75 }}>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ minWidth: 150, flexShrink: 0 }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
        {value || '—'}
      </Typography>
    </Stack>
  )
}

export function ViewDeviceDialog({
  open,
  device,
  onClose,
  onEdit,
}: ViewDeviceDialogProps) {
  if (!device) {
    return null
  }

  const isDeleted = String(device.status).toLowerCase() === 'deleted'

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Device Details</DialogTitle>
      <DialogContent>
        <Stack spacing={1} sx={{ mt: 1 }}>
          <Stack spacing={0.5}>
            <Typography variant="h6">{device.deviceName || '—'}</Typography>
            <DeviceStatusBadge status={device.status} />
          </Stack>

          <Divider sx={{ my: 1 }} />

          <DetailRow label="Brand" value={device.brand} />
          <DetailRow label="Platform" value={device.platform} />
          <DetailRow label="Model" value={device.model} />
          <DetailRow label="Asset Tag" value={device.assetTag} />
          <DetailRow label="IMEI" value={device.imei} />
          <DetailRow label="Serial Number" value={device.serialNumber} />
          <DetailRow
            label="OS Version"
            value={device.osVersion || device.androidVersion}
          />
          <DetailRow label="RAM" value={device.ram} />
          <DetailRow label="Storage" value={device.storage} />
          <DetailRow label="Color" value={device.color} />
          <DetailRow label="Purchase Date" value={device.purchaseDate} />
          <DetailRow
            label="Assigned User"
            value={device.assignedUserName || device.assignedEmployeeName || ''}
          />
          <DetailRow label="Floor" value={device.assignedFloor} />
          <DetailRow label="Desk Number" value={device.assignedDeskNumber} />
          <DetailRow
            label="Created"
            value={formatTimestamp(device.createdAt)}
          />
          <DetailRow
            label="Last Updated"
            value={formatTimestamp(device.updatedAt)}
          />
          {device.notes ? (
            <>
              <Divider sx={{ my: 1 }} />
              <DetailRow label="Notes" value={device.notes} />
            </>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={onEdit} disabled={isDeleted}>
          Edit
        </Button>
      </DialogActions>
    </Dialog>
  )
}
