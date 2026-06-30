import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import type { HeatPumpSystem } from '../../types/heatpump';
import TemperatureTrend from '../charts/TemperatureTrend';
import EnergyComparison from '../charts/EnergyComparison';
import EmptyState from '../common/EmptyState';

interface KpiChartPanelProps {
  heatPumps?: HeatPumpSystem[];
}

const KpiChartPanel = ({
  heatPumps = [],
}: KpiChartPanelProps) => {
  if (heatPumps.length === 0) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="caption" fontWeight={700}
            sx={{ textTransform: 'uppercase', letterSpacing: 2,
                  color: 'text.secondary', whiteSpace: 'nowrap' }}>
            KPI Visualisaties
          </Typography>
          <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
        </Box>
        <EmptyState
          message="Geen data voor grafieken"
          subMessage="Er zijn geen warmtepompen geladen om te visualiseren."
        />
      </Box>
    );
  }

  return (
    <Box>
      {/* Ruled section header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography variant="caption" fontWeight={700}
          sx={{ textTransform: 'uppercase', letterSpacing: 2,
                color: 'text.secondary', whiteSpace: 'nowrap' }}>
          KPI Visualisaties
        </Typography>
        <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TemperatureTrend heatPumps={heatPumps} />
        </Grid>
        <Grid item xs={12}>
          <EnergyComparison heatPumps={heatPumps} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default KpiChartPanel;
