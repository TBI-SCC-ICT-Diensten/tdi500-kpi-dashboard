import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface SpinnerProps {
  message?: string;
}

const Spinner = ({ message = 'Laden...' }: SpinnerProps) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: 8,
      gap: 2,
    }}
  >
    <CircularProgress color="primary" size={48} />
    <Typography variant="body2" color="text.secondary">
      {message}
    </Typography>
  </Box>
);

export default Spinner;
