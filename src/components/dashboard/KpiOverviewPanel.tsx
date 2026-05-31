import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import type { KeyPerformanceIndicator, KpiStatus } from '../../types/heatpump';

interface KpiOverviewPanelProps {
  kpis: KeyPerformanceIndicator[];
}

const statusBorderColor: Record<KpiStatus, string> = {
  good:     '#16A34A',
  warning:  '#D97706',
  critical: '#DC2626',
};

const statusColor: Record<KpiStatus, string> = {
  good:     'success.main',
  warning:  'warning.main',
  critical: 'error.main',
};

const statusBg: Record<KpiStatus, string> = {
  good:     'success.light',
  warning:  'warning.light',
  critical: 'error.light',
};

const StatusIcon = ({ status }: { status: KpiStatus }) => {
  const sx = { fontSize: 20, color: statusColor[status] };
  if (status === 'good') return <CheckCircleOutlineIcon sx={sx} />;
  if (status === 'warning') return <WarningAmberIcon sx={sx} />;
  return <ErrorOutlineIcon sx={sx} />;
};

const categoryLabel: Record<string, string> = {
  efficiency:    'Efficiëntie',
  comfort:       'Comfort',
  reliability:   'Betrouwbaarheid',
  energy:        'Energie',
  commissioning: 'Inregeling',
};

const KpiOverviewPanel = ({ kpis }: KpiOverviewPanelProps) => {
  if (kpis.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      {/* Ruled section header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography variant="caption" fontWeight={700}
          sx={{ textTransform: 'uppercase', letterSpacing: 2,
                color: 'text.secondary', whiteSpace: 'nowrap' }}>
          KPI Overzicht
        </Typography>
        <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
      </Box>

      <Grid container spacing={2}>
        {kpis.map((kpi) => (
          <Grid item xs={6} key={kpi.id}>
            <Card
              data-testid={`kpi-card-${kpi.id}`}
              variant="outlined"
              sx={{
                height: '100%',
                minHeight: 120,
                borderLeft: `4px solid ${statusBorderColor[kpi.status]}`,
              }}
            >
              <CardContent sx={{ pb: '12px !important' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between',
                           alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary"
                    sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}>
                    {categoryLabel[kpi.category] ?? kpi.category}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5,
                             px: 0.75, py: 0.25, borderRadius: 1,
                             bgcolor: statusBg[kpi.status] }}>
                    <StatusIcon status={kpi.status} />
                  </Box>
                </Box>

                <Typography
                  color="text.primary"
                  sx={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>
                  {kpi.name === 'Inregelsnelheid' && kpi.value === 0
                    ? '—'
                    : kpi.unit === '%'
                    ? `${kpi.value}%`
                    : kpi.unit
                    ? `${kpi.value} ${kpi.unit}`
                    : kpi.value}
                </Typography>

                <Divider sx={{ my: 0.75 }} />

                <Typography variant="body2" fontWeight={500} color="text.primary">
                  {kpi.name}
                </Typography>

                {kpi.description && (
                  <Typography variant="caption" color="text.secondary"
                    sx={{ display: 'block', mt: 0.25, lineHeight: 1.4 }}>
                    {kpi.description}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default KpiOverviewPanel;
