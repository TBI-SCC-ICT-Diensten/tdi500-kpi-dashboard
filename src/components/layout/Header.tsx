import { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import WifiIcon from '@mui/icons-material/Wifi';
import ScienceIcon from '@mui/icons-material/Science';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import {
  getDataSource,
  setDataSource,
  subscribeToDataSource,
  type DataSource,
} from '../../services/hupieApi';
import { useColorMode } from '../../context/ColorModeContext';

const Header = () => {
  const [source, setSource] = useState<DataSource>(getDataSource());
  const { mode, toggleColorMode } = useColorMode();

  // Keep the chip in sync if the data source changes elsewhere.
  useEffect(() => subscribeToDataSource(setSource), []);

  const handleToggle = () => {
    const next: DataSource = source === 'live' ? 'mock' : 'live';
    setDataSource(next);
    // No need to call refetch here — useDashboardData subscribes to
    // data source changes and auto-refetches.
  };

  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
      sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
    >
      <Toolbar sx={{ gap: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" fontWeight={700} color="primary.main" sx={{ lineHeight: 1.2 }}>
            Installateursportaal
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Hupie API via Heatpump Common Ontology
          </Typography>
        </Box>
        <Chip
          icon={source === 'live' ? <WifiIcon /> : <ScienceIcon />}
          label={source === 'live' ? 'Hupie API (live)' : 'Mock data'}
          size="small"
          color={source === 'live' ? 'success' : 'warning'}
          onClick={handleToggle}
          clickable
          sx={{ cursor: 'pointer' }}
        />
        <Tooltip title={mode === 'dark' ? 'Licht thema' : 'Donker thema'}>
          <IconButton size="small" onClick={toggleColorMode} sx={{ color: 'text.secondary' }}>
            {mode === 'dark'
              ? <Brightness7Icon fontSize="small" />
              : <Brightness4Icon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
