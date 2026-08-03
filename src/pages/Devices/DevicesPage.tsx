import { useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import { DataGrid } from '@mui/x-data-grid'
import { EmptyState } from '@/components'
import { useDeviceManagement } from '@/hooks/useDeviceManagement'
import type { Device } from '@/models'
import { deviceManagementService } from '@/services/deviceManagementService'
import {
  DEVICE_PLATFORMS,
  DEVICE_STATUS_FILTER_VALUES,
  type DeviceRow,
} from '@/types/device'
import { AddDeviceDialog } from './AddDeviceDialog'
import { EditDeviceDialog } from './EditDeviceDialog'
import { ViewDeviceDialog } from './ViewDeviceDialog'
import { createDeviceColumns } from './deviceColumns'

const ALL_FILTER = 'all'

export function DevicesPage() {
  const { devices, rows, brands, loading, error } = useDeviceManagement()

  const [search, setSearch] = useState('')
  const [platformFilter, setPlatformFilter] = useState(ALL_FILTER)
  const [statusFilter, setStatusFilter] = useState(ALL_FILTER)
  const [brandFilter, setBrandFilter] = useState(ALL_FILTER)

  const [addOpen, setAddOpen] = useState(false)
  const [viewDevice, setViewDevice] = useState<Device | null>(null)
  const [editDevice, setEditDevice] = useState<Device | null>(null)
  const [deleteRow, setDeleteRow] = useState<DeviceRow | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error'
  }>({ open: false, message: '', severity: 'success' })

  const findDevice = (id: string) =>
    devices.find((device) => device.id === id) ?? null

  const showMessage = (
    message: string,
    severity: 'success' | 'error' = 'success',
  ) => {
    setSnackbar({ open: true, message, severity })
  }

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()

    return rows.filter((row) => {
      if (platformFilter !== ALL_FILTER && row.platform !== platformFilter) {
        return false
      }
      if (
        statusFilter !== ALL_FILTER &&
        String(row.status).toLowerCase() !== statusFilter
      ) {
        return false
      }
      if (brandFilter !== ALL_FILTER && row.brand !== brandFilter) {
        return false
      }
      if (!query) {
        return true
      }

      return [row.deviceName, row.brand, row.model, row.assetTag, row.imei]
        .join(' ')
        .toLowerCase()
        .includes(query)
    })
  }, [rows, search, platformFilter, statusFilter, brandFilter])

  const columns = useMemo(
    () =>
      createDeviceColumns({
        onView: (row) => setViewDevice(findDevice(row.id)),
        onEdit: (row) => setEditDevice(findDevice(row.id)),
        onDelete: (row) => setDeleteRow(row),
      }),
    [devices],
  )

  const hasFilters =
    Boolean(search.trim()) ||
    platformFilter !== ALL_FILTER ||
    statusFilter !== ALL_FILTER ||
    brandFilter !== ALL_FILTER

  const handleDelete = async () => {
    if (!deleteRow) {
      return
    }

    setActionLoading(true)
    try {
      await deviceManagementService.softDeleteDevice(deleteRow.id)
      showMessage('Device deleted successfully.')
      setDeleteRow(null)
    } catch (actionError) {
      showMessage(
        actionError instanceof Error
          ? actionError.message
          : 'Failed to delete device.',
        'error',
      )
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
      >
        <Stack spacing={0.5}>
          <Typography variant="h5" component="h2">
            Device Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {loading
              ? 'Loading devices from Firestore…'
              : `${rows.length} device${rows.length === 1 ? '' : 's'} · live updates enabled`}
          </Typography>
        </Stack>

        <Button
          variant="contained"
          startIcon={<AddOutlinedIcon />}
          onClick={() => setAddOpen(true)}
          sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}
        >
          Add Device
        </Button>
      </Stack>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ flexWrap: 'wrap' }}
      >
        <TextField
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, brand, model, asset tag, or IMEI…"
          size="small"
          sx={{ flex: 1, minWidth: { xs: '100%', md: 280 } }}
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

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="platform-filter-label">Platform</InputLabel>
          <Select
            labelId="platform-filter-label"
            label="Platform"
            value={platformFilter}
            onChange={(event) => setPlatformFilter(event.target.value)}
          >
            <MenuItem value={ALL_FILTER}>All platforms</MenuItem>
            {DEVICE_PLATFORMS.map((platform) => (
              <MenuItem key={platform} value={platform}>
                {platform}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            label="Status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <MenuItem value={ALL_FILTER}>All statuses</MenuItem>
            {DEVICE_STATUS_FILTER_VALUES.map((status) => (
              <MenuItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="brand-filter-label">Brand</InputLabel>
          <Select
            labelId="brand-filter-label"
            label="Brand"
            value={brandFilter}
            onChange={(event) => setBrandFilter(event.target.value)}
          >
            <MenuItem value={ALL_FILTER}>All brands</MenuItem>
            {brands.map((brand) => (
              <MenuItem key={brand} value={brand}>
                {brand}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            loading={loading}
            disableRowSelectionOnClick
            sortingOrder={['asc', 'desc']}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10, page: 0 },
              },
              sorting: {
                sortModel: [{ field: 'deviceName', sort: 'asc' }],
              },
            }}
            pageSizeOptions={[5, 10, 25, 50]}
            slots={{
              noRowsOverlay: () => (
                <EmptyState
                  title="No devices found"
                  description={
                    hasFilters
                      ? 'Try adjusting your search or filters.'
                      : 'Add a device to get started.'
                  }
                />
              ),
            }}
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnHeaders': {
                bgcolor: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'grey.50'
                    : 'background.default',
              },
              '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                outline: 'none',
              },
            }}
          />
        </Box>
      </Paper>

      <AddDeviceDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={() => showMessage('Device created successfully.')}
      />

      <ViewDeviceDialog
        open={Boolean(viewDevice)}
        device={viewDevice}
        onClose={() => setViewDevice(null)}
        onEdit={() => {
          setEditDevice(viewDevice)
          setViewDevice(null)
        }}
      />

      <EditDeviceDialog
        open={Boolean(editDevice)}
        device={editDevice}
        onClose={() => setEditDevice(null)}
        onUpdated={() => showMessage('Device updated successfully.')}
      />

      <Dialog
        open={Boolean(deleteRow)}
        onClose={() => !actionLoading && setDeleteRow(null)}
      >
        <DialogTitle>Delete device?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will soft-delete {deleteRow?.deviceName}. Status will be set to
            deleted. The Firestore document will remain.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteRow(null)}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Stack>
  )
}
