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
import { useAuth } from '@/app/providers/AuthContext'
import { EmptyState } from '@/components'
import { ROLES } from '@/constants/roles'
import { useUserManagement } from '@/hooks/useUserManagement'
import type { User } from '@/models'
import { userManagementService } from '@/services/userManagementService'
import type { UserRow } from '@/types/userManagement'
import { AddUserDialog } from './AddUserDialog'
import { EditUserDialog } from './EditUserDialog'
import { ViewUserDialog } from './ViewUserDialog'
import { createUserColumns } from './userColumns'

type ConfirmAction = 'toggle' | 'delete'

interface ConfirmState {
  action: ConfirmAction
  row: UserRow
}

const ALL_FILTER = 'all'

export function UsersPage() {
  const { userProfile } = useAuth()
  const { users, devices, rows, departments, loading, error } = useUserManagement()

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState(ALL_FILTER)
  const [statusFilter, setStatusFilter] = useState(ALL_FILTER)
  const [departmentFilter, setDepartmentFilter] = useState(ALL_FILTER)

  const [addOpen, setAddOpen] = useState(false)
  const [viewUser, setViewUser] = useState<User | null>(null)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error'
  }>({ open: false, message: '', severity: 'success' })

  const findUser = (id: string) => users.find((user) => user.id === id) ?? null

  const showMessage = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()

    return rows.filter((row) => {
      if (roleFilter !== ALL_FILTER && row.role !== roleFilter) {
        return false
      }
      if (statusFilter !== ALL_FILTER && row.status !== statusFilter) {
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

      return [row.fullName, row.email, row.employeeId]
        .join(' ')
        .toLowerCase()
        .includes(query)
    })
  }, [rows, search, roleFilter, statusFilter, departmentFilter])

  const columns = useMemo(
    () =>
      createUserColumns({
        currentUserId: userProfile?.id,
        onView: (row) => setViewUser(findUser(row.id)),
        onEdit: (row) => setEditUser(findUser(row.id)),
        onToggleStatus: (row) => setConfirmState({ action: 'toggle', row }),
        onDelete: (row) => setConfirmState({ action: 'delete', row }),
      }),
    [userProfile?.id, users],
  )

  const hasFilters =
    Boolean(search.trim()) ||
    roleFilter !== ALL_FILTER ||
    statusFilter !== ALL_FILTER ||
    departmentFilter !== ALL_FILTER

  const handleConfirm = async () => {
    if (!confirmState) {
      return
    }

    setActionLoading(true)
    try {
      if (confirmState.action === 'toggle') {
        await userManagementService.toggleUserEnabled(
          confirmState.row.id,
          confirmState.row.status,
        )
        showMessage(
          confirmState.row.status === 'active'
            ? 'User disabled successfully.'
            : 'User enabled successfully.',
        )
      } else {
        await userManagementService.softDeleteUser(confirmState.row.id)
        showMessage('User deleted successfully.')
      }
      setConfirmState(null)
    } catch (actionError) {
      showMessage(
        actionError instanceof Error
          ? actionError.message
          : 'Action failed.',
        'error',
      )
    } finally {
      setActionLoading(false)
    }
  }

  const confirmTitle =
    confirmState?.action === 'delete'
      ? 'Delete user?'
      : confirmState?.row.status === 'active'
        ? 'Disable user?'
        : 'Enable user?'

  const confirmMessage =
    confirmState?.action === 'delete'
      ? `This will soft-delete ${confirmState.row.fullName}. They will no longer appear as active and cannot log in.`
      : confirmState?.row.status === 'active'
        ? `${confirmState.row.fullName} will be prevented from logging in immediately.`
        : `${confirmState?.row.fullName ?? 'This user'} will be able to log in again.`

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
      >
        <Stack spacing={0.5}>
          <Typography variant="h5" component="h2">
            User Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {loading
              ? 'Loading users from Firestore…'
              : `${rows.length} user${rows.length === 1 ? '' : 's'} · live updates enabled`}
          </Typography>
        </Stack>

        <Button
          variant="contained"
          startIcon={<AddOutlinedIcon />}
          onClick={() => setAddOpen(true)}
          sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}
        >
          Add User
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
          placeholder="Search by name, email, or employee ID…"
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
          <InputLabel id="role-filter-label">Role</InputLabel>
          <Select
            labelId="role-filter-label"
            label="Role"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
          >
            <MenuItem value={ALL_FILTER}>All roles</MenuItem>
            <MenuItem value={ROLES.SUPER_ADMIN}>Super Admin</MenuItem>
            <MenuItem value={ROLES.USER}>User</MenuItem>
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
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="disabled">Disabled</MenuItem>
            <MenuItem value="deleted">Deleted</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="department-filter-label">Department</InputLabel>
          <Select
            labelId="department-filter-label"
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
                sortModel: [{ field: 'fullName', sort: 'asc' }],
              },
            }}
            pageSizeOptions={[5, 10, 25, 50]}
            slots={{
              noRowsOverlay: () => (
                <EmptyState
                  title="No users found"
                  description={
                    hasFilters
                      ? 'Try adjusting your search or filters.'
                      : 'Add a user to get started.'
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

      <AddUserDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={() => showMessage('User created successfully.')}
      />

      <ViewUserDialog
        open={Boolean(viewUser)}
        user={viewUser}
        devices={devices}
        onClose={() => setViewUser(null)}
        onEdit={() => {
          setEditUser(viewUser)
          setViewUser(null)
        }}
      />

      <EditUserDialog
        open={Boolean(editUser)}
        user={editUser}
        onClose={() => setEditUser(null)}
        onUpdated={() => showMessage('User updated successfully.')}
      />

      <Dialog
        open={Boolean(confirmState)}
        onClose={() => !actionLoading && setConfirmState(null)}
      >
        <DialogTitle>{confirmTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmState(null)}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            color={confirmState?.action === 'delete' ? 'error' : 'primary'}
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? 'Processing…' : 'Confirm'}
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
