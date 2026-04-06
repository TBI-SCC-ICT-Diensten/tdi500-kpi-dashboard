import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import ReactApexChart from 'react-apexcharts';
import type { KeyPerformanceIndicator } from '../../types/heatpump';

interface CopGaugeProps {
  kpis: KeyPerformanceIndicator[];
  minCop?: number;
}

const CopGauge = ({ kpis, minCop = 2.5 }: CopGaugeProps) => {
  const copKpi = kpis.find((k) => k.category === 'efficiency');
  const copValue = copKpi?.value ?? 0;

  // Gauge max: 5.0 is excellent COP for a heat pump
  const gaugeMax = 5.0;
  const percentage = Math.min(Math.round((copValue / gaugeMax) * 100), 100);

  const statusColor =
    copKpi?.status === 'good' ? '#3b6d11' :
    copKpi?.status === 'warning' ? '#ba7517' :
    '#a32d2d';

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'radialBar',
      toolbar: { show: false },
      background: 'transparent',
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: {
          margin: 0,
          size: '70%',
        },
        track: {
          background: '#e8eaf0',
          strokeWidth: '97%',
        },
        dataLabels: {
          name: {
            offsetY: -10,
            color: '#4a5568',
            fontSize: '13px',
          },
          value: {
            color: statusColor,
            fontSize: '28px',
            fontWeight: 700,
            formatter: () =>
              copValue === 0 ? '—' : copValue.toFixed(2),
          },
        },
      },
    },
    fill: {
      type: 'solid',
      colors: [statusColor],
    },
    stroke: { lineCap: 'round' },
    labels: ['Gemiddelde COP'],
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
      <Typography variant="overline" color="text.secondary"
        sx={{ display: 'block', mb: 1, letterSpacing: 1.5 }}>
        COP Gauge
      </Typography>
      <ReactApexChart
        options={options}
        series={[percentage]}
        type="radialBar"
        height={220}
      />
      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Drempelwaarde: min. {minCop} | Max. schaal: {gaugeMax}
        </Typography>
      </Box>
    </Paper>
  );
};

export default CopGauge;
