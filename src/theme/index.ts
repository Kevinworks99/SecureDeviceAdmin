import { createTheme, type ThemeOptions } from '@mui/material/styles'
import type { ThemeMode } from '@/types'

const getDesignTokens = (mode: ThemeMode): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: {
            main: '#1565c0',
            light: '#5e92f3',
            dark: '#003c8f',
          },
          secondary: {
            main: '#00897b',
            light: '#4ebaaa',
            dark: '#005b4f',
          },
          background: {
            default: '#f5f7fa',
            paper: '#ffffff',
          },
          divider: 'rgba(0, 0, 0, 0.08)',
          text: {
            primary: '#1a2332',
            secondary: '#5f6b7a',
          },
        }
      : {
          primary: {
            main: '#90caf9',
            light: '#c3fdff',
            dark: '#5d99c6',
          },
          secondary: {
            main: '#80cbc4',
            light: '#b2fef7',
            dark: '#4f9a94',
          },
          background: {
            default: '#0f1419',
            paper: '#1a2332',
          },
          divider: 'rgba(255, 255, 255, 0.08)',
          text: {
            primary: '#e8eaed',
            secondary: '#9aa0a6',
          },
        }),
  },
  typography: {
    fontFamily: [
      '"Plus Jakarta Sans"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
        color: 'inherit',
      },
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }),
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          border: `1px solid ${theme.palette.divider}`,
          backgroundImage: 'none',
        }),
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
})

export const createAppTheme = (mode: ThemeMode) =>
  createTheme(getDesignTokens(mode))
