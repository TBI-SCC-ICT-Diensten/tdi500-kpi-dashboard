import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import type { Contingent } from '../../types/heatpump';

type WorstStatus = 'error' | 'warning' | 'active' | 'offline';

const worstStatusBorderColor: Record<WorstStatus, string> = {
  error:   '#DC2626',
  warning: '#D97706',
  active:  '#16A34A',
  offline: '#6B7280',
};

const getWorstStatus = (pumps: Contingent['heatPumps']): WorstStatus => {
  if (pumps.some(p => p.status === 'error'))    return 'error';
  if (pumps.some(p => p.status === 'warning'))  return 'warning';
  if (pumps.every(p => p.status === 'offline')) return 'offline';
  return 'active';
};

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
      {/* Ruled section header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography variant="caption" fontWeight={700}
          sx={{ textTransform: 'uppercase', letterSpacing: 2,
                color: 'text.secondary', whiteSpace: 'nowrap' }}>
          Contingent selecteren
        </Typography>
        <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {contingents.map((contingent) => {
          const isSelected = contingent.id === selectedContingentId;
          const pumps = contingent.heatPumps;
          const total   = pumps.length;
          const active  = pumps.filter(p => p.status === 'active').length;
          const warning = pumps.filter(p => p.status === 'warning').length;
          const error   = pumps.filter(p => p.status === 'error').length;
          const offline = pumps.filter(p => p.status === 'offline' || p.status === 'unknown').length;
          const onlineCount = pumps.filter(p => p.status !== 'offline').length;
          const worst = getWorstStatus(pumps);
          const statusBorder = worstStatusBorderColor[worst] ?? '#6B7280';

          return (
            <Card
              key={contingent.id}
              variant="outlined"
              sx={{
                minWidth: 200,
                borderColor: isSelected ? 'primary.main' : 'divider',
                borderWidth: isSelected ? 2 : 1,
                borderLeft: `3px solid ${statusBorder}`,
                bgcolor: isSelected ? 'primary.main' : 'background.paper',
                transition: 'all 0.15s ease',
                flex: '1 1 200px',
                maxWidth: 320,
              }}
            >
              <CardActionArea onClick={() => onSelect(contingent.id)}>
                <CardContent sx={{ pb: '12px !important' }}>
                  <Typography variant="subtitle1" fontWeight={600}
                    color={isSelected ? 'primary.contrastText' : 'text.primary'}
                    gutterBottom>
                    {contingent.name}
                  </Typography>
                  <Typography variant="body2"
                    color={isSelected ? 'rgba(255,255,255,0.75)' : 'text.secondary'}
                    sx={{ mb: 1.5, fontSize: '0.78rem' }}>
                    {contingent.kruisProfiel.description}
                  </Typography>

                  {/* Chips row */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={`Profiel ${contingent.kruisProfiel.code}`}
                      size="small"
                      sx={{
                        bgcolor: isSelected ? 'rgba(255,255,255,0.2)' : 'primary.light',
                        color: isSelected ? 'white' : 'primary.contrastText',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                      }}
                    />
                    <Chip
                      label={`${total} pompen`}
                      size="small"
                      sx={{
                        bgcolor: isSelected ? 'rgba(255,255,255,0.15)' : 'grey.100',
                        color: isSelected ? 'rgba(255,255,255,0.85)' : 'text.secondary',
                        fontSize: '0.7rem',
                      }}
                    />
                    <Chip
                      label={`${onlineCount} online`}
                      size="small"
                      sx={{
                        bgcolor: isSelected
                          ? 'rgba(255,255,255,0.15)'
                          : onlineCount === total ? 'success.light' : 'warning.light',
                        color: isSelected ? 'rgba(255,255,255,0.85)' : 'text.primary',
                        fontSize: '0.7rem',
                      }}
                    />
                  </Box>

                  {/* Fleet health bar */}
                  <Box sx={{ display: 'flex', height: 6, borderRadius: 3,
                             overflow: 'hidden', mt: 1.5, mb: 0.75 }}>
                    {active  > 0 && <Box sx={{ flex: active,  bgcolor: '#16A34A' }} />}
                    {warning > 0 && <Box sx={{ flex: warning, bgcolor: '#D97706' }} />}
                    {error   > 0 && <Box sx={{ flex: error,   bgcolor: '#DC2626' }} />}
                    {offline > 0 && <Box sx={{ flex: offline, bgcolor: '#4B5563' }} />}
                    {total   === 0 && <Box sx={{ flex: 1, bgcolor: '#4B5563' }} />}
                  </Box>

                  {/* Status summary */}
                  <Typography variant="caption"
                    sx={{ color: isSelected ? 'rgba(255,255,255,0.7)' : 'text.secondary' }}>
                    {[
                      active  > 0 ? `${active} actief`          : null,
                      warning > 0 ? `${warning} waarschuwing`   : null,
                      error   > 0 ? `${error} fout`             : null,
                      offline > 0 ? `${offline} offline`        : null,
                    ].filter(Boolean).join(' · ')}
                  </Typography>
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
