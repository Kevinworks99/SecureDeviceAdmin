import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ActivityLog } from '@/models'
import { formatTimestamp } from '@/utils/formatTimestamp'

interface ViewActivityLogDialogProps {
  open: boolean
  log: ActivityLog | null
  onClose: () => void
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

export function ViewActivityLogDialog({
  open,
  log,
  onClose,
}: ViewActivityLogDialogProps) {
  if (!log) {
    return null
  }

  const metadataText =
    Object.keys(log.metadata).length > 0
      ? JSON.stringify(log.metadata, null, 2)
      : '—'

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Activity Details</DialogTitle>
      <DialogContent>
        <Stack spacing={1} sx={{ mt: 1 }}>
          <DetailRow label="Action" value={String(log.action)} />
          <DetailRow label="Module" value={String(log.module)} />
          <DetailRow
            label="User"
            value={`${log.performedByName}${log.performedByUid ? ` (${log.performedByUid})` : ''}`}
          />
          <DetailRow
            label="Target"
            value={`${log.targetName || '—'}${log.targetId ? ` (${log.targetId})` : ''}`}
          />
          <DetailRow
            label="Timestamp"
            value={formatTimestamp(log.createdAt)}
          />

          <Divider sx={{ my: 1 }} />

          <Typography variant="subtitle2">Full Description</Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {log.description || '—'}
          </Typography>

          <Divider sx={{ my: 1 }} />

          <Typography variant="subtitle2">Metadata</Typography>
          <Typography
            component="pre"
            variant="body2"
            sx={{
              m: 0,
              p: 1.5,
              borderRadius: 1,
              bgcolor: 'action.hover',
              overflow: 'auto',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: 12,
            }}
          >
            {metadataText}
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
