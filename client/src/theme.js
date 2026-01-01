import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#26a69a',
      light: '#4db6ac',
      dark: '#00897b',
    },
    background: {
      default: '#0a1929',
      paper: 'rgba(30, 41, 59, 0.7)',
      gradient: 'linear-gradient(135deg, #0a1929 0%, #1a2332 100%)',
    },
    text: {
      primary: '#ffffff',
      secondary: '#94a3b8',
    },
    error: {
      main: '#ef5350',
      light: '#ff6b6b',
    },
    success: {
      main: '#66bb6a',
      light: '#81c784',
    },
    divider: 'rgba(148, 163, 184, 0.12)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 2px 4px rgba(0,0,0,0.1)',
    '0 4px 8px rgba(0,0,0,0.12)',
    '0 8px 16px rgba(0,0,0,0.14)',
    '0 12px 24px rgba(0,0,0,0.16)',
    '0 16px 32px rgba(0,0,0,0.18)',
    '0 20px 40px rgba(0,0,0,0.2)',
    '0 24px 48px rgba(0,0,0,0.22)',
    '0 2px 4px rgba(0,0,0,0.1)',
    '0 4px 8px rgba(0,0,0,0.12)',
    '0 8px 16px rgba(0,0,0,0.14)',
    '0 12px 24px rgba(0,0,0,0.16)',
    '0 16px 32px rgba(0,0,0,0.18)',
    '0 20px 40px rgba(0,0,0,0.2)',
    '0 24px 48px rgba(0,0,0,0.22)',
    '0 28px 56px rgba(0,0,0,0.24)',
    '0 32px 64px rgba(0,0,0,0.26)',
    '0 36px 72px rgba(0,0,0,0.28)',
    '0 40px 80px rgba(0,0,0,0.3)',
    '0 44px 88px rgba(0,0,0,0.32)',
    '0 48px 96px rgba(0,0,0,0.34)',
    '0 52px 104px rgba(0,0,0,0.36)',
    '0 56px 112px rgba(0,0,0,0.38)',
    '0 60px 120px rgba(0,0,0,0.4)',
  ],
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          'marginBottom': '1rem',
          '& .MuiOutlinedInput-root': {
            'backgroundColor': 'rgba(15, 23, 42, 0.5)',
            'backdropFilter': 'blur(8px)',
            'transition': 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgba(15, 23, 42, 0.7)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              boxShadow: '0 0 0 2px rgba(33, 150, 243, 0.3)',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '1rem',
          fontWeight: 600,
          transition: 'all 0.3s ease',
        },
        contained: {
          'background': 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
          'boxShadow': '0 4px 12px rgba(33, 150, 243, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingTop: '2rem',
          paddingBottom: '2rem',
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        MenuProps: {
          PaperProps: {
            sx: {
              backgroundColor: '#1e293b',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              marginTop: '8px',
              minWidth: '200px',
            },
          },
        },
      },
      styleOverrides: {
        root: {
          minWidth: '200px',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          'backgroundColor': '#1e293b',
          'color': '#ffffff',
          'padding': '12px 16px',
          'fontSize': '1rem',
          '\u0026:hover': {
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
          },
          '\u0026.Mui-selected': {
            backgroundColor: 'rgba(59, 130, 246, 0.3)',
          },
          '\u0026.Mui-selected:hover': {
            backgroundColor: 'rgba(59, 130, 246, 0.4)',
          },
        },
      },
    },
  },
});

// Custom theme extensions for authentication
theme.custom = {
  auth: {
    cardBackground: 'rgba(30, 41, 59, 0.7)',
    cardBackdrop: 'blur(20px)',
    cardBorder: '1px solid rgba(148, 163, 184, 0.1)',
    inputGlow: '0 0 0 2px rgba(33, 150, 243, 0.3)',
    gradientPrimary: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
    gradientBackground: 'linear-gradient(135deg, #0a1929 0%, #1a2332 100%)',
  },
  transitions: {
    fast: '0.15s ease',
    normal: '0.3s ease',
    slow: '0.5s ease',
  },
};

export default theme;
