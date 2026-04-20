import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import useDashboardData from '../hooks/useDashboardData';
import { useDashboardContext } from '../context/DashboardContext';
import ContingentSelector from '../components/dashboard/ContingentSelector';
import KpiOverviewPanel from '../components/dashboard/KpiOverviewPanel';
import KpiChartPanel from '../components/dashboard/KpiChartPanel';
import DecisionSupportCard from '../components/dashboard/DecisionSupportCard';
import CopGauge from '../components/charts/CopGauge';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import { SCORING_THRESHOLDS_BY_PROFIEL } from '../services/scoringConfig';

const STATUS_DOT: Record<string, string> = {
  active:  '#16A34A',
  warning: '#D97706',
  error:   '#DC2626',
  offline: '#4B5563',
  unknown: '#4B5563',
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { state, setSelectedContingentId } = useDashboardContext();
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

  return (
    <Box>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          KPI Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Warmtepomp monitoring en inregeling
        </Typography>
      </Box>

      {isLoading && (
        <Spinner message="Warmtepompdata ophalen via Hupie API..." />
      )}

      {!isLoading && error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!isLoading && !error && contingents.length === 0 && (
        <EmptyState
          message="Geen warmtepompen gevonden"
          subMessage="Controleer de Hupie API verbinding en probeer opnieuw."
        />
      )}

      {!isLoading && !error && contingents.length > 0 && (
        <>
          <ContingentSelector
            contingents={contingents}
            selectedContingentId={state.selectedContingentId}
            onSelect={setSelectedContingentId}
            isLoading={isLoading}
          />

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
                  <Box sx={{ mt: 2 }}>
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
