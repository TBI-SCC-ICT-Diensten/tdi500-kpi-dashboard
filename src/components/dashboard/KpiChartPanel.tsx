import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import type { KeyPerformanceIndicator, HeatPumpSystem } from '../../types/heatpump';
import TemperatureTrend from '../charts/TemperatureTrend';
import CopGauge from '../charts/CopGauge';
import EnergyComparison from '../charts/EnergyComparison';
import { SCORING_THRESHOLDS_BY_PROFIEL } from '../../services/scoringConfig';
import type { KruisProfielCode } from '../../types/heatpump';
import EmptyState from '../common/EmptyState';

interface KpiChartPanelProps {
  kpis?: KeyPerformanceIndicator[];
  heatPumps?: HeatPumpSystem[];
  kruisProfielCode?: KruisProfielCode;
}

const KpiChartPanel = ({
  kpis = [],
  heatPumps = [],
  kruisProfielCode = 'B2',
}: KpiChartPanelProps) => {
  if (heatPumps.length === 0) {
    return (
      <Box>
        <Typography variant="overline" color="text.secondary"
          sx={{ display: 'block', mb: 1, letterSpacing: 1.5 }}>
          KPI Visualisaties
        </Typography>
        <EmptyState
          message="Geen data voor grafieken"
          subMessage="Er zijn geen warmtepompen geladen om te visualiseren."
        />
      </Box>
    );
  }

  const thresholds = SCORING_THRESHOLDS_BY_PROFIEL[kruisProfielCode];

  return (
    <Box>
      <Typography variant="overline" color="text.secondary"
        sx={{ display: 'block', mb: 1, letterSpacing: 1.5 }}>
        KPI Visualisaties
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <TemperatureTrend heatPumps={heatPumps} />
        </Grid>
        <Grid item xs={12} md={4}>
          <CopGauge kpis={kpis} minCop={thresholds.minCop} />
        </Grid>
        <Grid item xs={12}>
          <EnergyComparison heatPumps={heatPumps} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default KpiChartPanel;
