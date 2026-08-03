import { useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import { DataGrid, type GridRowParams, type GridSortModel } from '@mui/x-data-grid'
import { EmptyState } from '@/components'
import { useActivityLogs } from '@/hooks/useActivityLogs'
import type { ActivityLog } from '@/models'
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_MODULES,
  type ActivityLogRow,
} from '@/types/activityLog'
import { activityLogColumns } from './activityLogColumns'
import { ViewActivityLogDialog } from './ViewActivityLogDialog'

const ALL_FILTER = 'all'

function toDayStart(value: string): number | null {
  if (!value) {
    return null
  }
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? null : date.getTime()
}

function toDayEnd(value: string): number | null {
  if (!value) {
    return null
  }
  const date = new Date(`${value}T23:59:59.999`)
  return Number.isNaN(date.getTime()) ? null : date.getTime()
}

export function ActivityLogsPage() {
  const { logs, rows, loading, error } = useActivityLogs()

  const [search, setSearch] = useState('')
  const [moduleFilter, setModuleFilter] = useState(ALL_FILTER)
  const [actionFilter, setActionFilter] = useState(ALL_FILTER)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'createdAt', sort: 'desc' },
  ])
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null)

  const filteredRows = useMemo(() => {
    const queryText = search.trim().toLowerCase()
    const fromMs = toDayStart(dateFrom)
    const toMs = toDayEnd(dateTo)

    return rows.filter((row) => {
      if (moduleFilter !== ALL_FILTER && row.module !== moduleFilter) {
        return false
      }
      if (actionFilter !== ALL_FILTER && row.action !== actionFilter) {
        return false
      }
      if (fromMs != null && (row.createdAt == null || row.createdAt < fromMs)) {
        return false
      }
      if (toMs != null && (row.createdAt == null || row.createdAt > toMs)) {
        return false
      }
      if (!queryText) {
        return true
      }

      return [row.performedByName, row.targetName, row.action, row.description]
        .join(' ')
        .toLowerCase()
        .includes(queryText)
    })
  }, [rows, search, moduleFilter, actionFilter, dateFrom, dateTo])

  const hasFilters =
    Boolean(search.trim()) ||
    moduleFilter !== ALL_FILTER ||
    actionFilter !== ALL_FILTER ||
    Boolean(dateFrom) ||
    Boolean(dateTo)

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h5" component="h2">
          Activity Logs
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {loading
            ? 'Loading activity logs…'
            : `${rows.length} log${rows.length === 1 ? '' : 's'} · live updates enabled`}
        </Typography>
      </Stack>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ flexWrap: 'wrap' }}
      >
        <TextField
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by user, device, or action…"
          size="small"
          sx={{ flex: 1, minWidth: { xs: '100%', md: 260 } }}
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
          <InputLabel id="activity-module-filter-label">Module</InputLabel>
          <Select
            labelId="activity-module-filter-label"
            label="Module"
            value={moduleFilter}
            onChange={(event) => setModuleFilter(event.target.value)}
          >
            <MenuItem value={ALL_FILTER}>All modules</MenuItem>
            {ACTIVITY_MODULES.map((module) => (
              <MenuItem key={module} value={module}>
                {module}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="activity-action-filter-label">Action</InputLabel>
          <Select
            labelId="activity-action-filter-label"
            label="Action"
            value={actionFilter}
            onChange={(event) => setActionFilter(event.target.value)}
          >
            <MenuItem value={ALL_FILTER}>All actions</MenuItem>
            {ACTIVITY_ACTIONS.map((action) => (
              <MenuItem key={action} value={action}>
                {action}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="From"
          type="date"
          size="small"
          value={dateFrom}
          onChange={(event) => setDateFrom(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ minWidth: 150 }}
        />

        <TextField
          label="To"
          type="date"
          size="small"
          value={dateTo}
          onChange={(event) => setDateTo(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ minWidth: 150 }}
        />
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Box sx={{ height: 620, width: '100%' }}>
          <DataGrid
            rows={filteredRows}
            columns={activityLogColumns}
            loading={loading}
            disableRowSelectionOnClick
            sortingOrder={['desc', 'asc']}
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            onRowClick={(params: GridRowParams<ActivityLogRow>) => {
              const log = logs.find((item) => item.id === params.row.id) ?? null
              setSelectedLog(log)
            }}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 25, page: 0 },
              },
            }}
            pageSizeOptions={[25, 50, 100]}
            slots={{
              noRowsOverlay: () => (
                <EmptyState
                  title="No activity logs found"
                  description={
                    hasFilters
                      ? 'Try adjusting your search or filters.'
                      : 'Activity will appear here as actions are performed.'
                  }
                />
              ),
            }}
            sx={{
              border: 'none',
              '& .MuiDataGrid-row': {
                cursor: 'pointer',
              },
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

      <ViewActivityLogDialog
        open={Boolean(selectedLog)}
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </Stack>
  )
}
