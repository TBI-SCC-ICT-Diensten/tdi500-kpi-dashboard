import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  width: number;
}

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
        bgcolor: 'primary.main',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
          TDI 500
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          Installateursportaal
        </Typography>
      </Box>
      <List>
        <ListItem disablePadding>
          <ListItemButton
            selected={location.pathname === '/'}
            onClick={() => navigate('/')}
            sx={{
              '&.Mui-selected': { bgcolor: 'primary.light' },
              '&:hover': { bgcolor: 'primary.light' },
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 36 }}>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={location.pathname.startsWith('/contingent')}
            // TODO: navigate to selectedContingentId when multiple contingents
            // are supported. Currently hardcoded to the single default contingent.
            onClick={() => navigate('/contingent/default-b2')}
            sx={{
              '&.Mui-selected': { bgcolor: 'primary.light' },
              '&:hover': { bgcolor: 'primary.light' },
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 36 }}>
              <HomeRepairServiceIcon />
            </ListItemIcon>
            <ListItemText primary="Contingent detail" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
};

export default Sidebar;
