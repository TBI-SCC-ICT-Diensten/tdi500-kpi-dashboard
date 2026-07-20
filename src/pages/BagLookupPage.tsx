/**
 * BAG Lookup Page — Woningprofiel & Inregelinstellingen
 *
 * [BAG-LOOKUP] To remove: delete this file and remove the route and
 * sidebar entry tagged [BAG-LOOKUP] in App.tsx and Sidebar.tsx.
 */

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { Alert } from '@/components/ui/alert';
import { Chip } from '@/components/ui/chip';
import Grid from '@mui/material/Grid';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useTheme } from '@mui/material/styles';
import { Search, Home, CircleCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Spinner from '../components/common/Spinner';
import WeatherWidget from '../components/bag/WeatherWidget';
import AanbevolenInstellingen from '../components/bag/AanbevolenInstellingen';
import { useBagLookup, type Afgiftesysteem } from '../hooks/useBagLookup';
import { useRole } from '../context/RoleContext';

const afgifteLabels: Record<Afgiftesysteem, string> = {
  vloerverwarming: 'Vloerverwarming (≤ 30°C)',
  radiator: 'Radiator (30–55°C)',
  'hete lucht': 'Hete lucht (≥ 55°C)',
};

/* Betrouwbaarheid → chipkleur (owned Chip-vocabulaire; 'laag' volgt de
 * neutrale offline/slate-tier — het oude MUI 'default'). */
const confidenceColor = {
  hoog: 'healthy' as const,
  middel: 'warning' as const,
  laag: 'offline' as const,
};

/* Afgifte-pills: gemeten stock-MUI-medium-metriek als fideliteits-overrides
 * op de pills-basis (14px/lh 1.75/py 11; gewicht 500→700 per J4). De rand is
 * currentColor — zo rendert het MUI-origineel daadwerkelijk (de sx-divider
 * kwam er nooit doorheen); geselecteerd overschrijft de pills-variant naar
 * primary. Donker-ongeselecteerd stock-wit → slate-50. */
const AFGIFTE_ITEM_CLASSES =
  'h-auto py-[11px] text-[0.875rem] font-medium leading-[1.75] ' +
  'border-current aria-pressed:border-primary dark:text-slate-50';

const BagLookupPage = () => {
  const theme = useTheme();
  const cellBg = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'grey.50';
  const { role } = useRole();
  const {
    postcode, setPostcode,
    huisnummer, setHuisnummer,
    afgiftesysteem, handleAfgifteChange,
    manualBouwjaar, handleManualBouwjaarChange,
    loading, error, bagResult, kruisProfielCode, progress,
    insulation, supplyTemperatureClass, profiel, thresholds,
    handleSearch,
  } = useBagLookup();

  return (
    <Box>
      {role === 'beheerder' && (
        <Alert severity="info" className="mb-6 text-sm">
          Deze pagina is primair voor installateurs. Je bekijkt hem
          momenteel als beheerder — schakel naar installateursmodus
          voor het volledige inregelen-perspectief.
        </Alert>
      )}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Inregelen
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Voer een postcode en huisnummer in om het woningprofiel op te halen
          en de aanbevolen TDI 500 inregelinstellingen per fabrikant te bepalen.
        </Typography>
      </Box>

      <Separator className="mb-6" />

      {/* Step 1: Address input */}
      <Card className="mb-6 p-6">
        <Typography variant="overline" color="text.secondary"
          sx={{ display: 'block', mb: 2, letterSpacing: 1.5 }}>
          Stap 1 — Adres invoeren
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <TextField
            label="Postcode"
            placeholder="bijv. 2701CT"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value.toUpperCase())}
            size="small"
            sx={{ width: 140 }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
            inputProps={{ 'data-testid': 'bag-postcode-input' }}
          />
          <TextField
            label="Huisnummer"
            placeholder="bijv. 64"
            value={huisnummer}
            onChange={(e) => setHuisnummer(e.target.value)}
            size="small"
            sx={{ width: 120 }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
            inputProps={{ 'data-testid': 'bag-huisnummer-input' }}
          />
          <Button
            onClick={handleSearch}
            disabled={loading || !postcode.trim() || !huisnummer.trim()}
            className="h-10 self-center"
            data-testid="bag-submit"
          >
            <Search />
            Ophalen
          </Button>
        </Box>


      </Card>

      {loading && (
        <Spinner message={progress?.message ?? 'Gegevens ophalen...'} />
      )}

      {error && (
        <Alert severity="danger" className="mb-6" data-testid="bag-error">{error}</Alert>
      )}

      {/* Step 2: BAG result */}
      {bagResult && !loading && (
        <Card data-testid="bag-result" className="mb-6 p-6">
          <Typography variant="overline" color="text.secondary"
            sx={{ display: 'block', mb: 2, letterSpacing: 1.5 }}>
            Stap 2 — BAG-resultaat
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Home className="text-primary" />
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                {bagResult.weergavenaam}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {bagResult.woonplaatsnaam}
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            {[
              { label: 'Bouwjaar', value: bagResult.bouwjaar?.toString() ?? 'Niet beschikbaar' },
              { label: 'Postcode', value: bagResult.postcode },
              { label: 'Woonplaats', value: bagResult.woonplaatsnaam },
              { label: 'Gebruiksdoel', value: bagResult.gebruiksdoel ?? 'Niet beschikbaar' },
            ].map(({ label, value }) => (
              <Grid item xs={6} sm={3} key={label}>
                <Box sx={{ p: 1.5, bgcolor: cellBg, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary"
                    sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}>
                    {label}
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ mt: 0.25 }}>
                    {value}
                  </Typography>
                </Box>
              </Grid>
            ))}
            {bagResult.energielabel && (
              <Grid item xs={6} sm={3}>
                <Box sx={{ p: 1.5, bgcolor: cellBg, borderRadius: 1,
                  border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary"
                    sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}>
                    Energielabel
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ mt: 0.25 }}>
                    {bagResult.energielabel}
                    {bagResult.energielabelGeldigTot && (
                      <Typography component="span" variant="caption"
                        color="text.secondary" sx={{ ml: 0.5 }}>
                        (geldig tot {bagResult.energielabelGeldigTot.slice(0, 10)})
                      </Typography>
                    )}
                  </Typography>
                </Box>
              </Grid>
            )}
            {bagResult.energielabelError && (
              <Grid item xs={12}>
                <Card className="border-warning-600 bg-warning-100 p-3">
                  <Typography variant="caption"
                    sx={{ color: 'warning.dark', fontWeight: 600 }}>
                    ⚠ Energielabel kon niet worden opgehaald:{' '}
                    {bagResult.energielabelError}
                  </Typography>
                </Card>
              </Grid>
            )}
            {bagResult.oppervlakte && (
              <Grid item xs={6} sm={3}>
                <Box sx={{ p: 1.5, bgcolor: cellBg, borderRadius: 1,
                  border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary"
                    sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}>
                    Oppervlakte
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ mt: 0.25 }}>
                    {bagResult.oppervlakte} m²
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>

          {insulation && (
            <Alert
              severity={insulation.confidence === 'hoog' ? 'info' : 'warning'}
              icon={false}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="caption" fontWeight={700}>
                  Isolatieniveau (Y-as kruisprofiel):
                </Typography>
                {/* 0.7rem → text-2xs (de vastgelegde chipmaat-consolidatie). */}
                <Chip
                  color={insulation.level === 'A' ? 'healthy' : insulation.level === 'B' ? 'warning' : 'danger'}
                  className="font-bold"
                >
                  {`Klasse ${insulation.level}`}
                </Chip>
                <Chip variant="outlined" color={confidenceColor[insulation.confidence]}>
                  {`Betrouwbaarheid: ${insulation.confidence}`}
                </Chip>
              </Box>
              <Typography variant="body2">{insulation.reason}</Typography>
              {insulation.confidence !== 'hoog' && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Let op: schatting op basis van bouwjaar. Controleer het energielabel via EP-online voor een nauwkeurigere bepaling.
                </Typography>
              )}
            </Alert>
          )}

          {bagResult.bouwjaar == null && !bagResult.energielabel && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="warning" className="mb-4">
                Bouwjaar niet beschikbaar via PDOK voor dit adres.
                Voer het bouwjaar handmatig in, of raadpleeg EP-online.nl.
              </Alert>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  label="Bouwjaar (handmatig)"
                  placeholder="bijv. 1921"
                  value={manualBouwjaar}
                  onChange={(e) => handleManualBouwjaarChange(e.target.value)}
                  size="small"
                  sx={{ width: 180 }}
                  inputProps={{ maxLength: 4 }}
                  helperText="Voer het bouwjaar in van de woning"
                />
              </Box>
            </Box>
          )}
        </Card>
      )}

      {/* Step 3: Afgiftesysteem selection */}
      {bagResult && insulation && !loading && (
        <Card className="mb-6 p-6">
          <Typography variant="overline" color="text.secondary"
            sx={{ display: 'block', mb: 2, letterSpacing: 1.5 }}>
            Stap 3 — Afgiftesysteem selecteren (X-as kruisprofiel)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Het afgiftesysteem is niet beschikbaar via de BAG. Selecteer het type verwarmingsafgifte van deze woning.
          </Typography>

          <ToggleGroup
            value={afgiftesysteem}
            onValueChange={handleAfgifteChange}
            variant="pills"
            aria-label="Afgiftesysteem"
          >
            {(Object.keys(afgifteLabels) as Afgiftesysteem[]).map((key) => (
              <ToggleGroupItem key={key} value={key} className={AFGIFTE_ITEM_CLASSES}>
                {afgifteLabels[key]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Card>
      )}

      {/* Step 4: Current weather */}
      {bagResult?.rdCoordinates && (
        <Box sx={{ mt: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="caption" fontWeight={700}
              sx={{ textTransform: 'uppercase', letterSpacing: 2,
                    color: 'text.secondary', whiteSpace: 'nowrap' }}>
              Stap 4 — Actuele weersomstandigheden
            </Typography>
            <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
          </Box>
          <Card className="p-4">
            <Typography variant="caption" color="text.secondary"
              sx={{ display: 'block', mb: 1.5 }}>
              Actuele meting op basis van Open-Meteo (KNMI/ECMWF model).
              Buitentemperatuur beïnvloedt de verwachte COP en stooklijn.
            </Typography>
            <WeatherWidget
              rdCoordinates={bagResult.rdCoordinates}
              supplyTemperatureClass={supplyTemperatureClass}
            />
          </Card>
        </Box>
      )}

      {/* Step 5: Kruisprofiel + Inregelinstellingen result */}
      {profiel && thresholds && (
        <Card className="p-6">
          <Typography variant="overline" color="text.secondary"
            sx={{ display: 'block', mb: 2, letterSpacing: 1.5 }}>
            Stap 5 — Profielgrenzen
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2,
            p: 2, bgcolor: 'primary.main', borderRadius: 1 }}>
            <CircleCheck className="text-white" />
            <Box>
              <Typography variant="subtitle1" fontWeight={700} color="white">
                Kruisprofiel {profiel.code}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                {profiel.description}
              </Typography>
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Op basis van dit kruisprofiel hanteert het dashboard de volgende grenzen voor KPI-monitoring:
          </Typography>

          <Grid container spacing={2}>
            {[
              {
                label: 'Max. aanvoertemperatuur',
                value: `${thresholds.maxSupplyTemperatureCelsius}°C`,
                description: 'Maximale CV-watertemperatuur voor dit profiel',
              },
              {
                label: 'Minimale COP',
                value: thresholds.minCop.toString(),
                description: 'Minimale rendementsfactor warmtepomp',
              },
              {
                label: 'Max. waterdruk',
                value: `${thresholds.maxWaterPressureBar} bar`,
                description: 'Maximale systeemwaterdruk',
              },
              {
                label: 'Max. storingen',
                value: `${thresholds.maxHighSeverityErrors}`,
                description: 'Toegestane hoge-ernst foutcodes',
              },
            ].map(({ label, value, description }) => (
              <Grid item xs={12} sm={6} key={label}>
                <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary"
                    sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}>
                    {label}
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="primary.main" sx={{ my: 0.5 }}>
                    {value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Alert severity="info" className="mt-4 text-xs">
            {bagResult?.energielabel
              ? `Kruisprofiel bepaald op basis van energielabel ${bagResult.energielabel} — dit is de meest nauwkeurige methode.`
              : 'Dit zijn de standaard inregelinstellingen op basis van het geschatte woningprofiel (bouwjaar). Controleer het energielabel via EP-online voor een definitieve kruisprofiel-toewijzing.'}
          </Alert>
        </Card>
      )}

      {/* Step 6: Aanbevolen instellingen per fabrikant */}
      {kruisProfielCode && (
        <Card className="mt-6 p-6">
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ display: 'block', mb: 2, letterSpacing: 1.5 }}
          >
            Stap 6 — Aanbevolen instellingen per fabrikant
          </Typography>
          <AanbevolenInstellingen kruisProfielCode={kruisProfielCode} />
        </Card>
      )}
    </Box>
  );
};

export default BagLookupPage;
