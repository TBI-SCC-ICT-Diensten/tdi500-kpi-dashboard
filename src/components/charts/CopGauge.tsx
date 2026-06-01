import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import ReactApexChart from 'react-apexcharts';
import { useTheme } from '@mui/material/styles';
import type { KeyPerformanceIndicator } from '../../types/heatpump';

interface CopGaugeProps {
  kpis: KeyPerformanceIndicator[];
  minCop?: number;
}

const CopGauge = ({ kpis, minCop = 2.5 }: CopGaugeProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const textColor = isDark ? '#94A3B8' : '#64748B';
  const trackBg   = isDark ? 'rgba(255,255,255,0.10)' : '#E2E8F0';

  const copKpi = kpis.find((k) => k.category === 'efficiency');
  const copValue = copKpi?.value ?? 0;

  const gaugeMax = 5.0;
  const percentage = Math.min(Math.round((copValue / gaugeMax) * 100), 100);

  const statusColor =
    copKpi?.status === 'good'    ? theme.palette.success.main :
    copKpi?.status === 'warning' ? theme.palette.warning.main :
    theme.palette.error.main;

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'radialBar',
      toolbar: { show: false },
      background: 'transparent',
      fontFamily: '"Inter", "Roboto", sans-serif',
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: { margin: 0, size: '70%' },
        track: {
          background: trackBg,
          strokeWidth: '97%',
        },
        dataLabels: {
          name: {
            offsetY: -10,
            color: textColor,
            fontSize: '13px',
          },
          value: {
            color: statusColor,
            fontSize: '28px',
            fontWeight: 700,
            formatter: () => copValue === 0 ? '—' : copValue.toFixed(2),
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
    <Paper data-testid="cop-gauge" variant="outlined" sx={{ p: 2, height: '100%', borderLeft: '3px solid #16A34A' }}>
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
