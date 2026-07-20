import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useDashboardData from '../hooks/useDashboardData';
import KpiOverviewPanel from '../components/dashboard/KpiOverviewPanel';
import KpiChartPanel from '../components/dashboard/KpiChartPanel';
import DecisionSupportCard from '../components/dashboard/DecisionSupportCard';
import CopGauge from '../components/charts/CopGauge';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import { useRole } from '../context/RoleContext';
import StatusDot from '../components/common/StatusDot';

/* Kruisprofiel-items: gemeten stock-MUI-small-metriek als fideliteits-
 * overrides op de segmented-basis (13px/lh 1.75/px+py 7/uppercase; gewicht
 * 500→700 per J4; donker-ongeselecteerd wit→slate-50 stock-pariteit). */
const KRUISPROFIEL_ITEM_CLASSES =
  'h-auto px-[7px] py-[7px] text-sm font-medium leading-[1.75] uppercase dark:text-slate-50';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { role } = useRole();
  const {
    contingents,
    selectedContingent,
    kpis,
    minCop,
    isLoading,
    error,
  } = useDashboardData();

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
        <Alert severity="info" className="mb-5 text-sm">
          Deze pagina is primair voor beheerders. Je bekijkt hem
          momenteel als installateur — schakel naar beheerdermodus
          voor het volledige monitoring-perspectief.
        </Alert>
      )}

      {isLoading && (
        <Spinner message="Warmtepompdata ophalen via Hupie API..." data-testid="loading-spinner" />
      )}

      {!isLoading && error && (
        <Alert severity="danger" className="mb-6" data-testid="error-alert">
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
                <ToggleGroup
                  value={currentIsolatie}
                  onValueChange={(val) => {
                    if (val) handleKruisProfielChange(val, currentAanvoer);
                  }}
                  aria-label="Isolatieniveau"
                >
                  <ToggleGroupItem value="A" data-testid="kruisprofiel-isolatie-a" className={KRUISPROFIEL_ITEM_CLASSES}>A — Goed</ToggleGroupItem>
                  <ToggleGroupItem value="B" data-testid="kruisprofiel-isolatie-b" className={KRUISPROFIEL_ITEM_CLASSES}>B — Matig</ToggleGroupItem>
                  <ToggleGroupItem value="C" data-testid="kruisprofiel-isolatie-c" className={KRUISPROFIEL_ITEM_CLASSES}>C — Slecht</ToggleGroupItem>
                </ToggleGroup>
              </Box>

              {/* X-axis: Supply temperature */}
              <Box>
                <Typography variant="caption" color="text.secondary"
                  sx={{ display: 'block', mb: 0.5 }}>
                  Afgiftesysteem
                </Typography>
                <ToggleGroup
                  value={currentAanvoer}
                  onValueChange={(val) => {
                    if (val) handleKruisProfielChange(currentIsolatie, val);
                  }}
                  aria-label="Afgiftesysteem"
                >
                  <ToggleGroupItem value="1" data-testid="kruisprofiel-afgifte-vloer" className={KRUISPROFIEL_ITEM_CLASSES}>Vloer (≤ 30°C)</ToggleGroupItem>
                  <ToggleGroupItem value="2" data-testid="kruisprofiel-afgifte-radiator" className={KRUISPROFIEL_ITEM_CLASSES}>Radiator (30–55°C)</ToggleGroupItem>
                  <ToggleGroupItem value="3" data-testid="kruisprofiel-afgifte-hetelucht" className={KRUISPROFIEL_ITEM_CLASSES}>Hete lucht (≥ 55°C)</ToggleGroupItem>
                </ToggleGroup>
              </Box>

              {/* Active profile badge */}
              <Box sx={{ display: 'flex', alignItems: 'center', pt: 2.5 }}>
                <Chip color="primary" className="text-sm font-bold">
                  {`Profiel ${currentIsolatie}${currentAanvoer}`}
                </Chip>
              </Box>
            </Box>
          </Box>

          {selectedContingent && (
            <>
              {/* Two-column section: KPIs + Installatieadvies | COP gauge + fleet list */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: { xs: 'stretch', md: 'flex-start' } }}>

                {/* Left column */}
                <Box sx={{ flex: 2, minWidth: 0 }}>
                  <KpiOverviewPanel kpis={kpis} />
                  <DecisionSupportCard
                    kpis={kpis}
                    kruisProfielCode={selectedContingent.kruisProfiel.code}
                  />
                </Box>

                {/* Right column */}
                <Box sx={{ flex: 1, minWidth: { xs: 'auto', md: 280 } }}>
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
                          {/* Puur-Tailwind leaf in de MUI-rij (#172-sjabloon);
                              offline/unknown nu canoniek slate (divergentie-2). */}
                          <StatusDot status={pump.status} />
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
                      variant="link"
                      size="sm"
                      data-testid="contingent-detail-link"
                      onClick={() => navigate(`/contingent/${selectedContingent.id}`)}
                      className="mt-2 h-auto min-w-0 p-0 text-xs"
                    >
                      Naar detail →
                    </Button>
                  </Box>
                </Box>
              </Box>

              {/* Charts — full width below the two-column section */}
              <Box sx={{ mt: 3 }}>
                <KpiChartPanel
                  heatPumps={selectedContingent.heatPumps}
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
