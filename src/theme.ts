import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00E5FF', // Vibrant Cyan
      light: '#69FFFF',
      dark: '#00B2CC',
      contrastText: '#000000',
    },
    secondary: {
      main: '#D500F9', // Vibrant Purple
      light: '#FF5BFF',
      dark: '#9E00C5',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#0A1929', // Deep dark blue
      paper: '#132F4C', // Slightly lighter for surfaces
    },
    text: {
      primary: '#F3F6F9',
      secondary: '#B2BAC2',
    },
    error: {
      main: '#FF5252',
    },
    success: {
      main: '#69F0AE',
    },
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 0 rgba(0, 229, 255, 0.4); }
          70% { box-shadow: 0 0 20px 10px rgba(0, 229, 255, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 229, 255, 0); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        body {
          background: linear-gradient(-45deg, #0A1929, #132F4C, #091421, #001E3C);
          background-size: 400% 400%;
          animation: gradientMove 15s ease infinite;
          background-attachment: fixed;
        }
      `,
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          boxShadow: '0 4px 14px 0 rgba(0,0,0,0.39)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(0, 229, 255, 0.4)',
          },
        },
        containedPrimary: {
          backgroundColor: '#00B2CC',
          backgroundImage: 'linear-gradient(45deg, #00B2CC 30%, #00E5FF 90%)',
          color: '#000',
          '&:hover': {
            backgroundColor: '#00E5FF',
          },
        },
        containedSecondary: {
          backgroundColor: '#9E00C5',
          backgroundImage: 'linear-gradient(45deg, #9E00C5 30%, #D500F9 90%)',
          color: '#FFF',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(213, 0, 249, 0.4)',
          },
        },
      } as any,
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: 'rgba(19, 47, 76, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: 'rgba(10, 25, 41, 0.5)',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0, 229, 255, 0.5)',
              boxShadow: '0 0 8px rgba(0, 229, 255, 0.3)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00E5FF',
              boxShadow: '0 0 12px rgba(0, 229, 255, 0.5)',
            },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme;
