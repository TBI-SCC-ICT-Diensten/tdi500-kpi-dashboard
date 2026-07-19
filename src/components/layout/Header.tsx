import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { Menu, Wifi, FlaskConical, Moon, Sun, Wrench, LineChart } from 'lucide-react';
import { useDataSource } from '../../hooks/useDataSource';
import { useColorMode } from '../../context/ColorModeContext';
import { useRole } from '../../context/RoleContext';

interface HeaderProps {
  /** Opens the temporary sidebar drawer; only rendered below md. */
  onMenuClick?: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  // The data-source read/toggle now lives in useDataSource (no direct service
  // import). Toggling triggers a refetch via useDashboardData's own subscription.
  const { dataSource: source, toggle: handleToggle } = useDataSource();
  const { mode, toggleColorMode } = useColorMode();
  const { role, setRole } = useRole();

  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
      sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
    >
      <Toolbar sx={{ gap: 2 }}>
        <IconButton
          aria-label="menu"
          edge="start"
          onClick={onMenuClick}
          sx={{ display: { xs: 'inline-flex', md: 'none' }, mr: 1, color: 'text.secondary' }}
        >
          <Menu />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" fontWeight={700} color="primary.main" sx={{ lineHeight: 1.2 }}>
            Installateursportaal
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Hupie API via Heatpump Common Ontology
          </Typography>
        </Box>
        <Chip
          data-testid="datasource-chip"
          icon={source === 'live' ? <Wifi size={18} /> : <FlaskConical size={18} />}
          label={source === 'live' ? 'Hupie API (live)' : 'Mock data'}
          size="small"
          color={source === 'live' ? 'success' : 'warning'}
          onClick={handleToggle}
          clickable
          sx={{ cursor: 'pointer' }}
        />
        <ToggleButtonGroup
          value={role}
          exclusive
          size="small"
          onChange={(_, next) => {
            if (next === 'installateur' || next === 'beheerder') {
              setRole(next);
            }
          }}
          aria-label="Rolselectie"
          sx={{
            '& .MuiToggleButton-root': {
              textTransform: 'none',
              fontSize: '0.75rem',
              fontWeight: 600,
              px: 1.25,
              py: 0.25,
              lineHeight: 1.4,
              color: 'text.secondary',
              borderColor: 'divider',
            },
            '& .MuiToggleButton-root.Mui-selected': {
              color: 'primary.main',
              bgcolor: 'action.selected',
            },
          }}
        >
          <ToggleButton value="installateur" aria-label="Installateur" data-testid="role-installateur">
            <Wrench size={14} className="mr-1" />
            Installateur
          </ToggleButton>
          <ToggleButton value="beheerder" aria-label="Beheerder" data-testid="role-beheerder">
            <LineChart size={14} className="mr-1" />
            Beheerder
          </ToggleButton>
        </ToggleButtonGroup>
        <Tooltip title={mode === 'dark' ? 'Licht thema' : 'Donker thema'}>
          {/* aria-label: icoon-knop had geen toegankelijke NAAM (de Tooltip is
              een beschrijving) — a11y-fix; de testid is de stabiele selector
              voor de dark-mode e2e. */}
          <IconButton
            size="small"
            onClick={toggleColorMode}
            aria-label="Thema wisselen"
            data-testid="theme-toggle"
            sx={{ color: 'text.secondary' }}
          >
            {mode === 'dark'
              ? <Sun size={20} />
              : <Moon size={20} />}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
