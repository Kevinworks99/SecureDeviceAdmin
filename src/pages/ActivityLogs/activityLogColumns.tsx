import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import Chip from '@mui/material/Chip'
import type { ActivityLogRow } from '@/types/activityLog'
import { formatTimestamp } from '@/utils/formatTimestamp'

function renderModule(params: GridRenderCellParams<ActivityLogRow>) {
  return (
    <Chip
      size="small"
      label={params.row.module}
      variant="outlined"
      sx={{ fontWeight: 600 }}
    />
  )
}

function renderCreatedAt(
  params: GridRenderCellParams<ActivityLogRow, number | null>,
) {
  return formatTimestamp(params.value)
}

export const activityLogColumns: GridColDef<ActivityLogRow>[] = [
  {
    field: 'createdAt',
    headerName: 'Date & Time',
    flex: 1,
    minWidth: 170,
    sortable: true,
    type: 'number',
    renderCell: renderCreatedAt,
    valueFormatter: (value: number | null) => formatTimestamp(value),
  },
  {
    field: 'module',
    headerName: 'Module',
    width: 140,
    sortable: true,
    renderCell: renderModule,
  },
  {
    field: 'action',
    headerName: 'Action',
    flex: 1,
    minWidth: 170,
    sortable: true,
  },
  {
    field: 'performedByName',
    headerName: 'Performed By',
    flex: 1,
    minWidth: 140,
    sortable: true,
  },
  {
    field: 'targetName',
    headerName: 'Target',
    flex: 1,
    minWidth: 140,
    sortable: true,
  },
  {
    field: 'description',
    headerName: 'Description',
    flex: 1.4,
    minWidth: 200,
    sortable: false,
  },
]
