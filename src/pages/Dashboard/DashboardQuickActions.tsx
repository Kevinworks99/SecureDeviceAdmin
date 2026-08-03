import { useNavigate } from 'react-router-dom'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import { PATHS } from '@/routes/paths'

export function DashboardQuickActions() {
  const navigate = useNavigate()

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      sx={{ flexWrap: 'wrap' }}
    >
      <Button
        variant="contained"
        startIcon={<AddOutlinedIcon />}
        onClick={() => navigate(PATHS.users)}
      >
        Add User
      </Button>
      <Button
        variant="outlined"
        startIcon={<DevicesOutlinedIcon />}
        onClick={() => navigate(PATHS.devices)}
      >
        Add Device
      </Button>
      <Button
        variant="outlined"
        startIcon={<AssignmentIndOutlinedIcon />}
        onClick={() => navigate(PATHS.assignments)}
      >
        Assign Device
      </Button>
    </Stack>
  )
}
