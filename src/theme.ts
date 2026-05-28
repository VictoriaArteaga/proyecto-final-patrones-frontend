import { createTheme } from '@mui/material/styles';

// Modern Pastel Color Palette
const paletteColors = {
  darkBlue: '#2C4A6D',
  lightBlue: '#6B9BD1',
  lightCyan: '#A8D8EA',
  softPink: '#E8D1E0',
  softPurple: '#9E8DAD',
  white: '#FFFFFF',
  darkText: '#1A1A2E',
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: paletteColors.lightBlue, // Light Blue
      light: paletteColors.lightCyan,
      dark: paletteColors.darkBlue,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: paletteColors.softPurple, // Soft Purple
      light: paletteColors.softPink,
      dark: paletteColors.darkBlue,
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8F9FA', // Very light background
      paper: '#FFFFFF', // White surfaces
    },
    text: {
      primary: paletteColors.darkText,
      secondary: '#666666',
    },
    error: {
      main: '#E74C3C',
    },
    success: {
      main: '#27AE60',
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
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes softGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes vivoBgMove {
          0% { background-position: 0% 50%, 100% 50%, 0% 0%, 0% 0%; }
          25% { background-position: 50% 100%, 50% 0%, 100% 50%, 0% 0%; }
          50% { background-position: 100% 50%, 0% 50%, 0% 100%, 0% 0%; }
          75% { background-position: 50% 0%, 50% 100%, 50% 0%, 0% 0%; }
          100% { background-position: 0% 50%, 100% 50%, 0% 0%, 0% 0%; }
        }
        body {
          background: #F8F9FA;
          background-attachment: fixed;
        }
      `,
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          boxShadow: '0 2px 8px rgba(107, 155, 209, 0.15)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 16px rgba(107, 155, 209, 0.25)',
          },
        },
        containedPrimary: {
          backgroundColor: paletteColors.lightBlue,
          backgroundImage: `linear-gradient(135deg, ${paletteColors.lightBlue} 0%, ${paletteColors.lightCyan} 100%)`,
          color: '#FFFFFF',
          fontWeight: 600,
          '&:hover': {
            backgroundColor: paletteColors.darkBlue,
            backgroundImage: `linear-gradient(135deg, ${paletteColors.darkBlue} 0%, ${paletteColors.lightBlue} 100%)`,
          },
        },
        containedSecondary: {
          backgroundColor: paletteColors.softPurple,
          backgroundImage: `linear-gradient(135deg, ${paletteColors.softPurple} 0%, ${paletteColors.softPink} 100%)`,
          color: '#FFFFFF',
          fontWeight: 600,
          '&:hover': {
            boxShadow: '0 6px 16px rgba(158, 141, 173, 0.3)',
          },
        },
      } as any,
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0px 4px 12px rgba(44, 74, 109, 0.08)',
          border: '1px solid rgba(107, 155, 209, 0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: '#FFFFFF',
          boxShadow: '0px 4px 12px rgba(44, 74, 109, 0.08)',
          border: '1px solid rgba(107, 155, 209, 0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0px 8px 24px rgba(44, 74, 109, 0.12)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#F8F9FA',
            transition: 'all 0.3s ease',
            '& fieldset': {
              borderColor: 'rgba(107, 155, 209, 0.2)',
            },
            '&:hover fieldset': {
              borderColor: paletteColors.lightBlue,
              boxShadow: '0 0 8px rgba(107, 155, 209, 0.2)',
            },
            '&.Mui-focused fieldset': {
              borderColor: paletteColors.darkBlue,
              boxShadow: `0 0 12px rgba(44, 74, 109, 0.25)`,
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid rgba(107, 155, 209, 0.2)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: paletteColors.darkText,
          boxShadow: '0 2px 8px rgba(44, 74, 109, 0.08)',
          borderBottom: `1px solid rgba(107, 155, 209, 0.1)`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          borderRight: `1px solid rgba(107, 155, 209, 0.1)`,
        },
      },
    },
  },
});

export default theme;
