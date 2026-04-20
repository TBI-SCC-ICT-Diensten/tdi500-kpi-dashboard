import { useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createAppTheme } from './theme/theme';
import { ColorModeProvider, useColorMode } from './context/ColorModeContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import { DashboardProvider } from './context/DashboardContext';
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import ContingentDetailPage from './pages/ContingentDetailPage';
import NotFoundPage from './pages/NotFoundPage';
// [BAG-LOOKUP] Remove this import to disable the feature
import BagLookupPage from './pages/BagLookupPage';

const AppRoutes = () => {
  const { mode } = useColorMode();
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ErrorBoundary>
          <DashboardProvider>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="contingent/:id" element={<ContingentDetailPage />} />
                {/* [BAG-LOOKUP] Remove this route to disable the feature */}
                <Route path="bag-lookup" element={<BagLookupPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </DashboardProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </ThemeProvider>
  );
};

const App = () => (
  <ColorModeProvider>
    <AppRoutes />
  </ColorModeProvider>
);

export default App;
