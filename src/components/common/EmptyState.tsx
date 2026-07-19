import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
  subMessage?: string;
  'data-testid'?: string;
}

const EmptyState = ({
  message = 'Geen data beschikbaar',
  subMessage,
  'data-testid': dataTestId,
}: EmptyStateProps) => (
  <Box
    data-testid={dataTestId}
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: 8,
      gap: 1.5,
      color: 'text.secondary',
    }}
  >
    <Inbox size={56} className="opacity-30" />
    <Typography variant="body1" fontWeight={500}>
      {message}
    </Typography>
    {subMessage && (
      <Typography variant="body2" color="text.secondary">
        {subMessage}
      </Typography>
    )}
  </Box>
);

export default EmptyState;
