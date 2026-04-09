import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import ReactApexChart from 'react-apexcharts';
import type { HeatPumpSystem } from '../../types/heatpump';
import EmptyState from '../common/EmptyState';

interface EnergyComparisonProps {
  heatPumps: HeatPumpSystem[];
}

const EnergyComparison = ({ heatPumps }: EnergyComparisonProps) => {
  const pumpsWithEnergy = heatPumps.filter((hp) =>
    hp.measurements.some((m) => m.property === 'energyUsage' && m.value > 0)
  );

  if (pumpsWithEnergy.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 3 }}>
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
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '50%',
        borderRadius: 4,
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      title: {
        text: 'Warmtepomp',
        style: { color: '#4a5568' },
      },
      labels: { style: { colors: '#4a5568', fontSize: '11px' } },
    },
    yaxis: {
      // ETHICAL: bar chart Y-axis always starts at 0
      min: 0,
      title: {
        text: 'Energieverbruik (kWh)',
        style: { color: '#4a5568' },
      },
      labels: {
        style: { colors: '#4a5568' },
        formatter: (val: number) => `${val.toFixed(1)} kWh`,
      },
    },
    colors: ['#1a2b4a'],
    tooltip: {
      y: { formatter: (val: number) => `${val.toFixed(2)} kWh` },
    },
    grid: { borderColor: '#e8eaf0' },
    legend: { show: false },
  };

  const series = [{ name: 'Energieverbruik (kWh)', data: values }];

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography variant="overline" color="text.secondary"
        sx={{ display: 'block', mb: 1, letterSpacing: 1.5 }}>
        Energieverbruik vergelijking
      </Typography>
      <Typography variant="caption" color="text.disabled"
        sx={{ display: 'block', mb: 2 }}>
        Elektriciteitsverbruik per warmtepomp — Y-as altijd vanaf 0 (ethische visualisatie)
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
