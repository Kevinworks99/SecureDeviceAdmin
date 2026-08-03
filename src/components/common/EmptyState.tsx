import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined'

interface EmptyStateProps {
  title?: string
  description?: string
}

export function EmptyState({
  title = 'No employees found',
  description,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 1,
        px: 2,
        textAlign: 'center',
        color: 'text.secondary',
      }}
    >
      <PeopleOutlinedIcon sx={{ fontSize: 40, opacity: 0.5 }} />
      <Typography variant="subtitle1" color="text.primary" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      {description ? (
        <Typography variant="body2">{description}</Typography>
      ) : null}
    </Box>
  )
}
