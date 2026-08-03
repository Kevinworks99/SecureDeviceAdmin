import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { LoginStatusBadge } from '@/components/common/LoginStatusBadge'
import type { LoginActivityRow, LoginStatus } from '@/types'

function renderLoginStatus(
  params: GridRenderCellParams<LoginActivityRow, LoginStatus>,
) {
  return <LoginStatusBadge status={params.value} />
}

export const loginActivityColumns: GridColDef<LoginActivityRow>[] = [
  {
    field: 'employeeName',
    headerName: 'Employee',
    flex: 1,
    minWidth: 150,
  },
  {
    field: 'email',
    headerName: 'Email',
    flex: 1.3,
    minWidth: 200,
  },
  {
    field: 'department',
    headerName: 'Department',
    flex: 0.8,
    minWidth: 130,
  },
  {
    field: 'floor',
    headerName: 'Floor',
    width: 90,
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'deskNumber',
    headerName: 'Desk Number',
    width: 130,
  },
  {
    field: 'assignedDevice',
    headerName: 'Assigned Device',
    flex: 1,
    minWidth: 150,
  },
  {
    field: 'loginStatus',
    headerName: 'Status',
    width: 120,
    renderCell: renderLoginStatus,
  },
  {
    field: 'loginTime',
    headerName: 'Login Time',
    flex: 1,
    minWidth: 160,
  },
]
