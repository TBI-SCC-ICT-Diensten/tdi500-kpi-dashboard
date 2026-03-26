import { useState } from 'react';
import { Box, Typography, Button, Alert, CircularProgress } from '@mui/material';
import { executeSparqlQuery } from '../services/hupieApi';
import { SPARQL_LIST_HEATPUMPS, SPARQL_ALL_HEATPUMP_DATA } from '../services/sparqlQueries';
import { mapSparqlToHeatPumps } from '../services/dataMapper';
import type { SparqlResponse, ApiError } from '../types/api';
import type { HeatPumpSystem } from '../types/heatpump';

const DashboardPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SparqlResponse | null>(null);
  const [mappedData, setMappedData] = useState<HeatPumpSystem[] | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  const testConnection = async () => {
    setLoading(true);
    setResult(null);
    setMappedData(null);
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

  const testFullDataMapping = async () => {
    setLoading(true);
    setResult(null);
    setMappedData(null);
    setError(null);
    try {
      const data = await executeSparqlQuery(SPARQL_ALL_HEATPUMP_DATA);
      setResult(data);

      const heatPumps = mapSparqlToHeatPumps(data);
      setMappedData(heatPumps);
      console.log('Mapped HeatPumpSystem[]:', heatPumps);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  };

  const totalMeasurements = mappedData?.reduce((sum, hp) => sum + hp.measurements.length, 0) ?? 0;
  const totalErrorCodes = mappedData?.reduce((sum, hp) => sum + hp.errorCodes.length, 0) ?? 0;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Dashboard
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button
          variant="contained"
          onClick={testConnection}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
          Test Hupie API
        </Button>

        <Button
          variant="contained"
          color="secondary"
          onClick={testFullDataMapping}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
          Test Data Mapping
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message} {error.statusCode ? `(${error.statusCode})` : ''}
        </Alert>
      )}

      {mappedData && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {mappedData.length} warmtepompen gevonden, {totalMeasurements} metingen, {totalErrorCodes} foutcodes
        </Alert>
      )}

      {result && (
        <Box>
          <Alert severity="success" sx={{ mb: 2 }}>
            Verbinding geslaagd — {result.results.bindings.length} bindings ontvangen
            {mappedData ? ` → ${mappedData.length} warmtepompen gemapped` : ''}
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
            {JSON.stringify(mappedData ?? result, null, 2)}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default DashboardPage;
