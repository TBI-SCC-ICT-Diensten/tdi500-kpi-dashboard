import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Chip from '@mui/material/Chip';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DEFAULT_KRUISPROFIEL_CODE, type KeyPerformanceIndicator, type KruisProfielCode } from '../../types/heatpump';
import type { OverallScore } from '../../types/decision';
import { useDecisionSupport } from '../../hooks/useDecisionSupport';
import DecisionFactorRow from './DecisionFactorRow';

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
    <Card data-testid="decision-card" className="p-4">

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Sparkles className="text-primary" />
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            Installatieadvies
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Beslissingsondersteuning op basis van TDI 500 KPI-data
          </Typography>
        </Box>
      </Box>

      <Separator className="mb-4" />

      {/* Overall score banner */}
      <Alert
        severity={
          overallScore === 'good' ? 'success' :
          overallScore === 'acceptable' ? 'warning' :
          overallScore === 'poor' ? 'error' : 'info'
        }
        variant="filled"
        sx={{ mb: 1.5, alignItems: 'center' }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography variant="subtitle2" fontWeight={700}>
            Algeheel oordeel:
          </Typography>
          <Chip
            data-testid="decision-verdict"
            label={scoreLabel[overallScore]}
            size="small"
            sx={{
              bgcolor: 'background.paper',
              color: 'text.primary',
              fontWeight: 600,
              fontSize: '0.7rem',
            }}
          />
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
        <Alert severity="info" sx={{ mb: 2 }}>
          <AlertTitle sx={{ fontWeight: 600 }}>Aanbevolen Inregelprofiel</AlertTitle>
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
      <Alert severity="warning" sx={{ fontSize: '0.78rem' }}>
        Dit advies is gebaseerd op beschikbare meetdata en dient als
        ondersteuning, niet als definitief oordeel. De installateur
        blijft verantwoordelijk voor de uiteindelijke beslissing.
      </Alert>
    </Card>
  );
};

export default DecisionSupportCard;
