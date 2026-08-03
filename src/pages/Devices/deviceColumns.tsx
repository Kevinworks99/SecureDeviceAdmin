import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import { DeviceStatusBadge } from '@/components'
import type { DeviceRow } from '@/types/device'
import { formatTimestamp } from '@/utils/formatTimestamp'

export interface DeviceColumnActions {
  onView: (row: DeviceRow) => void
  onEdit: (row: DeviceRow) => void
  onDelete: (row: DeviceRow) => void
}

function renderStatus(params: GridRenderCellParams<DeviceRow>) {
  return <DeviceStatusBadge status={params.row.status} />
}

function renderUpdatedAt(params: GridRenderCellParams<DeviceRow, number | null>) {
  return formatTimestamp(params.value)
}

function createActionsRenderer(actions: DeviceColumnActions) {
  return function renderActions(params: GridRenderCellParams<DeviceRow>) {
    const row = params.row
    const isDeleted = String(row.status).toLowerCase() === 'deleted'

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

        <Tooltip title="Delete">
          <span>
            <IconButton
              size="small"
              onClick={() => actions.onDelete(row)}
              disabled={isDeleted}
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

export function createDeviceColumns(
  actions: DeviceColumnActions,
): GridColDef<DeviceRow>[] {
  return [
    {
      field: 'deviceName',
      headerName: 'Device Name',
      flex: 1.2,
      minWidth: 120,
      sortable: true,
    },
    {
      field: 'brand',
      headerName: 'Brand',
      flex: 0.8,
      minWidth: 90,
      sortable: true,
    },
    {
      field: 'model',
      headerName: 'Model',
      flex: 1,
      minWidth: 100,
      sortable: true,
    },
    {
      field: 'osVersion',
      headerName: 'OS Version',
      flex: 0.6,
      minWidth: 90,
      sortable: true,
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.7,
      minWidth: 100,
      sortable: true,
      renderCell: renderStatus,
    },
    {
      field: 'updatedAt',
      headerName: 'Last Updated',
      flex: 1,
      minWidth: 130,
      sortable: true,
      type: 'number',
      renderCell: renderUpdatedAt,
      valueFormatter: (value: number | null) => formatTimestamp(value),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 130,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: createActionsRenderer(actions),
    },
  ]
}
