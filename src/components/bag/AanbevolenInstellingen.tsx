import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import UploadIcon from '@mui/icons-material/Upload';

import {
  getCatalogusProfiel,
  getAvailableFabrikanten,
} from '../../config/tnoCatalogus';
import {
  ALL_FABRIKANTEN,
} from '../../types/heatpump';
import type {
  Fabrikant,
  FabrikantInstellingen,
  KruisProfielCode,
  CatalogusValue,
} from '../../types/heatpump';

interface Props {
  kruisProfielCode: KruisProfielCode;
}

/**
 * Human-readable labels for the 11 parameters in the TNO catalogus.
 * Used as row labels in the parameter list.
 */
const PARAMETER_LABELS: Record<keyof FabrikantInstellingen, string> = {
  warmtepompType:        'Warmtepomp type',
  afgiftesysteem:        'Afgiftesysteem',
  maxAanvoertemperatuur: 'Max. aanvoertemperatuur',
  minimaleCop:           'Minimale COP',
  stooklijn:             'Stooklijn',
  ruimteInvloed:         'Ruimte-invloed',
  vrijgaveBijverwarming: 'Vrijgave bijverwarming',
  wachttijdBackupMin:    'Wachttijd back-up (min)',
  hybrideModus:          'Hybride modus',
  deltaT:                'Delta T',
  bivalentTemperatuur:   'T bivalent punt',
};

/**
 * Ordered keys for stable parameter rendering (matches TNO Tabel 1–9 order).
 */
const PARAMETER_ORDER: Array<keyof FabrikantInstellingen> = [
  'warmtepompType',
  'afgiftesysteem',
  'maxAanvoertemperatuur',
  'minimaleCop',
  'stooklijn',
  'ruimteInvloed',
  'vrijgaveBijverwarming',
  'wachttijdBackupMin',
  'hybrideModus',
  'deltaT',
  'bivalentTemperatuur',
];

/**
 * Renders a single catalogus value. Null → muted "Niet opgegeven" marker.
 * Numbers and strings rendered as-is to preserve source fidelity.
 */
const ValueDisplay = ({ value }: { value: CatalogusValue }) => {
  if (value === null) {
    return (
      <Typography
        component="span"
        variant="body2"
        sx={{ color: 'text.disabled', fontStyle: 'italic' }}
      >
        Niet opgegeven
      </Typography>
    );
  }
  return (
    <Typography component="span" variant="body2" fontWeight={600}>
      {String(value)}
    </Typography>
  );
};

/**
 * Aanbevolen instellingen per fabrikant voor een kruisprofiel.
 *
 * Bron: TNO 2025 R00000 (oktober 2024, geverifieerd februari 2026).
 * Data wordt niet live bijgehouden — voor definitieve waardes raadpleeg
 * de fabrikanten-documentatie.
 */
const AanbevolenInstellingen = ({ kruisProfielCode }: Props) => {
  const profiel = useMemo(
    () => getCatalogusProfiel(kruisProfielCode),
    [kruisProfielCode]
  );
  const available = useMemo(
    () => getAvailableFabrikanten(kruisProfielCode),
    [kruisProfielCode]
  );

  // Default to first available fabrikant. Fall back to first in
  // canonical order if somehow all are hidden. ALL_FABRIKANTEN is
  // statically defined with 4 elements so the non-null assertion
  // is safe — it only exists to satisfy noUncheckedIndexedAccess.
  const [selected, setSelected] = useState<Fabrikant>(
    available[0] ?? ALL_FABRIKANTEN[0]!
  );

  const settings = profiel[selected];

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Aanbevolen instellingen voor kruisprofiel{' '}
        <strong>{kruisProfielCode}</strong> zoals opgegeven door fabrikanten
        tijdens de TNO TDI 500 catalogus-workshops (oktober 2024,
        geverifieerd februari 2026).
      </Typography>

      <Tabs
        value={selected}
        onChange={(_, v: Fabrikant) => setSelected(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        {ALL_FABRIKANTEN.map((f) => (
          <Tab
            key={f}
            value={f}
            label={f}
            disabled={!available.includes(f)}
            sx={{ textTransform: 'none', fontWeight: 600, minWidth: 100 }}
          />
        ))}
      </Tabs>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            rowGap: 1.5,
            columnGap: 3,
          }}
        >
          {PARAMETER_ORDER.map((key) => (
            <Box
              key={key}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: 2,
                borderBottom: 1,
                borderColor: 'divider',
                py: 0.75,
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
              >
                {PARAMETER_LABELS[key]}
              </Typography>
              <ValueDisplay value={settings[key]} />
            </Box>
          ))}
        </Box>
      </Paper>

      <Alert
        severity="info"
        icon={<InfoOutlinedIcon fontSize="inherit" />}
        sx={{ mb: 2, fontSize: '0.78rem' }}
      >
        "Niet opgegeven" betekent dat deze fabrikant geen standaardwaarde
        heeft aangeleverd voor dit parameter in dit kruisprofiel (in TNO
        Tabel 1–9 aangeduid als 'X'). Dit is geen fout — controleer de
        fabrikant-documentatie voor een concrete waarde.
      </Alert>

      <Tooltip title="In ontwikkeling — toepassen op warmtepomp volgt in een volgende iteratie.">
        <span>
          <Button
            variant="contained"
            disabled
            startIcon={<UploadIcon />}
          >
            Toepassen op warmtepomp
          </Button>
        </span>
      </Tooltip>
    </Box>
  );
};

export default AanbevolenInstellingen;
