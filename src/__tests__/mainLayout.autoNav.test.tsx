import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { RoleProvider, useRole } from '../context/RoleContext';
import { DashboardProvider } from '../context/DashboardContext';
import MainLayout from '../components/layout/MainLayout';

const theme = createTheme();

// A tiny page stub so we can inspect what's currently rendered
const StubPage = ({ name }: { name: string }) => (
  <div data-testid="current-page">{name}</div>
);

// Exposes the role setter so tests can flip it
let setRoleExternal: ((r: 'installateur' | 'beheerder') => void) | null = null;
const RoleSpy = () => {
  const { setRole } = useRole();
  setRoleExternal = setRole;
  return null;
};

const renderAt = (initialPath: string, initialRole: 'installateur' | 'beheerder') => {
  // Seed localStorage with the initial role so the provider picks it up
  localStorage.setItem('tdi500-role', initialRole);

  return render(
    <ThemeProvider theme={theme}>
      <RoleProvider>
        <DashboardProvider>
          <RoleSpy />
          <MemoryRouter initialEntries={[initialPath]}>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<StubPage name="dashboard" />} />
                <Route path="bag-lookup" element={<StubPage name="inregelen" />} />
                <Route path="contingent/:id" element={<StubPage name="contingent" />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </DashboardProvider>
      </RoleProvider>
    </ThemeProvider>
  );
};

describe('MainLayout — auto-nav on role switch', () => {
  beforeEach(() => {
    localStorage.clear();
    setRoleExternal = null;
  });

  it('keeps beheerder on / without redirect', () => {
    renderAt('/', 'beheerder');
    expect(screen.getByTestId('current-page')).toHaveTextContent('dashboard');
  });

  it('keeps installateur on /bag-lookup without redirect', () => {
    renderAt('/bag-lookup', 'installateur');
    expect(screen.getByTestId('current-page')).toHaveTextContent('inregelen');
  });

  // ── Regression tests for #57 — mount/refresh/hard-navigate is a no-op ──
  // Before the ref-based guard, the auto-nav effect fired on initial
  // render, which meant a beheerder hard-navigating to /bag-lookup would
  // be bounced to / before the "primair voor installateurs" banner could
  // render. These three tests cover the inverse of the old mount-redirect
  // assertions that were deleted in this commit.

  it('beheerder hard-navigating to /bag-lookup stays on page', () => {
    renderAt('/bag-lookup', 'beheerder');
    expect(screen.getByTestId('current-page')).toHaveTextContent('inregelen');
  });

  it('installateur refresh on /bag-lookup stays on page', () => {
    renderAt('/bag-lookup', 'installateur');
    expect(screen.getByTestId('current-page')).toHaveTextContent('inregelen');
  });

  it('beheerder refresh on / stays on page', () => {
    renderAt('/', 'beheerder');
    expect(screen.getByTestId('current-page')).toHaveTextContent('dashboard');
  });

  it('does not redirect either role from /contingent/:id', () => {
    renderAt('/contingent/B2', 'beheerder');
    expect(screen.getByTestId('current-page')).toHaveTextContent('contingent');

    localStorage.setItem('tdi500-role', 'installateur');
    renderAt('/contingent/B2', 'installateur');
    expect(screen.getAllByTestId('current-page').pop()).toHaveTextContent('contingent');
  });

  it('triggers redirect when role flips while on /', () => {
    renderAt('/', 'beheerder');
    expect(screen.getByTestId('current-page')).toHaveTextContent('dashboard');

    // Flip to installateur — effect should navigate to /bag-lookup
    act(() => {
      setRoleExternal?.('installateur');
    });

    expect(screen.getByTestId('current-page')).toHaveTextContent('inregelen');
  });

  it('triggers redirect when role flips while on /bag-lookup', () => {
    renderAt('/bag-lookup', 'installateur');
    expect(screen.getByTestId('current-page')).toHaveTextContent('inregelen');

    act(() => {
      setRoleExternal?.('beheerder');
    });

    expect(screen.getByTestId('current-page')).toHaveTextContent('dashboard');
  });
});
