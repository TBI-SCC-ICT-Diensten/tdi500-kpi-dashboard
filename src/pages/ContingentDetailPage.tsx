import { useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

const ContingentDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Contingent Detail
      </Typography>
      <Typography color="text.secondary">
        Details voor contingent: {id}
      </Typography>
    </Box>
  );
};

export default ContingentDetailPage;
