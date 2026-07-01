import { createTheme } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';
import { STATUS_COLORS } from './statusColors';

export const createAppTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main:         mode === 'dark' ? '#60A5FA' : '#1E3A5F',
        light:        mode === 'dark' ? '#93C5FD' : '#2E5487',
        dark:         mode === 'dark' ? '#3B82F6' : '#122440',
        contrastText: mode === 'dark' ? '#0F172A'  : '#ffffff',
      },
      secondary: {
        main: '#0EA5E9',
        light: '#38BDF8',
        dark: '#0284C7',
        contrastText: '#ffffff',
      },
      error: {
        main:  STATUS_COLORS.danger,
        light: '#FEE2E2',
        dark:  '#991B1B',
      },
      warning: {
        main:  STATUS_COLORS.warning,
        light: '#FEF3C7',
        dark:  '#92400E',
      },
      success: {
        main:  STATUS_COLORS.healthy,
        light: '#DCFCE7',
        dark:  '#14532D',
      },
      info: {
        main:  '#0EA5E9',
        light: '#E0F2FE',
        dark:  '#0284C7',
      },
      background: {
        default: mode === 'dark' ? '#0F172A' : '#F8FAFC',
        paper:   mode === 'dark' ? '#1E293B' : '#FFFFFF',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", sans-serif',
      h4:       { fontWeight: 600 },
      h5:       { fontWeight: 700 },
      h6:       { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      body2:    { fontSize: '0.8125rem' },
      caption:  { fontSize: '0.75rem' },
    },
    components: {
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'dark' ? '#1E293B' : '#1E3A5F',
            color: '#ffffff',
          },
        },
      },
    },
  });
