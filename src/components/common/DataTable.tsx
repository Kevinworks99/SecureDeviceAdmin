import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import {
  DataGrid,
  type DataGridProps,
  type GridColDef,
  type GridValidRowModel,
} from '@mui/x-data-grid'

interface DataTableProps<T extends GridValidRowModel>
  extends Omit<DataGridProps<T>, 'rows' | 'columns'> {
  rows: T[]
  columns: GridColDef<T>[]
  height?: number | string
  pageSize?: number
  pageSizeOptions?: number[]
}

export function DataTable<T extends GridValidRowModel>({
  rows,
  columns,
  height = 460,
  pageSize = 5,
  pageSizeOptions = [5, 10, 25],
  sx,
  ...rest
}: DataTableProps<T>) {
  return (
    <Paper
      sx={{
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ height, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
          initialState={{
            pagination: {
              paginationModel: { pageSize, page: 0 },
            },
          }}
          pageSizeOptions={pageSizeOptions}
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
            ...sx,
          }}
          {...rest}
        />
      </Box>
    </Paper>
  )
}
