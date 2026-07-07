import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import KpiStatusIcon from './KpiStatusIcon';
import type { KeyPerformanceIndicator, KpiStatus } from '../../types/heatpump';
import { STATUS_COLORS } from '../../theme/statusColors';

interface KpiOverviewPanelProps {
  kpis: KeyPerformanceIndicator[];
}

const statusBorderColor: Record<KpiStatus, string> = {
  good:     STATUS_COLORS.healthy,
  warning:  STATUS_COLORS.warning,
  critical: STATUS_COLORS.danger,
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
          <Grid item xs={12} md={6} key={kpi.id}>
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
                  <KpiStatusIcon status={kpi.status} />
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
