import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import AssistantIcon from '@mui/icons-material/Assistant';
import type { KeyPerformanceIndicator } from '../../types/heatpump';

interface DecisionSupportCardProps {
  kpis?: KeyPerformanceIndicator[];
}

const DecisionSupportCard = ({ kpis }: DecisionSupportCardProps) => {
  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <AssistantIcon color="primary" />
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            Installatieadvies
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Beslissingsondersteuning op basis van KPI-data
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box
        sx={{
          p: 3,
          bgcolor: 'grey.50',
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1.5,
          mb: 2,
        }}
      >
        <AssistantIcon sx={{ fontSize: 40, color: 'primary.light', opacity: 0.4 }} />
        <Typography variant="body2" color="text.secondary" textAlign="center">
          De beslissingsengine evalueert de KPI-data van het geselecteerde contingent
          en geeft een aanbeveling op basis van de TDI 500 inregeldrempelwaarden.
        </Typography>
        <Typography
          variant="caption"
          sx={{
            px: 1.5,
            py: 0.5,
            bgcolor: 'secondary.main',
            color: 'white',
            borderRadius: 1,
            fontSize: '0.65rem',
            fontWeight: 600,
            letterSpacing: 0.5,
          }}
        >
          ISSUE #7 — IN ONTWIKKELING
        </Typography>
      </Box>

      <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
        Dit advies is gebaseerd op beschikbare meetdata en dient als
        ondersteuning, niet als definitief oordeel.
      </Alert>
    </Paper>
  );
};

export default DecisionSupportCard;
