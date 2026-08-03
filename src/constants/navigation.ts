import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined'
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import type { NavItem } from '@/types'
import { PATHS } from '@/routes/paths'

export const DRAWER_WIDTH = 260

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    path: PATHS.dashboard,
    icon: DashboardOutlinedIcon,
  },
  {
    label: 'Users',
    path: PATHS.users,
    icon: PeopleOutlinedIcon,
  },
  {
    label: 'Devices',
    path: PATHS.devices,
    icon: DevicesOutlinedIcon,
  },
  {
    label: 'Assignments',
    path: PATHS.assignments,
    icon: AssignmentOutlinedIcon,
  },
  {
    label: 'Activity Logs',
    path: PATHS.activityLogs,
    icon: HistoryOutlinedIcon,
  },
  {
    label: 'Settings',
    path: PATHS.settings,
    icon: SettingsOutlinedIcon,
  },
]
