/**
 * BAG Lookup Page — Woningprofiel & Inregelinstellingen
 *
 * [BAG-LOOKUP] To remove: delete this file and remove the route and
 * sidebar entry tagged [BAG-LOOKUP] in App.tsx and Sidebar.tsx.
 */

import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Spinner from '../components/common/Spinner';
import {
  fetchBagData,
  mapBouwjaarToInsulation,
  mapEnergielabelToInsulation,
  deriveKruisProfielCode,
  type BagResult,
  type LookupProgress,
} from '../services/bagService';
import { getKruisProfiel } from '../config/kruisProfielen';
import { SCORING_THRESHOLDS_BY_PROFIEL } from '../services/scoringConfig';
import type { KruisProfielCode } from '../types/heatpump';

type Afgiftesysteem = 'vloerverwarming' | 'radiator' | 'hete lucht';

const afgifteLabels: Record<Afgiftesysteem, string> = {
  vloerverwarming: 'Vloerverwarming (≤ 30°C)',
  radiator: 'Radiator (30–55°C)',
  'hete lucht': 'Hete lucht (≥ 55°C)',
};

const confidenceColor = {
  hoog: 'success' as const,
  middel: 'warning' as const,
  laag: 'default' as const,
};

const BagLookupPage = () => {
  const [postcode, setPostcode] = useState('');
  const [huisnummer, setHuisnummer] = useState('');
  const [afgiftesysteem, setAfgiftesysteem] = useState<Afgiftesysteem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bagResult, setBagResult] = useState<BagResult | null>(null);
  const [kruisProfielCode, setKruisProfielCode] = useState<KruisProfielCode | null>(null);
  const [manualBouwjaar, setManualBouwjaar] = useState<string>('');
  const [progress, setProgress] = useState<LookupProgress | null>(null);

  const insulation = (() => {
    if (bagResult?.energielabel) {
      const level = mapEnergielabelToInsulation(bagResult.energielabel);
      return {
        level,
        reason: `Energielabel ${bagResult.energielabel} → isolatieklasse ${level} (nauwkeuriger dan bouwjaar-schatting)`,
        confidence: 'hoog' as const,
      };
    }
    if (bagResult?.bouwjaar != null) {
      return mapBouwjaarToInsulation(bagResult.bouwjaar);
    }
    if (manualBouwjaar !== '' && !isNaN(Number(manualBouwjaar))) {
      return mapBouwjaarToInsulation(Number(manualBouwjaar));
    }
    return null;
  })();

  const handleSearch = async () => {
    if (!postcode.trim() || !huisnummer.trim()) return;
    setLoading(true);
    setError(null);
    setBagResult(null);
    setKruisProfielCode(null);
    setAfgiftesysteem(null);
    setManualBouwjaar('');

    try {
      const result = await fetchBagData(
        postcode.trim(),
        huisnummer.trim(),
        setProgress
      );
      setBagResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Onbekende fout bij ophalen BAG-data.');
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  const handleAfgifteChange = (
    _: React.MouseEvent<HTMLElement>,
    value: Afgiftesysteem | null
  ) => {
    setAfgiftesysteem(value);
    if (value && insulation) {
      setKruisProfielCode(deriveKruisProfielCode(insulation.level, value));
    } else {
      setKruisProfielCode(null);
    }
  };

  const profiel = kruisProfielCode ? getKruisProfiel(kruisProfielCode) : null;
  const thresholds = kruisProfielCode
    ? SCORING_THRESHOLDS_BY_PROFIEL[kruisProfielCode]
    : null;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          BAG Woningopzoeking & Inregelinstellingen
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Voer een postcode en huisnummer in om het woningprofiel op te halen
          en de aanbevolen TDI 500 inregelinstellingen te bepalen.
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Step 1: Address input */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
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
          />
          <TextField
            label="Huisnummer"
            placeholder="bijv. 64"
            value={huisnummer}
            onChange={(e) => setHuisnummer(e.target.value)}
            size="small"
            sx={{ width: 120 }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
          />
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            disabled={loading || !postcode.trim() || !huisnummer.trim()}
            sx={{ height: 40, alignSelf: 'center' }}
          >
            Ophalen
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Gegevens worden opgehaald via de PDOK Locatieserver (BAG) — gratis, geen API-sleutel vereist.
        </Typography>
      </Paper>

      {loading && (
        <Spinner message={progress?.message ?? 'Gegevens ophalen...'} />
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}

      {/* Step 2: BAG result */}
      {bagResult && !loading && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="overline" color="text.secondary"
            sx={{ display: 'block', mb: 2, letterSpacing: 1.5 }}>
            Stap 2 — BAG-resultaat
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <HomeIcon color="primary" />
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
                <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
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
                <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1,
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
            {bagResult.oppervlakte && (
              <Grid item xs={6} sm={3}>
                <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1,
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
              sx={{ mb: 0 }}
              icon={false}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="caption" fontWeight={700}>
                  Isolatieniveau (Y-as kruisprofiel):
                </Typography>
                <Chip
                  label={`Klasse ${insulation.level}`}
                  size="small"
                  color={insulation.level === 'A' ? 'success' : insulation.level === 'B' ? 'warning' : 'error'}
                  sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                />
                <Chip
                  label={`Betrouwbaarheid: ${insulation.confidence}`}
                  size="small"
                  color={confidenceColor[insulation.confidence]}
                  variant="outlined"
                  sx={{ fontSize: '0.65rem' }}
                />
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
              <Alert severity="warning" sx={{ mb: 2 }}>
                Bouwjaar niet beschikbaar via PDOK voor dit adres.
                Voer het bouwjaar handmatig in, of raadpleeg EP-online.nl.
              </Alert>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  label="Bouwjaar (handmatig)"
                  placeholder="bijv. 1921"
                  value={manualBouwjaar}
                  onChange={(e) => {
                    setManualBouwjaar(e.target.value);
                    setKruisProfielCode(null);
                    setAfgiftesysteem(null);
                  }}
                  size="small"
                  sx={{ width: 180 }}
                  inputProps={{ maxLength: 4 }}
                  helperText="Voer het bouwjaar in van de woning"
                />
              </Box>
            </Box>
          )}
        </Paper>
      )}

      {/* Step 3: Afgiftesysteem selection */}
      {bagResult && insulation && !loading && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="overline" color="text.secondary"
            sx={{ display: 'block', mb: 2, letterSpacing: 1.5 }}>
            Stap 3 — Afgiftesysteem selecteren (X-as kruisprofiel)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Het afgiftesysteem is niet beschikbaar via de BAG. Selecteer het type verwarmingsafgifte van deze woning.
          </Typography>

          <ToggleButtonGroup
            value={afgiftesysteem}
            exclusive
            onChange={handleAfgifteChange}
            sx={{ flexWrap: 'wrap', gap: 1 }}
          >
            {(Object.keys(afgifteLabels) as Afgiftesysteem[]).map((key) => (
              <ToggleButton
                key={key}
                value={key}
                sx={{
                  textTransform: 'none',
                  px: 2,
                  border: '1px solid !important',
                  borderRadius: '8px !important',
                  borderColor: 'divider !important',
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    borderColor: 'primary.main !important',
                    '&:hover': { bgcolor: 'primary.dark' },
                  },
                }}
              >
                {afgifteLabels[key]}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Paper>
      )}

      {/* Step 4: Kruisprofiel + Inregelinstellingen result */}
      {profiel && thresholds && (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="overline" color="text.secondary"
            sx={{ display: 'block', mb: 2, letterSpacing: 1.5 }}>
            Stap 4 — Aanbevolen Inregelinstellingen
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2,
            p: 2, bgcolor: 'primary.main', borderRadius: 1 }}>
            <CheckCircleOutlineIcon sx={{ color: 'white' }} />
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
            Op basis van de BAG-gegevens en het geselecteerde afgiftesysteem gelden de volgende
            TDI 500 inregelinstellingen (bron: TNO Activity 2.1 — Catalogus inregelinstellingen):
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

          <Alert severity="info" sx={{ mt: 2, fontSize: '0.78rem' }}>
            Dit zijn de standaard inregelinstellingen op basis van het geschatte woningprofiel.
            Controleer het isolatieniveau via het energielabel (EP-online) voor een definitieve
            kruisprofiel-toewijzing.
          </Alert>
        </Paper>
      )}
    </Box>
  );
};

export default BagLookupPage;
