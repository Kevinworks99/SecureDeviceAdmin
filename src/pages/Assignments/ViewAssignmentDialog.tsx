import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { AssignmentStatusBadge } from '@/components/common/AssignmentStatusBadge'
import type { Assignment } from '@/models'
import { formatTimestamp } from '@/utils/formatTimestamp'

interface ViewAssignmentDialogProps {
  open: boolean
  assignment: Assignment | null
  onClose: () => void
  onReturn?: () => void
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

export function ViewAssignmentDialog({
  open,
  assignment,
  onClose,
  onReturn,
}: ViewAssignmentDialogProps) {
  if (!assignment) {
    return null
  }

  const isActive = assignment.status === 'active'

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Assignment Details</DialogTitle>
      <DialogContent>
        <Stack spacing={1} sx={{ mt: 1 }}>
          <Stack spacing={0.5}>
            <Typography variant="h6">
              {assignment.deviceName || '—'}
            </Typography>
            <AssignmentStatusBadge status={assignment.status} />
          </Stack>

          <Divider sx={{ my: 1 }} />

          <DetailRow label="Assigned User" value={assignment.userName} />
          <DetailRow label="Employee ID" value={assignment.employeeId} />
          <DetailRow label="Department" value={assignment.department} />
          <DetailRow label="Floor" value={assignment.floor} />
          <DetailRow label="Desk Number" value={assignment.deskNumber} />
          <DetailRow label="Platform" value={assignment.platform} />
          <DetailRow label="Brand" value={assignment.brand} />
          <DetailRow label="Asset Tag" value={assignment.assetTag} />
          <DetailRow
            label="Assigned Date"
            value={formatTimestamp(assignment.assignedAt)}
          />
          <DetailRow label="Assigned By" value={assignment.assignedBy} />
          {assignment.returnedAt ? (
            <DetailRow
              label="Returned Date"
              value={formatTimestamp(assignment.returnedAt)}
            />
          ) : null}
          {assignment.notes ? (
            <>
              <Divider sx={{ my: 1 }} />
              <DetailRow label="Notes" value={assignment.notes} />
            </>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Close</Button>
        {isActive && onReturn ? (
          <Button variant="contained" color="warning" onClick={onReturn}>
            Return Device
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  )
}
