import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'

export function DashboardSkeleton() {
  return (
    <Stack spacing={3.5} aria-busy="true" aria-label="Loading dashboard">
      <Stack spacing={1}>
        <Skeleton variant="text" width={220} height={36} />
        <Skeleton variant="text" width={320} height={24} />
      </Stack>

      <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
        {[1, 2, 3].map((item) => (
          <Skeleton
            key={item}
            variant="rounded"
            width={140}
            height={40}
            sx={{ borderRadius: 1 }}
          />
        ))}
      </Stack>

      <Stack spacing={1.5}>
        <Skeleton variant="text" width={180} height={28} />
        <Skeleton variant="text" width={280} height={20} />
        <Paper sx={{ p: 2 }}>
          <Skeleton variant="rounded" height={220} />
        </Paper>
      </Stack>

      {[1, 2, 3].map((section) => (
        <Stack key={section} spacing={1.5}>
          <Skeleton variant="text" width={200} height={28} />
          <Paper sx={{ p: 2 }}>
            <Skeleton variant="rounded" height={220} />
          </Paper>
        </Stack>
      ))}
    </Stack>
  )
}
