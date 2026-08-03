import { useEffect, useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import InputAdornment from '@mui/material/InputAdornment'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Stepper from '@mui/material/Stepper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import { ROLES } from '@/constants/roles'
import type { Device, User } from '@/models'
import { assignmentService } from '@/services/assignmentService'
import { toDeviceStatusValue } from '@/utils/deviceStatus'

interface AssignDeviceDialogProps {
  open: boolean
  users: User[]
  devices: Device[]
  assignedBy: string
  onClose: () => void
  onAssigned: () => void
}

const STEPS = ['Select User', 'Select Device', 'Assignment Details']

function todayIsoDate(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

function userHasDevice(user: User): boolean {
  return Boolean(user.assignedDeviceId?.trim())
}

export function AssignDeviceDialog({
  open,
  users,
  devices,
  assignedBy,
  onClose,
  onAssigned,
}: AssignDeviceDialogProps) {
  const [step, setStep] = useState(0)
  const [userSearch, setUserSearch] = useState('')
  const [deviceSearch, setDeviceSearch] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedDeviceId, setSelectedDeviceId] = useState('')
  const [assignmentDate, setAssignmentDate] = useState(todayIsoDate())
  const [notes, setNotes] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      setStep(0)
      setUserSearch('')
      setDeviceSearch('')
      setSelectedUserId('')
      setSelectedDeviceId('')
      setAssignmentDate(todayIsoDate())
      setNotes('')
      setSubmitError(null)
      setSubmitting(false)
    }
  }, [open])

  const eligibleUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase()

    return users
      .filter(
        (user) =>
          user.status === 'active' &&
          user.role === ROLES.USER &&
          !userHasDevice(user),
      )
      .filter((user) => {
        if (!query) {
          return true
        }
        return [user.fullName, user.email, user.employeeId]
          .join(' ')
          .toLowerCase()
          .includes(query)
      })
      .sort((a, b) => a.fullName.localeCompare(b.fullName))
  }, [users, userSearch])

  const eligibleDevices = useMemo(() => {
    const query = deviceSearch.trim().toLowerCase()

    return devices
      .filter((device) => toDeviceStatusValue(device.status) === 'available')
      .filter((device) => {
        if (!query) {
          return true
        }
        return [device.deviceName, device.brand, device.assetTag, device.imei]
          .join(' ')
          .toLowerCase()
          .includes(query)
      })
      .sort((a, b) => a.deviceName.localeCompare(b.deviceName))
  }, [devices, deviceSearch])

  const selectedUser = users.find((user) => user.id === selectedUserId) ?? null
  const selectedDevice =
    devices.find((device) => device.id === selectedDeviceId) ?? null

  const canGoNext =
    (step === 0 && Boolean(selectedUserId)) ||
    (step === 1 && Boolean(selectedDeviceId)) ||
    step === 2

  const handleNext = () => {
    setSubmitError(null)
    if (step === 0 && !selectedUserId) {
      setSubmitError('Please select a user.')
      return
    }
    if (step === 1 && !selectedDeviceId) {
      setSubmitError('Please select a device.')
      return
    }
    setStep((prev) => Math.min(prev + 1, STEPS.length - 1))
  }

  const handleBack = () => {
    setSubmitError(null)
    setStep((prev) => Math.max(prev - 1, 0))
  }

  const handleAssign = async () => {
    if (!selectedUserId || !selectedDeviceId) {
      setSubmitError('Please select both a user and a device.')
      return
    }

    if (selectedUser && userHasDevice(selectedUser)) {
      setSubmitError(
        'This user already has a device assigned. Return it before assigning another.',
      )
      return
    }

    if (
      selectedDevice &&
      toDeviceStatusValue(selectedDevice.status) !== 'available'
    ) {
      setSubmitError(
        'This device is not available. Only available devices can be assigned.',
      )
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      await assignmentService.assignDevice({
        userId: selectedUserId,
        deviceId: selectedDeviceId,
        assignmentDate,
        notes,
        assignedBy,
      })
      onAssigned()
      onClose()
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to assign device.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Assign Device</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <Stepper activeStep={step} alternativeLabel>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {submitError ? <Alert severity="error">{submitError}</Alert> : null}

          {step === 0 ? (
            <Stack spacing={1.5}>
              <TextField
                value={userSearch}
                onChange={(event) => setUserSearch(event.target.value)}
                placeholder="Search by name, email, or employee ID…"
                size="small"
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <Box
                sx={{
                  maxHeight: 280,
                  overflow: 'auto',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                {eligibleUsers.length === 0 ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ p: 2 }}
                  >
                    No eligible users found. Users must be active, role "user",
                    and have no assigned device.
                  </Typography>
                ) : (
                  <List disablePadding dense>
                    {eligibleUsers.map((user) => (
                      <ListItemButton
                        key={user.id}
                        selected={selectedUserId === user.id}
                        onClick={() => setSelectedUserId(user.id)}
                      >
                        <ListItemText
                          primary={user.fullName || user.email}
                          secondary={`${user.email} · ${user.employeeId || 'No ID'} · ${user.department || 'No dept'}`}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                )}
              </Box>
            </Stack>
          ) : null}

          {step === 1 ? (
            <Stack spacing={1.5}>
              <TextField
                value={deviceSearch}
                onChange={(event) => setDeviceSearch(event.target.value)}
                placeholder="Search by name, brand, asset tag, or IMEI…"
                size="small"
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <Box
                sx={{
                  maxHeight: 280,
                  overflow: 'auto',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                {eligibleDevices.length === 0 ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ p: 2 }}
                  >
                    No available devices found.
                  </Typography>
                ) : (
                  <List disablePadding dense>
                    {eligibleDevices.map((device) => (
                      <ListItemButton
                        key={device.id}
                        selected={selectedDeviceId === device.id}
                        onClick={() => setSelectedDeviceId(device.id)}
                      >
                        <ListItemText
                          primary={device.deviceName || device.model}
                          secondary={`${device.brand} · ${device.platform} · ${device.assetTag || 'No tag'} · ${device.imei || 'No IMEI'}`}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                )}
              </Box>
            </Stack>
          ) : null}

          {step === 2 ? (
            <Stack spacing={2}>
              <Alert severity="info">
                Assigning <strong>{selectedDevice?.deviceName || 'device'}</strong>{' '}
                to <strong>{selectedUser?.fullName || 'user'}</strong>
              </Alert>
              <TextField
                label="Assignment Date"
                type="date"
                fullWidth
                value={assignmentDate}
                onChange={(event) => setAssignmentDate(event.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="Notes"
                fullWidth
                multiline
                minRows={2}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </Stack>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        {step > 0 ? (
          <Button onClick={handleBack} disabled={submitting}>
            Back
          </Button>
        ) : null}
        {step < STEPS.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!canGoNext || submitting}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleAssign}
            disabled={submitting || !selectedUserId || !selectedDeviceId}
          >
            {submitting ? 'Assigning…' : 'Assign'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
