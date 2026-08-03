import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { GridRowParams } from '@mui/x-data-grid'
import { DataTable, EmptyState } from '@/components'
import { useDashboard } from '@/hooks/useDashboard'
import type { Assignment } from '@/models'
import type { DashboardAssignmentRow } from '@/types/dashboard'
import { ViewAssignmentDialog } from '@/pages/Assignments/ViewAssignmentDialog'
import {
  dashboardAssignmentColumns,
  dashboardDeviceColumns,
  dashboardPresenceColumns,
  dashboardUserColumns,
} from './dashboardColumns'
import { DashboardQuickActions } from './DashboardQuickActions'
import { DashboardSkeleton } from './DashboardSkeleton'

export function DashboardPage() {
  const {
    presenceUsers,
    recentAssignments,
    recentUsers,
    recentDevices,
    assignments,
    loading,
    error,
  } = useDashboard()

  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null)

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <Stack spacing={3.5}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{
          alignItems: { md: 'flex-start' },
          justifyContent: 'space-between',
        }}
      >
        <Stack spacing={0.75}>
          <Typography variant="h5" component="h2">
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time overview of users, devices, and assignments.
          </Typography>
        </Stack>

        <DashboardQuickActions />
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Stack spacing={1.5}>
        <Stack spacing={0.5}>
          <Typography variant="h6" component="h3">
            User Login Status
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Active when signed in on a device · inactive when signed out
          </Typography>
        </Stack>

        {presenceUsers.length === 0 ? (
          <EmptyState title="No users available" description="" />
        ) : (
          <DataTable
            rows={presenceUsers}
            columns={dashboardPresenceColumns}
            height={380}
            pageSize={10}
            pageSizeOptions={[10]}
            hideFooter
          />
        )}
      </Stack>

      <Stack spacing={1.5}>
        <Stack spacing={0.5}>
          <Typography variant="h6" component="h3">
            Recent Device Assignments
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Latest 10 assignments · click a row for details
          </Typography>
        </Stack>

        {recentAssignments.length === 0 ? (
          <EmptyState title="No assignments available" description="" />
        ) : (
          <DataTable
            rows={recentAssignments}
            columns={dashboardAssignmentColumns}
            height={380}
            pageSize={10}
            pageSizeOptions={[10]}
            hideFooter
            onRowClick={(params: GridRowParams<DashboardAssignmentRow>) => {
              const assignment =
                assignments.find((item) => item.id === params.row.id) ?? null
              setSelectedAssignment(assignment)
            }}
            sx={{
              '& .MuiDataGrid-row': {
                cursor: 'pointer',
              },
            }}
          />
        )}
      </Stack>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Stack spacing={1.5}>
            <Stack spacing={0.5}>
              <Typography variant="h6" component="h3">
                Recent Users
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Latest 10 users
              </Typography>
            </Stack>

            {recentUsers.length === 0 ? (
              <EmptyState title="No users available" description="" />
            ) : (
              <DataTable
                rows={recentUsers}
                columns={dashboardUserColumns}
                height={380}
                pageSize={10}
                pageSizeOptions={[10]}
                hideFooter
              />
            )}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Stack spacing={1.5}>
            <Stack spacing={0.5}>
              <Typography variant="h6" component="h3">
                Recent Devices
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Latest 10 devices
              </Typography>
            </Stack>

            {recentDevices.length === 0 ? (
              <EmptyState title="No devices available" description="" />
            ) : (
              <DataTable
                rows={recentDevices}
                columns={dashboardDeviceColumns}
                height={380}
                pageSize={10}
                pageSizeOptions={[10]}
                hideFooter
              />
            )}
          </Stack>
        </Grid>
      </Grid>

      <ViewAssignmentDialog
        open={Boolean(selectedAssignment)}
        assignment={selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
      />
    </Stack>
  )
}
