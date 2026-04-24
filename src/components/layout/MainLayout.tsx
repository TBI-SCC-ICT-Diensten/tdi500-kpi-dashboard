import { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useRole } from '../../context/RoleContext';
import type { Role } from '../../context/RoleContext';

const SIDEBAR_WIDTH = 220;

/**
 * Routes considered "primary" for each role. When the user switches
 * role while on a path that's primary for the OTHER role, auto-nav
 * takes them to their role's landing.
 *
 * Paths not listed here (e.g. /contingent/:id, /bag-lookup when
 * accessed by a beheerder for demo purposes) are neutral — no nav
 * triggered. The banner components handle the soft guidance in
 * those cases.
 */
const INSTALLATEUR_LANDING = '/bag-lookup';
const BEHEERDER_LANDING = '/';

const MainLayout = () => {
  const { role } = useRole();
  const location = useLocation();
  const navigate = useNavigate();

  // Track previous role so the effect only fires on an actual role
  // *change* — never on mount/refresh/hard-navigate. Initializing
  // the ref with the current role makes the first effect run a no-op
  // (role === prevRoleRef.current), which preserves whichever route
  // the user hard-navigated to so their role-mismatch banner can render.
  // See #57.
  const prevRoleRef = useRef<Role>(role);

  useEffect(() => {
    // Skip the initial mount and any re-run where role hasn't changed
    // (e.g. a pathname-only change). Only an actual role flip should
    // trigger auto-nav.
    if (role === prevRoleRef.current) return;

    // When role flips to installateur while user is on /, redirect to BAG.
    // When role flips to beheerder while user is on /bag-lookup, redirect to /.
    // Other paths: no automatic nav — user can use the sidebar manually.
    if (role === 'installateur' && location.pathname === '/') {
      navigate(INSTALLATEUR_LANDING, { replace: true });
    } else if (role === 'beheerder' && location.pathname === INSTALLATEUR_LANDING) {
      navigate(BEHEERDER_LANDING, { replace: true });
    }

    prevRoleRef.current = role;
  }, [role, location.pathname, navigate]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar width={SIDEBAR_WIDTH} />
      <Box sx={{ flexGrow: 1, ml: `${SIDEBAR_WIDTH}px` }}>
        <Header />
        <Box component="main" sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
