import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import type { Contingent } from '../../types/heatpump';

interface ContingentSelectorProps {
  contingents: Contingent[];
  selectedContingentId: string | null;
  onSelect: (id: string) => void;
  isLoading: boolean;
}

const ContingentSelector = ({
  contingents,
  selectedContingentId,
  onSelect,
  isLoading,
}: ContingentSelectorProps) => {
  if (isLoading || contingents.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ display: 'block', mb: 1, letterSpacing: 1.5 }}
      >
        Contingent selecteren
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {contingents.map((contingent) => {
          const isSelected = contingent.id === selectedContingentId;
          const onlineCount = contingent.heatPumps.filter(
            (hp) => hp.status !== 'offline'
          ).length;

          return (
            <Card
              key={contingent.id}
              variant="outlined"
              sx={{
                minWidth: 200,
                borderColor: isSelected ? 'primary.main' : 'divider',
                borderWidth: isSelected ? 2 : 1,
                bgcolor: isSelected ? 'primary.main' : 'background.paper',
                transition: 'all 0.15s ease',
                flex: '1 1 200px',
                maxWidth: 320,
              }}
            >
              <CardActionArea onClick={() => onSelect(contingent.id)}>
                <CardContent sx={{ pb: '12px !important' }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    color={isSelected ? 'primary.contrastText' : 'text.primary'}
                    gutterBottom
                  >
                    {contingent.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color={isSelected ? 'rgba(255,255,255,0.75)' : 'text.secondary'}
                    sx={{ mb: 1.5, fontSize: '0.78rem' }}
                  >
                    {contingent.kruisProfiel.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={`Profiel ${contingent.kruisProfiel.code}`}
                      size="small"
                      sx={{
                        bgcolor: isSelected
                          ? 'rgba(255,255,255,0.2)'
                          : 'primary.light',
                        color: isSelected ? 'white' : 'primary.contrastText',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                      }}
                    />
                    <Chip
                      label={`${contingent.heatPumps.length} pompen`}
                      size="small"
                      sx={{
                        bgcolor: isSelected
                          ? 'rgba(255,255,255,0.15)'
                          : 'grey.100',
                        color: isSelected
                          ? 'rgba(255,255,255,0.85)'
                          : 'text.secondary',
                        fontSize: '0.7rem',
                      }}
                    />
                    <Chip
                      label={`${onlineCount} online`}
                      size="small"
                      sx={{
                        bgcolor: isSelected
                          ? 'rgba(255,255,255,0.15)'
                          : onlineCount === contingent.heatPumps.length
                          ? 'success.light'
                          : 'warning.light',
                        color: isSelected ? 'rgba(255,255,255,0.85)' : 'text.primary',
                        fontSize: '0.7rem',
                      }}
                    />
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};

export default ContingentSelector;
