import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import type { KeyPerformanceIndicator, KpiStatus } from '../../types/heatpump';

interface KpiOverviewPanelProps {
  kpis: KeyPerformanceIndicator[];
}

const statusColor: Record<KpiStatus, string> = {
  good: 'success.main',
  warning: 'warning.main',
  critical: 'error.main',
};

const statusBg: Record<KpiStatus, string> = {
  good: 'success.light',
  warning: 'warning.light',
  critical: 'error.light',
};

const StatusIcon = ({ status }: { status: KpiStatus }) => {
  const sx = { fontSize: 20, color: statusColor[status] };
  if (status === 'good') return <CheckCircleOutlineIcon sx={sx} />;
  if (status === 'warning') return <WarningAmberIcon sx={sx} />;
  return <ErrorOutlineIcon sx={sx} />;
};

const categoryLabel: Record<string, string> = {
  efficiency: 'Effici\u00ebntie',
  comfort: 'Comfort',
  reliability: 'Betrouwbaarheid',
  energy: 'Energie',
  commissioning: 'Inregeling',
};

const KpiOverviewPanel = ({ kpis }: KpiOverviewPanelProps) => {
  if (kpis.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ display: 'block', mb: 1, letterSpacing: 1.5 }}
      >
        KPI Overzicht
      </Typography>
      <Grid container spacing={2}>
        {kpis.map((kpi) => (
          <Grid item xs={12} sm={6} md={3} key={kpi.name}>
            <Card
              variant="outlined"
              sx={{
                height: '100%',
                borderColor:
                  kpi.status === 'critical' ? 'error.main' :
                  kpi.status === 'warning' ? 'warning.main' : 'divider',
                borderWidth: kpi.status === 'critical' ? 2 : 1,
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}
                  >
                    {categoryLabel[kpi.category] ?? kpi.category}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 0.75,
                      py: 0.25,
                      borderRadius: 1,
                      bgcolor: statusBg[kpi.status],
                    }}
                  >
                    <StatusIcon status={kpi.status} />
                  </Box>
                </Box>

                <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ lineHeight: 1.2 }}>
                  {kpi.name === 'Inregelsnelheid' && kpi.value === 0
                    ? '\u2014'
                    : kpi.unit === '%'
                    ? `${kpi.value}%`
                    : kpi.unit
                    ? `${kpi.value} ${kpi.unit}`
                    : kpi.value}
                </Typography>

                <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ mt: 0.5 }}>
                  {kpi.name}
                </Typography>

                {kpi.description && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 0.5, lineHeight: 1.4 }}
                  >
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
