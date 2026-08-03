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
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import { DataGrid } from '@mui/x-data-grid'
import { useAuth } from '@/app/providers/AuthContext'
import { EmptyState } from '@/components'
import { useAssignments } from '@/hooks/useAssignments'
import type { Assignment } from '@/models'
import { assignmentService } from '@/services/assignmentService'
import type { AssignmentRow } from '@/types/assignment'
import { DEVICE_PLATFORMS } from '@/types/device'
import { AssignDeviceDialog } from './AssignDeviceDialog'
import { ViewAssignmentDialog } from './ViewAssignmentDialog'
import { createAssignmentColumns } from './assignmentColumns'

const ALL_FILTER = 'all'

export function AssignmentsPage() {
  const { userProfile } = useAuth()
  const { assignments, users, devices, rows, departments, loading, error } =
    useAssignments()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('active')
  const [platformFilter, setPlatformFilter] = useState(ALL_FILTER)
  const [departmentFilter, setDepartmentFilter] = useState(ALL_FILTER)

  const [assignOpen, setAssignOpen] = useState(false)
  const [viewAssignment, setViewAssignment] = useState<Assignment | null>(null)
  const [returnRow, setReturnRow] = useState<AssignmentRow | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error'
  }>({ open: false, message: '', severity: 'success' })

  const findAssignment = (id: string) =>
    assignments.find((assignment) => assignment.id === id) ?? null

  const showMessage = (
    message: string,
    severity: 'success' | 'error' = 'success',
  ) => {
    setSnackbar({ open: true, message, severity })
  }

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()

    return rows.filter((row) => {
      if (
        statusFilter !== ALL_FILTER &&
        String(row.status).toLowerCase() !== statusFilter
      ) {
        return false
      }
      if (platformFilter !== ALL_FILTER && row.platform !== platformFilter) {
        return false
      }
      if (
        departmentFilter !== ALL_FILTER &&
        row.department !== departmentFilter
      ) {
        return false
      }
      if (!query) {
        return true
      }

      return [
        row.assignedUser,
        row.employeeId,
        row.deviceName,
        row.assetTag,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    })
  }, [rows, search, statusFilter, platformFilter, departmentFilter])

  const columns = useMemo(
    () =>
      createAssignmentColumns({
        onView: (row) => setViewAssignment(findAssignment(row.id)),
        onReturn: (row) => setReturnRow(row),
      }),
    [assignments],
  )

  const hasFilters =
    Boolean(search.trim()) ||
    statusFilter !== ALL_FILTER ||
    platformFilter !== ALL_FILTER ||
    departmentFilter !== ALL_FILTER

  const handleReturn = async () => {
    if (!returnRow) {
      return
    }

    setActionLoading(true)
    try {
      await assignmentService.returnDevice(returnRow.id)
      showMessage('Device returned successfully.')
      setReturnRow(null)
      setViewAssignment(null)
    } catch (actionError) {
      showMessage(
        actionError instanceof Error
          ? actionError.message
          : 'Failed to return device.',
        'error',
      )
    } finally {
      setActionLoading(false)
    }
  }

  const assignedBy =
    userProfile?.fullName || userProfile?.email || userProfile?.id || 'super_admin'

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
      >
        <Stack spacing={0.5}>
          <Typography variant="h5" component="h2">
            Device Assignments
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {loading
              ? 'Loading assignments from Firestore…'
              : `${rows.length} assignment${rows.length === 1 ? '' : 's'} · live updates enabled`}
          </Typography>
        </Stack>

        <Button
          variant="contained"
          startIcon={<AssignmentIndOutlinedIcon />}
          onClick={() => setAssignOpen(true)}
          sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}
        >
          Assign Device
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
          placeholder="Search by user, employee ID, device, or asset tag…"
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
          <InputLabel id="assignment-status-filter-label">Status</InputLabel>
          <Select
            labelId="assignment-status-filter-label"
            label="Status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <MenuItem value={ALL_FILTER}>All statuses</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="returned">Returned</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="assignment-platform-filter-label">Platform</InputLabel>
          <Select
            labelId="assignment-platform-filter-label"
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

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="assignment-department-filter-label">
            Department
          </InputLabel>
          <Select
            labelId="assignment-department-filter-label"
            label="Department"
            value={departmentFilter}
            onChange={(event) => setDepartmentFilter(event.target.value)}
          >
            <MenuItem value={ALL_FILTER}>All departments</MenuItem>
            {departments.map((department) => (
              <MenuItem key={department} value={department}>
                {department}
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
                sortModel: [{ field: 'assignedAt', sort: 'desc' }],
              },
            }}
            pageSizeOptions={[5, 10, 25, 50]}
            slots={{
              noRowsOverlay: () => (
                <EmptyState
                  title="No assignments found"
                  description={
                    hasFilters
                      ? 'Try adjusting your search or filters.'
                      : 'Assign a device to get started.'
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

      <AssignDeviceDialog
        open={assignOpen}
        users={users}
        devices={devices}
        assignedBy={assignedBy}
        onClose={() => setAssignOpen(false)}
        onAssigned={() => showMessage('Device assigned successfully.')}
      />

      <ViewAssignmentDialog
        open={Boolean(viewAssignment)}
        assignment={viewAssignment}
        onClose={() => setViewAssignment(null)}
        onReturn={() => {
          if (viewAssignment) {
            setReturnRow({
              id: viewAssignment.id,
              deviceName: viewAssignment.deviceName,
              platform: viewAssignment.platform,
              brand: viewAssignment.brand,
              assetTag: viewAssignment.assetTag,
              assignedUser: viewAssignment.userName,
              employeeId: viewAssignment.employeeId,
              department: viewAssignment.department,
              floor: viewAssignment.floor,
              deskNumber: viewAssignment.deskNumber,
              assignedAt: null,
              status: viewAssignment.status,
              notes: viewAssignment.notes,
              deviceId: viewAssignment.deviceId,
              userId: viewAssignment.userId,
              assignedBy: viewAssignment.assignedBy,
              returnedAt: null,
            })
          }
        }}
      />

      <Dialog
        open={Boolean(returnRow)}
        onClose={() => !actionLoading && setReturnRow(null)}
      >
        <DialogTitle>Return device?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to return this device?
            {returnRow
              ? ` (${returnRow.deviceName} → ${returnRow.assignedUser})`
              : ''}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setReturnRow(null)}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReturn}
            color="warning"
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? 'Returning…' : 'Return Device'}
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
