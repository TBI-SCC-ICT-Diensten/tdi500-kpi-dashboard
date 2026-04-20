import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import ReactApexChart from 'react-apexcharts';
import { useTheme } from '@mui/material/styles';
import type { HeatPumpSystem } from '../../types/heatpump';
import EmptyState from '../common/EmptyState';

interface TemperatureTrendProps {
  heatPumps: HeatPumpSystem[];
}

const TemperatureTrend = ({ heatPumps }: TemperatureTrendProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const textColor  = isDark ? '#94A3B8' : '#64748B';
  const gridColor  = isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0';
  const barColors  = isDark
    ? ['#60A5FA', '#F97316', '#93C5FD', '#FDBA74', '#38BDF8', '#FB923C', '#7DD3FC', '#FED7AA']
    : ['#1E3A5F', '#0EA5E9', '#2E5487', '#38BDF8', '#122440', '#0284C7', '#60A5FA', '#7DD3FC'];

  const series = heatPumps
    .filter((hp) => hp.measurements.some((m) => m.property === 'roomTemperature'))
    .map((hp) => {
      const temp = hp.measurements.find((m) => m.property === 'roomTemperature');
      return {
        name: `WP ${hp.id.slice(-8)}`,
        data: temp ? [parseFloat(temp.value.toFixed(1))] : [],
      };
    });

  const setpointSeries = heatPumps
    .filter((hp) => hp.measurements.some((m) => m.property === 'temperatureSetpoint'))
    .map((hp) => {
      const sp = hp.measurements.find((m) => m.property === 'temperatureSetpoint');
      return {
        name: `Setpoint ${hp.id.slice(-8)}`,
        data: sp ? [parseFloat(sp.value.toFixed(1))] : [],
      };
    });

  const allSeries = [...series, ...setpointSeries];
  const hasData = allSeries.some((s) => s.data.length > 0);

  if (!hasData) {
    return (
      <Paper variant="outlined" sx={{ p: 2, borderLeft: '3px solid #0EA5E9' }}>
        <Typography variant="overline" color="text.secondary"
          sx={{ display: 'block', mb: 1, letterSpacing: 1.5 }}>
          Temperatuurtrend
        </Typography>
        <EmptyState
          message="Geen temperatuurdata beschikbaar"
          subMessage="De warmtepompen retourneren momenteel geen temperatuurmetingen."
        />
      </Paper>
    );
  }

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      background: 'transparent',
      fontFamily: '"Inter", "Roboto", sans-serif',
    },
    plotOptions: {
      bar: { horizontal: false, columnWidth: '55%', borderRadius: 4 },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: ['Actuele meting'],
      labels: { style: { colors: textColor, fontSize: '12px' } },
      axisBorder: { color: gridColor },
      axisTicks: { color: gridColor },
    },
    yaxis: {
      title: { text: 'Temperatuur (°C)', style: { color: textColor } },
      labels: {
        style: { colors: textColor },
        formatter: (val: number) => `${val.toFixed(1)}°C`,
      },
    },
    colors: barColors,
    legend: {
      position: 'top',
      labels: { colors: textColor },
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      y: { formatter: (val: number) => `${val.toFixed(1)} °C` },
    },
    grid: { borderColor: gridColor },
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, borderLeft: '3px solid #0EA5E9' }}>
      <Typography variant="overline" color="text.secondary"
        sx={{ display: 'block', mb: 1, letterSpacing: 1.5 }}>
        Temperatuurtrend
      </Typography>
      <Typography variant="caption" color="text.disabled"
        sx={{ display: 'block', mb: 2 }}>
        Actuele ruimtetemperatuur en setpoint per warmtepomp
      </Typography>
      <ReactApexChart
        options={options}
        series={allSeries}
        type="bar"
        height={240}
      />
    </Paper>
  );
};

export default TemperatureTrend;
