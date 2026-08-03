import Avatar from '@mui/material/Avatar'

interface UserAvatarProps {
  fullName: string
  size?: number
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return '?'
  }
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase()
  }
  return `${parts[0]![0] ?? ''}${parts[parts.length - 1]![0] ?? ''}`.toUpperCase()
}

/** Initials-based avatar — no Firebase Storage required. */
export function UserAvatar({ fullName, size = 36 }: UserAvatarProps) {
  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        fontWeight: 600,
        bgcolor: 'primary.main',
      }}
    >
      {getInitials(fullName)}
    </Avatar>
  )
}
