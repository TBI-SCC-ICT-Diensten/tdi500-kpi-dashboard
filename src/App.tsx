import { useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createAppTheme } from './theme/theme';
import { ColorModeProvider, useColorMode } from './context/ColorModeContext';
import { RoleProvider, useRole } from './context/RoleContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import { DashboardProvider } from './context/DashboardContext';
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import ContingentDetailPage from './pages/ContingentDetailPage';
import NotFoundPage from './pages/NotFoundPage';
// [BAG-LOOKUP] Remove this import to disable the feature
import BagLookupPage from './pages/BagLookupPage';

/**
 * Role-aware root route. Installateur lands on the inregelen workflow;
 * beheerder lands on the KPI dashboard.
 *
 * Note: this is a UI-level convenience. Beheerders can still type
 * /bag-lookup in the URL bar and see the workflow; installateurs can
 * still type / to see the dashboard after this redirect fires if
 * they use browser back/forward. This matches the role-switcher
 * framing: UI preference, not access control.
 */
const RoleAwareLanding = () => {
  const { role } = useRole();
  if (role === 'installateur') {
    return <Navigate to="/bag-lookup" replace />;
  }
  return <DashboardPage />;
};

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
                <Route index element={<RoleAwareLanding />} />
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
    <RoleProvider>
      <AppRoutes />
    </RoleProvider>
  </ColorModeProvider>
);

export default App;
