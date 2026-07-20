import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Spinner as UiSpinner } from '@/components/ui/spinner';

/**
 * Paginalader. De arc is de owned ui-Spinner (C6, Tier-1-run): 48px op
 * text-primary — het TNO-blauw waar MUI's CircularProgress de oude
 * MUI-primary draaide (#178-rebrand-precedent; modus-bewust via --primary,
 * J3). Box/Typography blijven MUI (Tier 2).
 */

interface SpinnerProps {
  message?: string;
  'data-testid'?: string;
}

const Spinner = ({ message = 'Laden...', 'data-testid': dataTestId }: SpinnerProps) => (
  <Box
    data-testid={dataTestId}
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: 8,
      gap: 2,
    }}
  >
    <UiSpinner size={48} className="text-primary" />
    <Typography variant="body2" color="text.secondary">
      {message}
    </Typography>
  </Box>
);

export default Spinner;
