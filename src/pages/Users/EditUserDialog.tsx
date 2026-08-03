import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import Alert from '@mui/material/Alert'
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
import Typography from '@mui/material/Typography'
import { ROLES } from '@/constants/roles'
import type { User } from '@/models'
import { userManagementService } from '@/services/userManagementService'
import type { EditUserFormValues } from '@/types/userManagement'

interface EditUserDialogProps {
  open: boolean
  user: User | null
  onClose: () => void
  onUpdated: () => void
}

export function EditUserDialog({
  open,
  user,
  onClose,
  onUpdated,
}: EditUserDialogProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EditUserFormValues>()

  useEffect(() => {
    if (open && user) {
      reset({
        fullName: user.fullName,
        department: user.department,
        floor: user.floor,
        deskNumber: user.deskNumber,
        phoneNumber: user.phoneNumber,
        role: user.role,
        status: user.status === 'deleted' ? 'disabled' : user.status,
        notes: user.notes,
      })
      setSubmitError(null)
    }
  }, [open, user, reset])

  const onSubmit = async (values: EditUserFormValues) => {
    if (!user) {
      return
    }

    setSubmitError(null)
    try {
      await userManagementService.updateUser(user.id, {
        ...values,
        status: user.status === 'deleted' ? 'deleted' : values.status,
      })
      onUpdated()
      onClose()
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to update user.',
      )
    }
  }

  if (!user) {
    return null
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {submitError ? <Alert severity="error">{submitError}</Alert> : null}

            <TextField
              label="Email"
              value={user.email}
              fullWidth
              disabled
              helperText="Email cannot be changed."
            />

            <TextField
              label="UID"
              value={user.uid || user.id}
              fullWidth
              disabled
              helperText="UID cannot be changed."
            />

            <TextField
              label="Full Name"
              required
              fullWidth
              error={Boolean(errors.fullName)}
              helperText={errors.fullName?.message}
              {...register('fullName', { required: 'Full name is required.' })}
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
                  <InputLabel id="edit-user-role-label">Role</InputLabel>
                  <Select
                    {...field}
                    labelId="edit-user-role-label"
                    label="Role"
                  >
                    <MenuItem value={ROLES.USER}>User</MenuItem>
                    <MenuItem value={ROLES.SUPER_ADMIN}>Super Admin</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            {user.status !== 'deleted' ? (
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel id="edit-user-status-label">Status</InputLabel>
                    <Select
                      {...field}
                      labelId="edit-user-status-label"
                      label="Status"
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="disabled">Disabled</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                This user is deleted. Restore is not available from this form.
              </Typography>
            )}

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
            {isSubmitting ? 'Saving…' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
