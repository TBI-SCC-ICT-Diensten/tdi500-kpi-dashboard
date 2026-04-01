import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import useDashboardData from '../hooks/useDashboardData';
import { useDashboardContext } from '../context/DashboardContext';
import ContingentSelector from '../components/dashboard/ContingentSelector';
import KpiOverviewPanel from '../components/dashboard/KpiOverviewPanel';
import KpiChartPanel from '../components/dashboard/KpiChartPanel';
import DecisionSupportCard from '../components/dashboard/DecisionSupportCard';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';

const DashboardPage = () => {
  const { state, setSelectedContingentId } = useDashboardContext();
  const {
    contingents,
    selectedContingent,
    kpis,
    isLoading,
    error,
  } = useDashboardData();

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Installateursportaal — KPI Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          TDI 500 — Activiteit 3.4 | Warmtepomp monitoring en inregeling
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

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
              <KpiOverviewPanel kpis={kpis} />
              <Box sx={{ mt: 3 }}>
                <KpiChartPanel />
              </Box>
              <Box sx={{ mt: 3 }}>
                <DecisionSupportCard />
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
