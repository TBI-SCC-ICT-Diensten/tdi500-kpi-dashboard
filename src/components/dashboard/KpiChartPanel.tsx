import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SpeedIcon from '@mui/icons-material/Speed';
import type { KeyPerformanceIndicator, HeatPumpSystem } from '../../types/heatpump';

interface KpiChartPanelProps {
  kpis?: KeyPerformanceIndicator[];
  heatPumps?: HeatPumpSystem[];
}

interface PlaceholderChartProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  height?: number;
}

const PlaceholderChart = ({ title, description, icon, height = 200 }: PlaceholderChartProps) => (
  <Paper
    variant="outlined"
    sx={{
      p: 3,
      height,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1.5,
      bgcolor: 'grey.50',
      borderStyle: 'dashed',
    }}
  >
    <Box sx={{ color: 'primary.light', opacity: 0.5 }}>{icon}</Box>
    <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
      {title}
    </Typography>
    <Typography variant="caption" color="text.disabled" textAlign="center">
      {description}
    </Typography>
    <Typography
      variant="caption"
      sx={{
        px: 1.5,
        py: 0.5,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        borderRadius: 1,
        fontSize: '0.65rem',
        fontWeight: 600,
        letterSpacing: 0.5,
      }}
    >
      ISSUE #6
    </Typography>
  </Paper>
);

const KpiChartPanel = ({ kpis, heatPumps }: KpiChartPanelProps) => {
  return (
    <Box>
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ display: 'block', mb: 1, letterSpacing: 1.5 }}
      >
        KPI Visualisaties
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <PlaceholderChart
            title="Temperatuurtrend"
            description="Lijn/vlakgrafiek — ruimtetemperatuur en setpoint over tijd per warmtepomp"
            icon={<ShowChartIcon sx={{ fontSize: 48 }} />}
            height={240}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <PlaceholderChart
            title="COP Gauge"
            description="Radialgrafiek — gemiddelde COP t.o.v. profieldrempel"
            icon={<SpeedIcon sx={{ fontSize: 48 }} />}
            height={240}
          />
        </Grid>
        <Grid item xs={12}>
          <PlaceholderChart
            title="Energieverbruik vergelijking"
            description="Staafdiagram — kWh per warmtepomp in dit contingent (Y-as altijd vanaf 0)"
            icon={<BarChartIcon sx={{ fontSize: 48 }} />}
            height={200}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default KpiChartPanel;
