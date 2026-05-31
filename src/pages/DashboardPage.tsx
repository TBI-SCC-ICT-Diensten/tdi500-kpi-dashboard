import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useDashboardData from '../hooks/useDashboardData';
import KpiOverviewPanel from '../components/dashboard/KpiOverviewPanel';
import KpiChartPanel from '../components/dashboard/KpiChartPanel';
import DecisionSupportCard from '../components/dashboard/DecisionSupportCard';
import CopGauge from '../components/charts/CopGauge';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import { SCORING_THRESHOLDS_BY_PROFIEL } from '../services/scoringConfig';
import { useRole } from '../context/RoleContext';

const STATUS_DOT: Record<string, string> = {
  active:  '#16A34A',
  warning: '#D97706',
  error:   '#DC2626',
  offline: '#4B5563',
  unknown: '#4B5563',
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { role } = useRole();
  const {
    contingents,
    selectedContingent,
    kpis,
    isLoading,
    error,
  } = useDashboardData();

  const minCop = selectedContingent
    ? SCORING_THRESHOLDS_BY_PROFIEL[selectedContingent.kruisProfiel.code].minCop
    : 2.5;

  const currentIsolatie = searchParams.get('isolatie') ?? 'B';
  const currentAanvoer = searchParams.get('aanvoer') ?? '2';

  const handleKruisProfielChange = (
    isolatie: string,
    aanvoer: string
  ) => {
    setSearchParams({ isolatie, aanvoer });
  };

  return (
    <Box>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Overzicht warmtepompen
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Monitoring van de warmtepomp-installaties per contingent.
        </Typography>
      </Box>

      {role === 'installateur' && (
        <Alert severity="info" sx={{ mb: 2.5, fontSize: '0.85rem' }}>
          Deze pagina is primair voor beheerders. Je bekijkt hem
          momenteel als installateur — schakel naar beheerdermodus
          voor het volledige monitoring-perspectief.
        </Alert>
      )}

      {isLoading && (
        <Spinner message="Warmtepompdata ophalen via Hupie API..." data-testid="loading-spinner" />
      )}

      {!isLoading && error && (
        <Alert severity="error" sx={{ mb: 3 }} data-testid="error-alert">
          {error}
        </Alert>
      )}

      {!isLoading && !error && contingents.length === 0 && (
        <EmptyState
          message="Geen warmtepompen gevonden"
          subMessage="Controleer de Hupie API verbinding en probeer opnieuw."
          data-testid="empty-state"
        />
      )}

      {!isLoading && !error && contingents.length > 0 && (
        <>
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" fontWeight={700}
              sx={{ textTransform: 'uppercase', letterSpacing: 2,
                    color: 'text.secondary', display: 'block', mb: 1 }}>
              Kruisprofiel selecteren
            </Typography>

            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap',
                       alignItems: 'flex-start' }}>

              {/* Y-axis: Insulation */}
              <Box>
                <Typography variant="caption" color="text.secondary"
                  sx={{ display: 'block', mb: 0.5 }}>
                  Isolatieniveau
                </Typography>
                <ToggleButtonGroup
                  value={currentIsolatie}
                  exclusive
                  size="small"
                  onChange={(_, val) => {
                    if (val) handleKruisProfielChange(val, currentAanvoer);
                  }}
                >
                  <ToggleButton value="A" data-testid="kruisprofiel-isolatie-a">A — Goed</ToggleButton>
                  <ToggleButton value="B" data-testid="kruisprofiel-isolatie-b">B — Matig</ToggleButton>
                  <ToggleButton value="C" data-testid="kruisprofiel-isolatie-c">C — Slecht</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* X-axis: Supply temperature */}
              <Box>
                <Typography variant="caption" color="text.secondary"
                  sx={{ display: 'block', mb: 0.5 }}>
                  Afgiftesysteem
                </Typography>
                <ToggleButtonGroup
                  value={currentAanvoer}
                  exclusive
                  size="small"
                  onChange={(_, val) => {
                    if (val) handleKruisProfielChange(currentIsolatie, val);
                  }}
                >
                  <ToggleButton value="1" data-testid="kruisprofiel-afgifte-vloer">Vloer (≤ 30°C)</ToggleButton>
                  <ToggleButton value="2" data-testid="kruisprofiel-afgifte-radiator">Radiator (30–55°C)</ToggleButton>
                  <ToggleButton value="3" data-testid="kruisprofiel-afgifte-hetelucht">Hete lucht (≥ 55°C)</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Active profile badge */}
              <Box sx={{ display: 'flex', alignItems: 'center', pt: 2.5 }}>
                <Chip
                  label={`Profiel ${currentIsolatie}${currentAanvoer}`}
                  color="primary"
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              </Box>
            </Box>
          </Box>

          {selectedContingent && (
            <>
              {/* Two-column section: KPIs + Installatieadvies | COP gauge + fleet list */}
              <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>

                {/* Left column */}
                <Box sx={{ flex: 2, minWidth: 0 }}>
                  <KpiOverviewPanel kpis={kpis} />
                  <DecisionSupportCard
                    kpis={kpis}
                    kruisProfielCode={selectedContingent.kruisProfiel.code}
                  />
                </Box>

                {/* Right column */}
                <Box sx={{ flex: 1, minWidth: 280 }}>
                  <CopGauge kpis={kpis} minCop={minCop} />

                  {/* Fleet status list */}
                  <Box sx={{ mt: 2 }} data-testid="pump-status-list">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                      <Typography variant="caption" fontWeight={700}
                        sx={{ textTransform: 'uppercase', letterSpacing: 2,
                              color: 'text.secondary', whiteSpace: 'nowrap' }}>
                        Pompstatus
                      </Typography>
                      <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
                    </Box>

                    {selectedContingent.heatPumps.map((pump) => (
                      <Box key={pump.id}
                        data-testid="pump-status-row"
                        sx={{ display: 'flex', alignItems: 'center',
                              justifyContent: 'space-between', py: 0.75,
                              borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{
                            width: 8, height: 8, borderRadius: '50%',
                            bgcolor: STATUS_DOT[pump.status] ?? '#4B5563',
                            flexShrink: 0,
                          }} />
                          <Typography variant="caption"
                            sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                            {pump.id}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {pump.deviceSpecs?.manufacturer ?? '—'}
                        </Typography>
                      </Box>
                    ))}

                    <Button
                      size="small"
                      data-testid="contingent-detail-link"
                      onClick={() => navigate(`/contingent/${selectedContingent.id}`)}
                      sx={{ mt: 1, fontSize: '0.75rem', color: 'primary.main',
                            textTransform: 'none', p: 0, minWidth: 0 }}
                    >
                      Naar detail →
                    </Button>
                  </Box>
                </Box>
              </Box>

              {/* Charts — full width below the two-column section */}
              <Box sx={{ mt: 3 }}>
                <KpiChartPanel
                  kpis={kpis}
                  heatPumps={selectedContingent.heatPumps}
                  kruisProfielCode={selectedContingent.kruisProfiel.code}
                />
              </Box>
            </>
          )}

          {!selectedContingent && (
            <EmptyState
              message="Selecteer een contingent"
              subMessage="Kies een contingent hierboven om de KPI's te bekijken."
            />
          )}
        </>
      )}
    </Box>
  );
};

export default DashboardPage;
