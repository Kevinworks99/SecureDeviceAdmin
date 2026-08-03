import type { ReactNode } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { SvgIconComponent } from '@mui/icons-material'
import type { AccentColor } from '@/types'

interface DashboardCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: SvgIconComponent
  color?: AccentColor
  action?: ReactNode
}

export function DashboardCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'primary',
  action,
}: DashboardCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          borderColor: (theme) => theme.palette[color].main,
          boxShadow: (theme) =>
            theme.palette.mode === 'light'
              ? '0 8px 24px rgba(15, 23, 42, 0.06)'
              : '0 8px 24px rgba(0, 0, 0, 0.35)',
        },
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 500, mb: 1 }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              component="p"
              sx={{ lineHeight: 1.15, fontWeight: 700 }}
            >
              {value}
            </Typography>
            {subtitle ? (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 1 }}
              >
                {subtitle}
              </Typography>
            ) : null}
          </Box>

          {Icon ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: 2,
                flexShrink: 0,
                bgcolor: (theme) =>
                  theme.palette.mode === 'light'
                    ? `${theme.palette[color].main}14`
                    : `${theme.palette[color].main}24`,
                color: `${color}.main`,
              }}
            >
              <Icon fontSize="medium" />
            </Box>
          ) : null}
        </Box>

        {action ? <Box sx={{ mt: 2 }}>{action}</Box> : null}
      </CardContent>
    </Card>
  )
}
