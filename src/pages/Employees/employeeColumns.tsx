import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { LoginStatusBadge } from '@/components/common/LoginStatusBadge'
import type { EmployeeRow } from '@/types/employee'
import type { LoginStatus } from '@/types'
import { formatTimestamp } from '@/utils/formatTimestamp'

function renderLoginStatus(
  params: GridRenderCellParams<EmployeeRow, LoginStatus>,
) {
  return <LoginStatusBadge status={params.value} />
}

function renderTimestamp(
  params: GridRenderCellParams<EmployeeRow, number | null>,
) {
  return formatTimestamp(params.value)
}

export const employeeColumns: GridColDef<EmployeeRow>[] = [
  {
    field: 'employeeName',
    headerName: 'Employee Name',
    flex: 1,
    minWidth: 160,
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
    field: 'department',
    headerName: 'Department',
    flex: 0.8,
    minWidth: 130,
    sortable: true,
  },
  {
    field: 'floor',
    headerName: 'Floor',
    width: 100,
    align: 'center',
    headerAlign: 'center',
    sortable: true,
  },
  {
    field: 'deskNumber',
    headerName: 'Desk Number',
    width: 130,
    sortable: true,
  },
  {
    field: 'assignedDevice',
    headerName: 'Assigned Device',
    flex: 1,
    minWidth: 150,
    sortable: true,
  },
  {
    field: 'loginStatus',
    headerName: 'Login Status',
    width: 140,
    sortable: true,
    type: 'singleSelect',
    valueOptions: ['Online', 'Offline'],
    renderCell: renderLoginStatus,
  },
  {
    field: 'lastLoginAt',
    headerName: 'Last Login',
    flex: 1,
    minWidth: 170,
    sortable: true,
    type: 'number',
    renderCell: renderTimestamp,
    valueFormatter: (value: number | null) => formatTimestamp(value),
  },
  {
    field: 'lastSeenAt',
    headerName: 'Last Seen',
    flex: 1,
    minWidth: 170,
    sortable: true,
    type: 'number',
    renderCell: renderTimestamp,
    valueFormatter: (value: number | null) => formatTimestamp(value),
  },
]
