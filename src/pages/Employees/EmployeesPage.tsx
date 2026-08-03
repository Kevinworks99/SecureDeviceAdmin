import { useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import { DataGrid } from '@mui/x-data-grid'
import { EmptyState } from '@/components'
import { useEmployees } from '@/hooks/useEmployees'
import { employeeColumns } from './employeeColumns'

export function EmployeesPage() {
  const { rows, loading, error } = useEmployees()
  const [search, setSearch] = useState('')

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) {
      return rows
    }

    return rows.filter((row) =>
      [
        row.employeeName,
        row.email,
        row.department,
        row.floor,
        row.deskNumber,
        row.assignedDevice,
        row.loginStatus,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }, [rows, search])

  const hasSearch = Boolean(search.trim())

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          alignItems: { sm: 'flex-end' },
          justifyContent: 'space-between',
        }}
      >
        <Stack spacing={0.5}>
          <Typography variant="h5" component="h2">
            Users
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {loading
              ? 'Loading users from Firestore…'
              : `${rows.length} user${rows.length === 1 ? '' : 's'} · live updates enabled`}
          </Typography>
        </Stack>

        <TextField
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search employees…"
          size="small"
          sx={{ width: { xs: '100%', sm: 320 } }}
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
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Box sx={{ height: 560, width: '100%' }}>
          <DataGrid
            rows={filteredRows}
            columns={employeeColumns}
            loading={loading}
            disableRowSelectionOnClick
            sortingOrder={['asc', 'desc']}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10, page: 0 },
              },
              sorting: {
                sortModel: [{ field: 'employeeName', sort: 'asc' }],
              },
            }}
            pageSizeOptions={[5, 10, 25, 50]}
            slots={{
              noRowsOverlay: () => (
                <EmptyState
                  title={hasSearch ? 'No matching employees' : 'No employees found'}
                  description={
                    hasSearch
                      ? 'Try a different search term.'
                      : 'Add documents to the Firestore users collection to see them here.'
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
    </Stack>
  )
}
