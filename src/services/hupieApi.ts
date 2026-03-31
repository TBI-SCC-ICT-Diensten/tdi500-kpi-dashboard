import axios, { AxiosError } from 'axios';
import { config } from '../config';
import { SparqlResponse, ApiError } from '../types/api';
import { SPARQL_LIST_HEATPUMPS, SPARQL_HEATPUMP_DETAILS } from './sparqlQueries';
import { mapSparqlToHeatPumps } from './dataMapper';
import type { HeatPumpSystem } from '../types/heatpump';

const hupieAxios = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/sparql-query',
    'Accept': 'application/json',
  },
  params: {
    token: config.api.apiKey,
  }
});

const handleApiError = (error: unknown, endpoint: string): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const apiError: ApiError = {
      message: axiosError.message,
      statusCode: axiosError.response?.status,
      endpoint,
    };
    console.error(`[TDI500 API Error] ${endpoint} (${apiError.statusCode || 'Network/Timeout'}):`, axiosError.message);
    return apiError;
  }
  
  const unknownError: ApiError = {
    message: error instanceof Error ? error.message : String(error),
    endpoint,
  };
  console.error(`[TDI500 API Error] ${endpoint}:`, unknownError.message);
  return unknownError;
};

export const executeSparqlQuery = async (query: string): Promise<SparqlResponse> => {
  try {
    const response = await hupieAxios.post('', query);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'POST sparql');
  }
};

export const executeSparqlQueryGet = async (query: string): Promise<SparqlResponse> => {
  try {
    const response = await hupieAxios.get('', {
      params: {
        ...hupieAxios.defaults.params,
        query
      }
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'GET sparql');
  }
};

/**
 * Fetches detail data for a single heat pump URI.
 * Uses SPARQL_HEATPUMP_DETAILS which scopes the query to one pump via VALUES.
 * Each query is small enough for the Hupie endpoint to handle without timeout.
 */
export const fetchHeatPumpDetails = async (
  heatpumpUri: string
): Promise<SparqlResponse> => {
  return executeSparqlQuery(SPARQL_HEATPUMP_DETAILS(heatpumpUri));
};

/**
 * Two-phase data fetcher — replaces the timed-out SPARQL_ALL_HEATPUMP_DATA approach.
 *
 * Phase 1: fetch all heat pump URIs via SPARQL_LIST_HEATPUMPS
 * Phase 2: fetch details for each URI in parallel via Promise.allSettled()
 * Phase 3: map each successful response and flatten into HeatPumpSystem[]
 *
 * Uses Promise.allSettled (not Promise.all) so a single failed detail query
 * does not abort the entire fetch — that pump is skipped with a warning.
 */
export const fetchAllHeatPumpData = async (): Promise<HeatPumpSystem[]> => {
  const listResponse = await executeSparqlQuery(SPARQL_LIST_HEATPUMPS);
  const uris = listResponse.results.bindings
    .map((b) => b['heatpump']?.value)
    .filter((uri): uri is string => Boolean(uri));

  if (uris.length === 0) {
    console.warn('[TDI500] fetchAllHeatPumpData: no heat pump URIs returned');
    return [];
  }

  console.log(`[TDI500] fetchAllHeatPumpData: fetching details for ${uris.length} heat pumps`);

  const detailResults = await Promise.allSettled(
    uris.map((uri) => fetchHeatPumpDetails(uri))
  );

  const heatPumps: HeatPumpSystem[] = [];
  detailResults.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      heatPumps.push(...mapSparqlToHeatPumps(result.value));
    } else {
      console.warn(
        `[TDI500] fetchAllHeatPumpData: failed for ${uris[i]}:`,
        result.reason
      );
    }
  });

  console.log(`[TDI500] fetchAllHeatPumpData: mapped ${heatPumps.length} heat pumps`);
  return heatPumps;
};