import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DEFAULT_KRUISPROFIEL_CODE, type KeyPerformanceIndicator, type KruisProfielCode } from '../../types/heatpump';
import type { OverallScore } from '../../types/decision';
import { useDecisionSupport } from '../../hooks/useDecisionSupport';
import DecisionFactorRow from './DecisionFactorRow';

/**
 * DecisionSupportCard — de kaartSHELL is Tailwind (flat shadcn Card +
 * CardHeader + Separator); alle leaves waren al gemigreerd (DecisionFactorRow
 * #176, Button #178, Card/Separator #180, Alerts #201). Sluit samen met
 * KpiOverviewPanel (#200) de leaves-only-schuld.
 *
 * EERSTE CARDHEADER-GEBRUIK — de has-header-tak van het gestructureerde
 * shell-patroon (#200 zette de zonder-header-tak: Card + CardContent, GEEN
 * CardHeader, want dat MUI-origineel had er geen; CardHeader bleef gereserveerd
 * voor échte in-kaart-headers). Drie fideliteits-punten:
 *  • CardHeader `flex-row items-center gap-3 space-y-0` — stock is een KOLOM
 *    (flex flex-col space-y-1.5); ongecorrigeerd stapelt Sparkles BOVEN de
 *    titel i.p.v. ernaast.
 *  • CardTitle `text-base leading-7 tracking-normal` = MUI subtitle1 (1rem /
 *    1.75 / normale tracking). Stock `leading-none` (16px) zou het headerblok
 *    12px laten krimpen — dragend, niet cosmetisch. CardDescription `text-xs`
 *    = MUI caption (0.75rem), niet stock text-sm (= body2). GEEN font-sans:
 *    de header blijft Inter, zoals de MUI-Typography-kids eronder.
 *  • CardDescription `leading-6` — ÓÓK dragend, en subtieler: de MUI-caption
 *    was een INLINE span, dus zijn regelbox werd bepaald door de strut van de
 *    omliggende div (Inter 16px × 1.5 = 24px), niet door caption's eigen 1.66.
 *    Als blok-div valt CardDescription terug op text-xs' eigen 18px → de
 *    header (en dus de kaart) zou 6px korter worden. leading-6 = die 24px.
 *  • Padding `p-4 pb-0` + CardContent `p-4` = byte-identiek aan de oude
 *    `<Card className="p-4">` met `mb: 2` onder de header (twMerge ruimt
 *    p-6/pt-0 op; pb-* wint van p-* in Tailwinds outputvolgorde).
 * De verdict-pil is een span: statisch en zónder palet-semantiek (de enige van
 * 6 Chip-sites zonder `color=`), dus geen lid van de severity-familie die een
 * toekomstig Chip-primitief bedient — spanificeren houdt dát primitief schoon.
 * Volgt StatusPill (handgerolde span) + de vastgelegde 2xs-chipmaat.
 * NOG MUI (eigen latere, app-brede stappen): Box en Typography.
 */

interface DecisionSupportCardProps {
  kpis?: KeyPerformanceIndicator[];
  kruisProfielCode?: KruisProfielCode;

}

const scoreLabel: Record<OverallScore, string> = {
  good: 'Goed',
  acceptable: 'Acceptabel',
  poor: 'Onvoldoende',
  'insufficient-data': 'Onvoldoende data',
};

const DecisionSupportCard = ({
  kpis = [],
  kruisProfielCode = DEFAULT_KRUISPROFIEL_CODE,

}: DecisionSupportCardProps) => {
  const { overallScore, summary, details, suggestedAction, profileCode } =
    useDecisionSupport(kpis, kruisProfielCode);

  return (
    <Card data-testid="decision-card">

      {/* Header */}
      <CardHeader className="flex-row items-center gap-3 space-y-0 p-4 pb-0">
        <Sparkles className="shrink-0 text-primary" />
        <div>
          <CardTitle className="text-base leading-7 tracking-normal">
            Installatieadvies
          </CardTitle>
          <CardDescription className="text-xs leading-6">
            Beslissingsondersteuning op basis van TDI 500 KPI-data
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <Separator className="mb-4" />

        {/* Overall score banner */}
        <Alert
          severity={
            overallScore === 'good' ? 'success' :
            overallScore === 'acceptable' ? 'warning' :
            overallScore === 'poor' ? 'danger' : 'info'
          }
          variant="filled"
          className="mb-3 items-center"
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Algeheel oordeel:
            </Typography>
            <span
              data-testid="decision-verdict"
              className="inline-flex h-6 shrink-0 items-center rounded-full bg-card px-2 text-2xs font-semibold text-card-foreground"
            >
              {scoreLabel[overallScore]}
            </span>
          </Box>
          <Typography variant="body2">
            {summary}
          </Typography>
        </Alert>

        {/* Factor breakdown */}
        {details.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="overline" color="text.secondary"
              sx={{ display: 'block', mb: 1, letterSpacing: 1.5 }}>
              Factoranalyse
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {details.map((detail) => (
                <DecisionFactorRow key={detail.factor} detail={detail} />
              ))}
            </Box>
          </Box>
        )}

        {/* Suggested action (fallback if no contingent selected) */}
        {!profileCode && (
          <Box
            sx={{
              p: 1.5,
              mb: 1.5,
              border: '1px solid',
              borderColor: 'primary.main',
              borderRadius: 1,
              color: 'primary.main',
            }}
          >
            <Typography variant="caption" fontWeight={700}
              sx={{ opacity: 0.7, display: 'block', mb: 0.5,
                    textTransform: 'uppercase', letterSpacing: 1 }}>
              Aanbevolen actie
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {suggestedAction}
            </Typography>
          </Box>
        )}

        {/* Contingent Profile Recommendation */}
        {profileCode && (
          <Alert severity="info" className="mb-4">
            <AlertTitle>Aanbevolen Inregelprofiel</AlertTitle>
            <Typography variant="body2" sx={{ mb: 1.5 }}>
              Op basis van de geselecteerde filters is het aanbevolen inregelprofiel voor deze woningen: Profiel {profileCode}.
            </Typography>
            <Button
              size="sm"
              data-testid="apply-profile-btn"
              onClick={() => console.log('Applying profile')}
            >
              Pas Profiel {profileCode} toe op apparaten
            </Button>
          </Alert>
        )}

        {/* Ethical disclaimer — always visible */}
        <Alert severity="warning" className="text-xs">
          Dit advies is gebaseerd op beschikbare meetdata en dient als
          ondersteuning, niet als definitief oordeel. De installateur
          blijft verantwoordelijk voor de uiteindelijke beslissing.
        </Alert>
      </CardContent>
    </Card>
  );
};

export default DecisionSupportCard;
