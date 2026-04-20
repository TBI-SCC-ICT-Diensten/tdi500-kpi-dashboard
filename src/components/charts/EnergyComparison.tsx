import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import ReactApexChart from 'react-apexcharts';
import { useTheme } from '@mui/material/styles';
import type { HeatPumpSystem } from '../../types/heatpump';
import EmptyState from '../common/EmptyState';

interface EnergyComparisonProps {
  heatPumps: HeatPumpSystem[];
}

const EnergyComparison = ({ heatPumps }: EnergyComparisonProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const textColor = isDark ? '#94A3B8' : '#64748B';
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0';
  const barColor  = isDark ? '#60A5FA' : '#1E3A5F';

  const pumpsWithEnergy = heatPumps.filter((hp) =>
    hp.measurements.some((m) => m.property === 'energyUsage' && m.value > 0)
  );

  if (pumpsWithEnergy.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 2, borderLeft: '3px solid #6366F1' }}>
        <Typography variant="overline" color="text.secondary"
          sx={{ display: 'block', mb: 1, letterSpacing: 1.5 }}>
          Energieverbruik vergelijking
        </Typography>
        <EmptyState
          message="Geen energiedata beschikbaar"
          subMessage="De warmtepompen retourneren momenteel geen energieverbruiksdata."
        />
      </Paper>
    );
  }

  const categories = pumpsWithEnergy.map((hp) => `WP ${hp.id.slice(-8)}`);
  const values = pumpsWithEnergy.map((hp) => {
    const m = hp.measurements.find((m) => m.property === 'energyUsage');
    return m ? parseFloat(m.value.toFixed(2)) : 0;
  });

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      background: 'transparent',
      fontFamily: '"Inter", "Roboto", sans-serif',
    },
    plotOptions: {
      bar: { horizontal: false, columnWidth: '50%', borderRadius: 4 },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      title: { text: 'Warmtepomp', style: { color: textColor } },
      labels: { style: { colors: textColor, fontSize: '11px' } },
      axisBorder: { color: gridColor },
      axisTicks: { color: gridColor },
    },
    yaxis: {
      min: 0,
      title: { text: 'Energieverbruik (kWh)', style: { color: textColor } },
      labels: {
        style: { colors: textColor },
        formatter: (val: number) => `${val.toFixed(1)} kWh`,
      },
    },
    colors: [barColor],
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      y: { formatter: (val: number) => `${val.toFixed(2)} kWh` },
    },
    grid: { borderColor: gridColor },
    legend: { show: false },
  };

  const series = [{ name: 'Energieverbruik (kWh)', data: values }];

  return (
    <Paper variant="outlined" sx={{ p: 2, borderLeft: '3px solid #6366F1' }}>
      <Typography variant="overline" color="text.secondary"
        sx={{ display: 'block', mb: 1, letterSpacing: 1.5 }}>
        Energieverbruik vergelijking
      </Typography>
      <Typography variant="caption" color="text.disabled"
        sx={{ display: 'block', mb: 2 }}>
        Elektriciteitsverbruik per warmtepomp — Y-as altijd vanaf 0
      </Typography>
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={200}
      />
    </Paper>
  );
};

export default EnergyComparison;
