import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import useDashboardData from '../hooks/useDashboardData';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import HeatPumpDetailCard from '../components/detail/HeatPumpDetailCard';

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
            <HeatPumpDetailCard heatPump={hp} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ContingentDetailPage;
