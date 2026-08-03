export const PATHS = {
  login: '/login',
  dashboard: '/dashboard',
  users: '/users',
  devices: '/devices',
  assignments: '/assignments',
  activityLogs: '/activity-logs',
  settings: '/settings',
  home: '/home',
  profile: '/profile',
  myDevice: '/my-device',
} as const

export type AppPath = (typeof PATHS)[keyof typeof PATHS]
