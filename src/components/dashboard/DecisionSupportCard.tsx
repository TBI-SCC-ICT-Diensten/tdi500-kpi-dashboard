import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AssistantIcon from '@mui/icons-material/Assistant';
import { DEFAULT_KRUISPROFIEL_CODE, type KeyPerformanceIndicator, type KruisProfielCode } from '../../types/heatpump';
import type { OverallScore, DecisionScore } from '../../types/decision';
import { useDecisionSupport } from '../../hooks/useDecisionSupport';

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

const FactorIcon = ({ score }: { score: DecisionScore['score'] }) => {
  if (score === 'good')
    return <CheckCircleOutlineIcon sx={{ fontSize: 18, color: '#3b6d11' }} />;
  if (score === 'acceptable')
    return <WarningAmberIcon sx={{ fontSize: 18, color: '#ba7517' }} />;
  return <ErrorOutlineIcon sx={{ fontSize: 18, color: '#a32d2d' }} />;
};

const factorScoreLabel: Record<DecisionScore['score'], string> = {
  good: 'Goed',
  acceptable: 'Acceptabel',
  poor: 'Onvoldoende',
};

const DecisionSupportCard = ({
  kpis = [],
  kruisProfielCode = DEFAULT_KRUISPROFIEL_CODE,

}: DecisionSupportCardProps) => {
  const { overallScore, summary, details, suggestedAction, profileCode } =
    useDecisionSupport(kpis, kruisProfielCode);

  return (
    <Paper data-testid="decision-card" variant="outlined" sx={{ p: 2 }}>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <AssistantIcon color="primary" />
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            Installatieadvies
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Beslissingsondersteuning op basis van TDI 500 KPI-data
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

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
              <Box
                key={detail.factor}
                sx={{
                  p: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', mb: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FactorIcon score={detail.score} />
                    <Typography variant="body2" fontWeight={600}>
                      {detail.factor}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {detail.value}{detail.unit ? ` ${detail.unit}` : ''}
                    </Typography>
                    <Chip
                      label={factorScoreLabel[detail.score]}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontSize: '0.65rem',
                        height: 20,
                        borderColor:
                          detail.score === 'good' ? '#3b6d11' :
                          detail.score === 'acceptable' ? '#ba7517' : '#a32d2d',
                        color:
                          detail.score === 'good' ? '#3b6d11' :
                          detail.score === 'acceptable' ? '#ba7517' : '#a32d2d',
                      }}
                    />
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary"
                  sx={{ display: 'block', mb: 0.25 }}>
                  Drempel: {detail.threshold}
                </Typography>
                <Typography variant="caption" color="text.primary">
                  {detail.explanation}
                </Typography>
              </Box>
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
            variant="contained" 
            color="primary" 
            size="small" 
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
    </Paper>
  );
};

export default DecisionSupportCard;
