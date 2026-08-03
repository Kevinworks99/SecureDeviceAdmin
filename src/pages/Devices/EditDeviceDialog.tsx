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
import type { Device } from '@/models'
import { deviceManagementService } from '@/services/deviceManagementService'
import {
  DEVICE_PLATFORMS,
  type DeviceFormValues,
} from '@/types/device'
import {
  DEVICE_MANAGE_STATUS_OPTIONS,
  toDeviceStatusValue,
} from '@/utils/deviceStatus'

interface EditDeviceDialogProps {
  open: boolean
  device: Device | null
  onClose: () => void
  onUpdated: () => void
}

export function EditDeviceDialog({
  open,
  device,
  onClose,
  onUpdated,
}: EditDeviceDialogProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DeviceFormValues>()

  useEffect(() => {
    if (open && device) {
      const status = toDeviceStatusValue(device.status)
      reset({
        deviceName: device.deviceName,
        brand: device.brand,
        platform: device.platform || 'Android',
        model: device.model,
        assetTag: device.assetTag,
        imei: device.imei,
        serialNumber: device.serialNumber,
        osVersion: device.osVersion || device.androidVersion,
        ram: device.ram,
        storage: device.storage,
        color: device.color,
        purchaseDate: device.purchaseDate,
        notes: device.notes,
        status: status === 'deleted' ? 'available' : status,
        assignedUserId: device.assignedUserId || device.assignedTo || '',
        assignedUserName:
          device.assignedUserName || device.assignedEmployeeName || '',
        assignedFloor: device.assignedFloor,
        assignedDeskNumber: device.assignedDeskNumber,
      })
      setSubmitError(null)
    }
  }, [open, device, reset])

  const onSubmit = async (values: DeviceFormValues) => {
    if (!device) {
      return
    }

    setSubmitError(null)
    try {
      await deviceManagementService.updateDevice(device.id, {
        deviceName: values.deviceName,
        brand: values.brand,
        platform: values.platform,
        model: values.model,
        assetTag: values.assetTag,
        imei: values.imei,
        serialNumber: values.serialNumber,
        osVersion: values.osVersion,
        ram: values.ram,
        storage: values.storage,
        color: values.color,
        purchaseDate: values.purchaseDate,
        notes: values.notes,
        status: values.status || 'available',
        assignedUserId: values.assignedUserId || '',
        assignedUserName: values.assignedUserName || '',
        assignedFloor: values.assignedFloor || '',
        assignedDeskNumber: values.assignedDeskNumber || '',
      })
      onUpdated()
      onClose()
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to update device.',
      )
    }
  }

  if (!device) {
    return null
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogTitle>Edit Device</DialogTitle>
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
                <FormControl fullWidth required>
                  <InputLabel id="edit-device-platform-label">Platform</InputLabel>
                  <Select
                    {...field}
                    labelId="edit-device-platform-label"
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

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel id="edit-device-status-label">Status</InputLabel>
                  <Select
                    {...field}
                    labelId="edit-device-status-label"
                    label="Status"
                  >
                    {DEVICE_MANAGE_STATUS_OPTIONS.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />

            <TextField
              label="Assigned User Name"
              fullWidth
              {...register('assignedUserName')}
            />
            <TextField
              label="Assigned User ID"
              fullWidth
              {...register('assignedUserId')}
            />
            <TextField
              label="Floor"
              fullWidth
              {...register('assignedFloor')}
            />
            <TextField
              label="Desk Number"
              fullWidth
              {...register('assignedDeskNumber')}
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
            {isSubmitting ? 'Saving…' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
