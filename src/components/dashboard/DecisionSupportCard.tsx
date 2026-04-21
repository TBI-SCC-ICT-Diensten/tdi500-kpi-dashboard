import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AssistantIcon from '@mui/icons-material/Assistant';
import type { KeyPerformanceIndicator, KruisProfielCode } from '../../types/heatpump';
import type { OverallScore, DecisionScore } from '../../types/decision';
import { evaluateContingent } from '../../services/decisionEngine';

interface DecisionSupportCardProps {
  kpis?: KeyPerformanceIndicator[];
  kruisProfielCode?: KruisProfielCode;

}

const scoreColor: Record<OverallScore, string> = {
  good: '#3b6d11',
  acceptable: '#ba7517',
  poor: '#a32d2d',
  'insufficient-data': '#595959',
};

const scoreBg: Record<OverallScore, string> = {
  good: '#eaf3de',
  acceptable: '#faeeda',
  poor: '#fcebeb',
  'insufficient-data': '#f2f2f2',
};

const scoreLabel: Record<OverallScore, string> = {
  good: 'Goed',
  acceptable: 'Acceptabel',
  poor: 'Onvoldoende',
  'insufficient-data': 'Onvoldoende data',
};

const OverallIcon = ({ score }: { score: OverallScore }) => {
  const sx = { fontSize: 32, color: scoreColor[score] };
  if (score === 'good') return <CheckCircleOutlineIcon sx={sx} />;
  if (score === 'acceptable') return <WarningAmberIcon sx={sx} />;
  if (score === 'poor') return <ErrorOutlineIcon sx={sx} />;
  return <HelpOutlineIcon sx={sx} />;
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
  kruisProfielCode = 'B2',

}: DecisionSupportCardProps) => {
  const recommendation = evaluateContingent(kpis, kruisProfielCode);
  const { overallScore, summary, details, suggestedAction } = recommendation;

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>

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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 1.5,
          mb: 1.5,
          borderRadius: 1,
          bgcolor: scoreBg[overallScore],
          border: `1px solid ${scoreColor[overallScore]}33`,
        }}
      >
        <OverallIcon score={overallScore} />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="subtitle2" fontWeight={700}
              sx={{ color: scoreColor[overallScore] }}>
              Algeheel oordeel:
            </Typography>
            <Chip
              label={scoreLabel[overallScore]}
              size="small"
              sx={{
                bgcolor: scoreColor[overallScore],
                color: 'white',
                fontWeight: 600,
                fontSize: '0.7rem',
              }}
            />
          </Box>
          <Typography variant="body2" color="text.primary">
            {summary}
          </Typography>
        </Box>
      </Box>

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

      {/* Suggested action */}
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

      {/* Ethical disclaimer — always visible */}
      <Alert severity="info" sx={{ fontSize: '0.78rem' }}>
        Dit advies is gebaseerd op beschikbare meetdata en dient als
        ondersteuning, niet als definitief oordeel. De installateur
        blijft verantwoordelijk voor de uiteindelijke beslissing.
      </Alert>
    </Paper>
  );
};

export default DecisionSupportCard;
