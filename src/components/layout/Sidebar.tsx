import Box from '@mui/material/Box';
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
import { useNavigate, useLocation } from 'react-router-dom';
import type React from 'react';

interface SidebarProps {
  width: number;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  matchExact?: boolean;
  matchPrefix?: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/',                       label: 'Dashboard',         icon: DashboardIcon,         matchExact: true  },
  { path: '/contingent/default-b2',  label: 'Contingent detail', icon: HomeRepairServiceIcon, matchPrefix: '/contingent' },
  // [BAG-LOOKUP] Remove this entry to disable the feature
  { path: '/bag-lookup',             label: 'BAG Opzoeking',     icon: LocationOnIcon,        matchExact: true  },
];

const Sidebar = ({ width }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box
      sx={{
        width,
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        bgcolor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
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
        {NAV_ITEMS.map((item) => {
          const { path, label, icon: Icon, matchExact, matchPrefix } = item;
          const isActive = matchExact
            ? location.pathname === path
            : location.pathname.startsWith(matchPrefix ?? path);

          return (
            <ListItem key={path} disablePadding sx={{ mb: 0.25 }}>
              <ListItemButton
                selected={isActive}
                onClick={() => navigate(path)}
                sx={{
                  borderRadius: 1,
                  borderLeft: '3px solid transparent',
                  pl: '9px',
                  '&.Mui-selected': {
                    borderLeftColor: 'primary.main',
                    bgcolor: 'rgba(30, 58, 95, 0.07)',
                    '&:hover': { bgcolor: 'rgba(30, 58, 95, 0.10)' },
                  },
                  '&:hover': { bgcolor: 'rgba(30, 58, 95, 0.04)' },
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
};

export default Sidebar;
