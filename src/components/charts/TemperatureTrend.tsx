import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import ReactApexChart from 'react-apexcharts';
import type { HeatPumpSystem } from '../../types/heatpump';
import EmptyState from '../common/EmptyState';

interface TemperatureTrendProps {
  heatPumps: HeatPumpSystem[];
}

const TemperatureTrend = ({ heatPumps }: TemperatureTrendProps) => {
  // Build one series per heat pump that has a roomTemperature measurement
  const series = heatPumps
    .filter((hp) =>
      hp.measurements.some((m) => m.property === 'roomTemperature')
    )
    .map((hp) => {
      const temp = hp.measurements.find((m) => m.property === 'roomTemperature');
      return {
        name: `WP ${hp.id.slice(-8)}`,
        data: temp ? [parseFloat(temp.value.toFixed(1))] : [],
      };
    });

  const setpointSeries = heatPumps
    .filter((hp) =>
      hp.measurements.some((m) => m.property === 'temperatureSetpoint')
    )
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
      <Paper variant="outlined" sx={{ p: 3 }}>
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
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    plotOptions: {
      bar: { horizontal: false, columnWidth: '55%', borderRadius: 4 },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: ['Actuele meting'],
      labels: { style: { colors: '#4a5568', fontSize: '12px' } },
    },
    yaxis: {
      title: { text: 'Temperatuur (°C)', style: { color: '#4a5568' } },
      labels: {
        style: { colors: '#4a5568' },
        formatter: (val: number) => `${val.toFixed(1)}°C`,
      },
    },
    colors: ['#1a2b4a', '#ff6b35', '#2d4470', '#ff8c5a'],
    legend: {
      position: 'top',
      labels: { colors: '#4a5568' },
    },
    tooltip: {
      y: { formatter: (val: number) => `${val.toFixed(1)} °C` },
    },
    grid: { borderColor: '#e8eaf0' },
  };

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
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
