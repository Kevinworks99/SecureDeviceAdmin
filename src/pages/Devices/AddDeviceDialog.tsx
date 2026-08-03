import { Controller, useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
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
import { deviceManagementService } from '@/services/deviceManagementService'
import {
  DEVICE_PLATFORMS,
  type DeviceFormValues,
} from '@/types/device'

interface AddDeviceDialogProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

const defaultValues: DeviceFormValues = {
  deviceName: '',
  brand: '',
  platform: 'Android',
  model: '',
  assetTag: '',
  imei: '',
  serialNumber: '',
  osVersion: '',
  ram: '',
  storage: '',
  color: '',
  purchaseDate: '',
  notes: '',
}

export function AddDeviceDialog({
  open,
  onClose,
  onCreated,
}: AddDeviceDialogProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DeviceFormValues>({
    defaultValues,
  })

  useEffect(() => {
    if (!open) {
      reset(defaultValues)
      setSubmitError(null)
    }
  }, [open, reset])

  const onSubmit = async (values: DeviceFormValues) => {
    setSubmitError(null)
    try {
      await deviceManagementService.createDevice(values)
      onCreated()
      onClose()
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to create device.',
      )
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogTitle>Add Device</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {submitError ? <Alert severity="error">{submitError}</Alert> : null}

            <TextField
              label="Device Name"
              required
              fullWidth
              error={Boolean(errors.deviceName)}
              helperText={errors.deviceName?.message}
              {...register('deviceName', {
                required: 'Device Name is required.',
              })}
            />

            <TextField
              label="Brand"
              required
              fullWidth
              error={Boolean(errors.brand)}
              helperText={errors.brand?.message}
              {...register('brand', { required: 'Brand is required.' })}
            />

            <Controller
              name="platform"
              control={control}
              rules={{ required: 'Platform is required.' }}
              render={({ field }) => (
                <FormControl fullWidth required error={Boolean(errors.platform)}>
                  <InputLabel id="add-device-platform-label">Platform</InputLabel>
                  <Select
                    {...field}
                    labelId="add-device-platform-label"
                    label="Platform"
                  >
                    {DEVICE_PLATFORMS.map((platform) => (
                      <MenuItem key={platform} value={platform}>
                        {platform}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />

            <TextField
              label="Model"
              required
              fullWidth
              error={Boolean(errors.model)}
              helperText={errors.model?.message}
              {...register('model', { required: 'Model is required.' })}
            />

            <TextField label="Asset Tag" fullWidth {...register('assetTag')} />
            <TextField label="IMEI" fullWidth {...register('imei')} />
            <TextField
              label="Serial Number"
              fullWidth
              {...register('serialNumber')}
            />
            <TextField label="OS Version" fullWidth {...register('osVersion')} />
            <TextField label="RAM" fullWidth {...register('ram')} />
            <TextField label="Storage" fullWidth {...register('storage')} />
            <TextField label="Color" fullWidth {...register('color')} />
            <TextField
              label="Purchase Date"
              type="date"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              {...register('purchaseDate')}
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
