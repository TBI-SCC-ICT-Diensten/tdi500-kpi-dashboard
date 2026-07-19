import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import KpiStatusIcon from './KpiStatusIcon';
import type { KeyPerformanceIndicator } from '../../types/heatpump';
import {
  kpiStatusToSemantic,
  STATUS_CARD_ACCENT_CLASSES,
} from '../../theme/statusColors';

/**
 * KpiOverviewPanel — de KPI-kaartSHELL is Tailwind (flat shadcn Card +
 * Separator; de status-leaf was al #177). Eerste GESTRUCTUREERDE shell op de
 * Card-primitive: 1:1-spiegel van de MUI-subcomponenten — Card + CardContent,
 * GEEN CardHeader (het MUI-origineel had er ook geen; CardHeader blijft voor
 * echte in-kaart-headers). Twee fideliteits-punten:
 *  • CardContent `p-4 pb-3` (16px + 12px onder = de oude MUI-padding incl. het
 *    sx-!important dat MUI's last-child-24px killde) — NIET shadcn's
 *    p-6 pt-0-default (die veronderstelt een voorafgaande CardHeader).
 *  • Accent-rand via STATUS_CARD_ACCENT_CLASSES (links-ONLY seam-record) +
 *    kpiStatusToSemantic — all-side -600 zou het border-border-kader meekleuren.
 * NOG MUI (eigen latere stappen, bewust niet hier): Grid (de kaarten zitten ÍN
 * de Grid-items), Typography, Box — incl. de sectiekop-liniaal (een Box, geen
 * Divider). Dit is dus een gesloten shell, geen MUI-vrij paneel.
 */

interface KpiOverviewPanelProps {
  kpis: KeyPerformanceIndicator[];
}

const categoryLabel: Record<string, string> = {
  efficiency:    'Efficiëntie',
  comfort:       'Comfort',
  reliability:   'Betrouwbaarheid',
  energy:        'Energie',
  commissioning: 'Inregeling',
};

const KpiOverviewPanel = ({ kpis }: KpiOverviewPanelProps) => {
  if (kpis.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      {/* Ruled section header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography variant="caption" fontWeight={700}
          sx={{ textTransform: 'uppercase', letterSpacing: 2,
                color: 'text.secondary', whiteSpace: 'nowrap' }}>
          KPI Overzicht
        </Typography>
        <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
      </Box>

      <Grid container spacing={2}>
        {kpis.map((kpi) => {
          const semantic = kpiStatusToSemantic(kpi.status);
          return (
            <Grid item xs={12} md={6} key={kpi.id}>
              <Card
                data-testid={`kpi-card-${kpi.id}`}
                className={`h-full min-h-[120px] border-l-4 ${STATUS_CARD_ACCENT_CLASSES[semantic]}`}
              >
                <CardContent className="p-4 pb-3">
                  <Box sx={{ display: 'flex', justifyContent: 'space-between',
                             alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary"
                      sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}>
                      {categoryLabel[kpi.category] ?? kpi.category}
                    </Typography>
                    <KpiStatusIcon status={kpi.status} />
                  </Box>

                  <Typography
                    color="text.primary"
                    sx={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>
                    {kpi.name === 'Inregelsnelheid' && kpi.value === 0
                      ? '—'
                      : kpi.unit === '%'
                      ? `${kpi.value}%`
                      : kpi.unit
                      ? `${kpi.value} ${kpi.unit}`
                      : kpi.value}
                  </Typography>

                  <Separator className="my-1.5" />

                  <Typography variant="body2" fontWeight={500} color="text.primary">
                    {kpi.name}
                  </Typography>

                  {kpi.description && (
                    <Typography variant="caption" color="text.secondary"
                      sx={{ display: 'block', mt: 0.25, lineHeight: 1.4 }}>
                      {kpi.description}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default KpiOverviewPanel;
