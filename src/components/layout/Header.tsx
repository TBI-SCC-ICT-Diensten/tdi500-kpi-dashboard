import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircleIcon from '@mui/icons-material/Circle';

const Header = () => {
  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
      sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
    >
      <Toolbar sx={{ gap: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ lineHeight: 1.2 }}>
            TDI 500 — Installateursportaal
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Activiteit 3.4 | Hupie API via Heatpump Common Ontology
          </Typography>
        </Box>
        <Chip
          icon={<CircleIcon sx={{ fontSize: '10px !important' }} />}
          label="Hupie API"
          size="small"
          color="success"
          variant="outlined"
          sx={{ fontSize: '0.7rem' }}
        />
      </Toolbar>
    </AppBar>
  );
};

export default Header;
