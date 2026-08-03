import Chip from '@mui/material/Chip'
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { AssignmentStatusBadge } from '@/components/common/AssignmentStatusBadge'
import { DeviceStatusBadge } from '@/components/common/DeviceStatusBadge'
import { UserStatusBadge } from '@/components/common/UserStatusBadge'
import type {
  DashboardAssignmentRow,
  DashboardDeviceRow,
  DashboardPresenceRow,
  DashboardUserRow,
} from '@/types/dashboard'
import { formatTimeOnly, formatTimestamp } from '@/utils/formatTimestamp'

export const dashboardPresenceColumns: GridColDef<DashboardPresenceRow>[] = [
  {
    field: 'fullName',
    headerName: 'Name',
    flex: 1.2,
    minWidth: 140,
  },
  {
    field: 'currentDeviceName',
    headerName: 'Android Device Name',
    flex: 1,
    minWidth: 160,
  },
  {
    field: 'floor',
    headerName: 'Floor',
    flex: 0.5,
    minWidth: 70,
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'deskNumber',
    headerName: 'Desk Number',
    flex: 0.7,
    minWidth: 100,
  },
  {
    field: 'notes',
    headerName: 'Note',
    flex: 1,
    minWidth: 140,
  },
  {
    field: 'lastLoginAt',
    headerName: 'Logged In',
    flex: 0.7,
    minWidth: 100,
    type: 'number',
    valueFormatter: (value: number | null) => formatTimeOnly(value),
  },
  {
    field: 'lastLogoutAt',
    headerName: 'Logged Out',
    flex: 0.7,
    minWidth: 100,
    type: 'number',
    valueFormatter: (value: number | null) => formatTimeOnly(value),
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 120,
    renderCell: (params: GridRenderCellParams<DashboardPresenceRow>) => {
      const isActive = params.row.status === 'active'
      return (
        <Chip
          size="small"
          label={isActive ? 'Active' : 'Inactive'}
          color={isActive ? 'success' : 'default'}
          variant={isActive ? 'filled' : 'outlined'}
          sx={{
            fontWeight: 600,
            minWidth: 80,
            ...(!isActive
              ? {
                  color: 'text.secondary',
                  borderColor: 'divider',
                }
              : {}),
          }}
        />
      )
    },
  },
]

export const dashboardAssignmentColumns: GridColDef<DashboardAssignmentRow>[] = [
  {
    field: 'deviceName',
    headerName: 'Device Name',
    flex: 1,
    minWidth: 140,
  },
  {
    field: 'userName',
    headerName: 'User Name',
    flex: 1,
    minWidth: 140,
  },
  {
    field: 'employeeId',
    headerName: 'Employee ID',
    width: 130,
  },
  {
    field: 'assignedAt',
    headerName: 'Assigned Date',
    flex: 1,
    minWidth: 160,
    type: 'number',
    valueFormatter: (value: number | null) => formatTimestamp(value),
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 120,
    renderCell: (params: GridRenderCellParams<DashboardAssignmentRow>) => (
      <AssignmentStatusBadge status={params.row.status} />
    ),
  },
]

export const dashboardUserColumns: GridColDef<DashboardUserRow>[] = [
  {
    field: 'fullName',
    headerName: 'Name',
    flex: 1,
    minWidth: 140,
  },
  {
    field: 'email',
    headerName: 'Email',
    flex: 1.2,
    minWidth: 180,
  },
  {
    field: 'employeeId',
    headerName: 'Employee ID',
    width: 130,
  },
  {
    field: 'department',
    headerName: 'Department',
    flex: 0.8,
    minWidth: 120,
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 120,
    renderCell: (params: GridRenderCellParams<DashboardUserRow>) => (
      <UserStatusBadge status={params.row.status} />
    ),
  },
]

export const dashboardDeviceColumns: GridColDef<DashboardDeviceRow>[] = [
  {
    field: 'deviceName',
    headerName: 'Device Name',
    flex: 1,
    minWidth: 140,
  },
  {
    field: 'brand',
    headerName: 'Brand',
    flex: 0.7,
    minWidth: 110,
  },
  {
    field: 'platform',
    headerName: 'Platform',
    width: 110,
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 130,
    renderCell: (params: GridRenderCellParams<DashboardDeviceRow>) => (
      <DeviceStatusBadge status={params.row.status} />
    ),
  },
]
