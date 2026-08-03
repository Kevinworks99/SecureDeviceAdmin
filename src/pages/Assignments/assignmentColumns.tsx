import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined'
import { AssignmentStatusBadge } from '@/components/common/AssignmentStatusBadge'
import type { AssignmentRow } from '@/types/assignment'
import { formatTimestamp } from '@/utils/formatTimestamp'

export interface AssignmentColumnActions {
  onView: (row: AssignmentRow) => void
  onReturn: (row: AssignmentRow) => void
}

function renderStatus(params: GridRenderCellParams<AssignmentRow>) {
  return <AssignmentStatusBadge status={params.row.status} />
}

function renderAssignedAt(
  params: GridRenderCellParams<AssignmentRow, number | null>,
) {
  return formatTimestamp(params.value)
}

function createActionsRenderer(actions: AssignmentColumnActions) {
  return function renderActions(params: GridRenderCellParams<AssignmentRow>) {
    const row = params.row
    const isActive = String(row.status).toLowerCase() === 'active'

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

        <Tooltip title="Return Device">
          <span>
            <IconButton
              size="small"
              onClick={() => actions.onReturn(row)}
              disabled={!isActive}
              color="warning"
            >
              <UndoOutlinedIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    )
  }
}

export function createAssignmentColumns(
  actions: AssignmentColumnActions,
): GridColDef<AssignmentRow>[] {
  return [
    {
      field: 'deviceName',
      headerName: 'Device Name',
      flex: 1,
      minWidth: 140,
      sortable: true,
    },
    {
      field: 'platform',
      headerName: 'Platform',
      width: 110,
      sortable: true,
    },
    {
      field: 'brand',
      headerName: 'Brand',
      width: 110,
      sortable: true,
    },
    {
      field: 'assetTag',
      headerName: 'Asset Tag',
      width: 120,
      sortable: true,
    },
    {
      field: 'assignedUser',
      headerName: 'Assigned User',
      flex: 1,
      minWidth: 140,
      sortable: true,
    },
    {
      field: 'employeeId',
      headerName: 'Employee ID',
      width: 120,
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
      field: 'assignedAt',
      headerName: 'Assigned Date',
      flex: 1,
      minWidth: 160,
      sortable: true,
      type: 'number',
      renderCell: renderAssignedAt,
      valueFormatter: (value: number | null) => formatTimestamp(value),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      sortable: true,
      renderCell: renderStatus,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 110,
      sortable: false,
      filterable: false,
      renderCell: createActionsRenderer(actions),
    },
  ]
}
