import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import { UserAvatar, UserStatusBadge } from '@/components'
import type { UserRow } from '@/types/userManagement'
import { formatTimestamp } from '@/utils/formatTimestamp'

export interface UserColumnActions {
  onView: (row: UserRow) => void
  onEdit: (row: UserRow) => void
  onToggleStatus: (row: UserRow) => void
  onDelete: (row: UserRow) => void
  currentUserId?: string
}

function renderProfile(params: GridRenderCellParams<UserRow>) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
      <UserAvatar fullName={params.row.fullName} />
    </Box>
  )
}

function renderRole(params: GridRenderCellParams<UserRow>) {
  const label = params.row.role === 'super_admin' ? 'Super Admin' : 'User'
  return (
    <Chip
      size="small"
      label={label}
      variant="outlined"
      color={params.row.role === 'super_admin' ? 'primary' : 'default'}
      sx={{ fontWeight: 600 }}
    />
  )
}

function renderStatus(params: GridRenderCellParams<UserRow>) {
  return <UserStatusBadge status={params.row.status} />
}

function renderCreatedAt(params: GridRenderCellParams<UserRow, number | null>) {
  return formatTimestamp(params.value)
}

function createActionsRenderer(actions: UserColumnActions) {
  return function renderActions(params: GridRenderCellParams<UserRow>) {
    const row = params.row
    const isSelf = actions.currentUserId === row.id
    const isDeleted = row.status === 'deleted'
    const isActive = row.status === 'active'

    return (
      <Stack
        direction="row"
        spacing={0.25}
        sx={{ alignItems: 'center', height: '100%' }}
      >
        <Tooltip title="View">
          <IconButton size="small" onClick={() => actions.onView(row)}>
            <VisibilityOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Edit">
          <span>
            <IconButton
              size="small"
              onClick={() => actions.onEdit(row)}
              disabled={isDeleted}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        {!isDeleted ? (
          <Tooltip title={isActive ? 'Disable' : 'Enable'}>
            <span>
              <IconButton
                size="small"
                onClick={() => actions.onToggleStatus(row)}
                disabled={isSelf}
                color={isActive ? 'warning' : 'success'}
              >
                {isActive ? (
                  <BlockOutlinedIcon fontSize="small" />
                ) : (
                  <CheckCircleOutlineOutlinedIcon fontSize="small" />
                )}
              </IconButton>
            </span>
          </Tooltip>
        ) : null}

        <Tooltip title="Delete">
          <span>
            <IconButton
              size="small"
              onClick={() => actions.onDelete(row)}
              disabled={isSelf || isDeleted}
              color="error"
            >
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    )
  }
}

export function createUserColumns(actions: UserColumnActions): GridColDef<UserRow>[] {
  return [
    {
      field: 'profile',
      headerName: 'Profile',
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: renderProfile,
    },
    {
      field: 'fullName',
      headerName: 'Full Name',
      flex: 1,
      minWidth: 150,
      sortable: true,
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1.2,
      minWidth: 200,
      sortable: true,
    },
    {
      field: 'employeeId',
      headerName: 'Employee ID',
      width: 130,
      sortable: true,
    },
    {
      field: 'department',
      headerName: 'Department',
      flex: 0.8,
      minWidth: 120,
      sortable: true,
    },
    {
      field: 'floor',
      headerName: 'Floor',
      width: 90,
      sortable: true,
    },
    {
      field: 'deskNumber',
      headerName: 'Desk Number',
      width: 120,
      sortable: true,
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 130,
      sortable: true,
      renderCell: renderRole,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      sortable: true,
      renderCell: renderStatus,
    },
    {
      field: 'assignedDevice',
      headerName: 'Assigned Device',
      flex: 1,
      minWidth: 140,
      sortable: true,
    },
    {
      field: 'createdAt',
      headerName: 'Created Date',
      flex: 1,
      minWidth: 170,
      sortable: true,
      type: 'number',
      renderCell: renderCreatedAt,
      valueFormatter: (value: number | null) => formatTimestamp(value),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 170,
      sortable: false,
      filterable: false,
      renderCell: createActionsRenderer(actions),
    },
  ]
}
