import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useTheme, alpha } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDashboardContext } from '../../context/DashboardContext';
import { useRole } from '../../context/RoleContext';
import type { Role } from '../../context/RoleContext';
import { DEFAULT_KRUISPROFIEL_CODE, buildContingentId } from '../../types/heatpump';
import type React from 'react';

interface SidebarProps {
  width: number;
  /** Whether the temporary (below-md) overlay drawer is open. */
  mobileOpen: boolean;
  /** Closes the temporary drawer (also called after a nav click). */
  onClose: () => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  matchExact?: boolean;
  matchPrefix?: string;
  /**
   * Which roles can see this nav item. Undefined = visible for all roles.
   */
  visibleFor?: Role[];
}

const NAV_ITEMS: NavItem[] = [
  {
    path: '/',
    label: 'Dashboard',
    icon: DashboardIcon,
    matchExact: true,
    visibleFor: ['beheerder'],
  },
  {
    path: '/contingent',
    label: 'Contingent detail',
    icon: HomeRepairServiceIcon,
    matchPrefix: '/contingent',
    visibleFor: ['beheerder'],
  },
  // [BAG-LOOKUP] Remove this entry to disable the feature
  {
    path: '/bag-lookup',
    label: 'Inregelen',
    icon: LocationOnIcon,
    matchExact: true,
    visibleFor: ['installateur'],
  },
];

const Sidebar = ({ width, mobileOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { state } = useDashboardContext();
  const { role } = useRole();
  const primary = theme.palette.primary.main;

  const contingentId = state.selectedContingentId || buildContingentId(DEFAULT_KRUISPROFIEL_CODE);

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: 2.5, py: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', lineHeight: 1.2 }}>
          TDI 500
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Installateursportaal
        </Typography>
      </Box>

      <Divider />

      <List sx={{ pt: 1, px: 1 }}>
        {NAV_ITEMS
          .filter((item) => !item.visibleFor || item.visibleFor.includes(role))
          .map((item) => {
          const { path, label, icon: Icon, matchExact, matchPrefix } = item;
          // Determine the actual navigation path for contingents
          const navPath = path === '/contingent' ? `/contingent/${contingentId}` : path;
          
          const isActive = matchExact
            ? location.pathname === navPath
            : location.pathname.startsWith(matchPrefix ?? navPath);

          return (
            <ListItem key={path} disablePadding sx={{ mb: 0.25 }}>
              <ListItemButton
                selected={isActive}
                onClick={() => { navigate(navPath); onClose(); }}
                sx={{
                  borderRadius: 1,
                  borderLeft: '3px solid transparent',
                  pl: '9px',
                  '&.Mui-selected': {
                    borderLeftColor: 'primary.main',
                    bgcolor: alpha(primary, 0.10),
                    '&:hover': { bgcolor: alpha(primary, 0.14) },
                  },
                  '&:hover': { bgcolor: alpha(primary, 0.05) },
                }}
              >
                <ListItemIcon sx={{
                  minWidth: 34,
                  color: isActive ? 'primary.main' : 'text.secondary',
                }}>
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'primary.main' : 'text.secondary',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  // Explicit light paper styling so the dormant dark-blue MuiDrawer theme
  // override (theme.ts) does NOT activate now that the sidebar is a real
  // Drawer — preserves the pre-existing light rail look.
  const paperSx = {
    width,
    boxSizing: 'border-box' as const,
    backgroundColor: 'background.paper',
    color: 'text.primary',
    borderRight: '1px solid',
    borderColor: 'divider',
  };

  return (
    <>
      {/* Permanent rail at md+ — unchanged from the previous fixed sidebar */}
      <Drawer
        variant="permanent"
        open
        sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': paperSx }}
      >
        {drawerContent}
      </Drawer>
      {/* Temporary overlay below md — toggled by the Header hamburger */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': paperSx }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;
