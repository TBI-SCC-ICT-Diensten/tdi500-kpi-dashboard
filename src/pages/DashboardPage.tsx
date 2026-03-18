import { useState } from 'react';
import { Box, Typography, Button, Alert, CircularProgress } from '@mui/material';
import { executeSparqlQuery } from '../services/hupieApi';
import { SPARQL_LIST_HEATPUMPS } from '../services/sparqlQueries';
import type { SparqlResponse, ApiError } from '../types/api';

const DashboardPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SparqlResponse | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  const testConnection = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const data = await executeSparqlQuery(SPARQL_LIST_HEATPUMPS);
      setResult(data);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Dashboard
      </Typography>

      <Button
        variant="contained"
        onClick={testConnection}
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
        Test Hupie API
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message} {error.statusCode ? `(${error.statusCode})` : ''}
        </Alert>
      )}

      {result && (
        <Box>
          <Alert severity="success" sx={{ mb: 2 }}>
            Verbinding geslaagd — {result.results.bindings.length} warmtepompen gevonden
          </Alert>
          <Box
            component="pre"
            sx={{
              p: 2,
              bgcolor: 'grey.100',
              borderRadius: 1,
              overflow: 'auto',
              maxHeight: 400,
              fontSize: '0.8rem',
            }}
          >
            {JSON.stringify(result, null, 2)}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default DashboardPage;
