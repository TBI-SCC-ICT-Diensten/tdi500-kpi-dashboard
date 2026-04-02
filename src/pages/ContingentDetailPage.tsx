import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CircleIcon from '@mui/icons-material/Circle';
import useDashboardData from '../hooks/useDashboardData';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';

const statusColor = {
  active: 'success' as const,
  warning: 'warning' as const,
  error: 'error' as const,
  offline: 'default' as const,
  unknown: 'default' as const,
};

const statusLabel = {
  active: 'Actief',
  warning: 'Waarschuwing',
  error: 'Fout',
  offline: 'Offline',
  unknown: 'Onbekend',
};

const ContingentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { contingents, isLoading } = useDashboardData();

  const contingent = contingents.find((c) => c.id === id);

  if (isLoading) {
    return <Spinner message="Contingentdata ophalen..." />;
  }

  if (!contingent) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mb: 2 }}
        >
          Terug naar dashboard
        </Button>
        <EmptyState
          message="Contingent niet gevonden"
          subMessage={`Geen contingent gevonden met ID: ${id}`}
        />
      </Box>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ mb: 2 }}
      >
        Terug naar dashboard
      </Button>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          {contingent.name}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Chip
            label={`Profiel ${contingent.kruisProfiel.code}`}
            color="primary"
            size="small"
            sx={{ fontWeight: 600 }}
          />
          <Typography variant="body2" color="text.secondary">
            {contingent.kruisProfiel.description}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          { label: 'Isolatieniveau', value: contingent.kruisProfiel.insulationLevel === 'A' ? 'Goed (RC > 2,5)' : contingent.kruisProfiel.insulationLevel === 'B' ? 'Matig (RC 1,3\u20132,5)' : 'Slecht (RC < 1,3)' },
          { label: 'Afgiftesysteem', value: contingent.kruisProfiel.supplyTemperatureClass === '1' ? 'Vloerverwarming (\u2264 30\u00b0C)' : contingent.kruisProfiel.supplyTemperatureClass === '2' ? 'Radiator (30\u201355\u00b0C)' : 'Hete lucht (\u2265 55\u00b0C)' },
          { label: 'Max. aanvoertemperatuur', value: `${contingent.kruisProfiel.maxSupplyTemperatureCelsius}\u00b0C` },
          { label: 'Warmtepompen', value: `${contingent.heatPumps.length} installaties` },
        ].map(({ label, value }) => (
          <Grid item xs={6} sm={3} key={label}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}>
                {label}
              </Typography>
              <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                {value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1, letterSpacing: 1.5 }}>
        Warmtepompen in dit contingent
      </Typography>

      <Grid container spacing={2}>
        {contingent.heatPumps.map((hp) => (
          <Grid item xs={12} sm={6} md={4} key={hp.id}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {hp.id}
                </Typography>
                <Chip
                  icon={<CircleIcon sx={{ fontSize: '10px !important' }} />}
                  label={statusLabel[hp.status]}
                  color={statusColor[hp.status]}
                  size="small"
                  variant="outlined"
                />
              </Box>

              <Divider sx={{ mb: 1.5 }} />

              {hp.measurements.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {hp.measurements.map((m) => (
                    <Box key={m.property} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">
                        {m.property}
                      </Typography>
                      <Typography variant="caption" fontWeight={500}>
                        {m.value} {m.unit}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="caption" color="text.disabled">
                  Geen metingen beschikbaar
                </Typography>
              )}

              {hp.errorCodes.length > 0 && (
                <Box sx={{ mt: 1.5, p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
                  <Typography variant="caption" color="error.dark" fontWeight={500}>
                    {hp.errorCodes.length} foutcode(s) actief
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ContingentDetailPage;
