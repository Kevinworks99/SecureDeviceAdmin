import { Controller, useForm } from 'react-hook-form'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import { useEffect, useState } from 'react'
import { ROLES } from '@/constants/roles'
import type { CreateUserFormValues } from '@/types/userManagement'
import { userManagementService } from '@/services/userManagementService'

interface AddUserDialogProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

const defaultValues: CreateUserFormValues = {
  fullName: '',
  email: '',
  employeeId: '',
  department: '',
  floor: '',
  deskNumber: '',
  phoneNumber: '',
  role: ROLES.USER,
  status: 'active',
  notes: '',
}

export function AddUserDialog({ open, onClose, onCreated }: AddUserDialogProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormValues>({
    defaultValues,
  })

  useEffect(() => {
    if (!open) {
      reset(defaultValues)
      setSubmitError(null)
    }
  }, [open, reset])

  const onSubmit = async (values: CreateUserFormValues) => {
    setSubmitError(null)
    try {
      await userManagementService.createUser(values)
      onCreated()
      onClose()
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to create user.',
      )
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogTitle>Add User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {submitError ? <Alert severity="error">{submitError}</Alert> : null}

            <TextField
              label="Full Name"
              required
              fullWidth
              error={Boolean(errors.fullName)}
              helperText={errors.fullName?.message}
              {...register('fullName', { required: 'Full name is required.' })}
            />

            <TextField
              label="Email"
              type="email"
              required
              fullWidth
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              {...register('email', {
                required: 'Email is required.',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email address.',
                },
              })}
            />

            <TextField
              label="Employee ID"
              required
              fullWidth
              error={Boolean(errors.employeeId)}
              helperText={errors.employeeId?.message}
              {...register('employeeId', {
                required: 'Employee ID is required.',
              })}
            />

            <TextField label="Department" fullWidth {...register('department')} />
            <TextField label="Floor" fullWidth {...register('floor')} />
            <TextField label="Desk Number" fullWidth {...register('deskNumber')} />
            <TextField label="Phone Number" fullWidth {...register('phoneNumber')} />

            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel id="add-user-role-label">Role</InputLabel>
                  <Select
                    {...field}
                    labelId="add-user-role-label"
                    label="Role"
                  >
                    <MenuItem value={ROLES.USER}>User</MenuItem>
                    <MenuItem value={ROLES.SUPER_ADMIN}>Super Admin</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel id="add-user-status-label">Status</InputLabel>
                  <Select
                    {...field}
                    labelId="add-user-status-label"
                    label="Status"
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="disabled">Disabled</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            <TextField
              label="Notes"
              fullWidth
              multiline
              minRows={2}
              {...register('notes')}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
