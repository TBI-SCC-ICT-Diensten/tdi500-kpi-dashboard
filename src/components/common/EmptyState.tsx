import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InboxIcon from '@mui/icons-material/Inbox';

interface EmptyStateProps {
  message?: string;
  subMessage?: string;
}

const EmptyState = ({
  message = 'Geen data beschikbaar',
  subMessage,
}: EmptyStateProps) => (
  <Box
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
    <InboxIcon sx={{ fontSize: 56, opacity: 0.3 }} />
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
