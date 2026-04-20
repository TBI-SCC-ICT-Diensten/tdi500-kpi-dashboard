import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1E3A5F',
      light: '#2E5487',
      dark: '#122440',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0EA5E9',
      light: '#38BDF8',
      dark: '#0284C7',
      contrastText: '#ffffff',
    },
    error: {
      main: '#DC2626',
      light: '#FEE2E2',
      dark: '#991B1B',
    },
    warning: {
      main: '#D97706',
      light: '#FEF3C7',
      dark: '#92400E',
    },
    success: {
      main: '#16A34A',
      light: '#DCFCE7',
      dark: '#14532D',
    },
    info: {
      main: '#0EA5E9',
      light: '#E0F2FE',
      dark: '#0284C7',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h4: { fontWeight: 600 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    body2: { fontSize: '0.8125rem' },
    caption: { fontSize: '0.75rem' },
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1E3A5F',
          color: '#ffffff',
        },
      },
    },
  },
});

export default theme;
