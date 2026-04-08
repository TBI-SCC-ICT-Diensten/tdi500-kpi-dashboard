import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
      }}
    >
      <Typography variant="h3" gutterBottom>
        404
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Pagina niet gevonden
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')}>
        Terug naar Dashboard
      </Button>
    </Box>
  );
};

export default NotFoundPage;
