import axios from 'axios';
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

/**
 * Separate Axios instance for per-pump detail queries.
 * Uses a shorter timeout (30s) than the default so that unresponsive
 * pumps fail fast instead of blocking for 100s.
 */
const hupieDetailAxios = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.detailTimeout,
  headers: {
    'Content-Type': 'application/sparql-query',
    'Accept': 'application/json',
  },
  params: {
    token: config.api.apiKey,
  },
});

/**
 * Separate Axios instance for SPARQL UPDATE queries.
 * SPARQL UPDATE requires Content-Type: application/sparql-update,
 * which is different from the SELECT client (application/sparql-query).
 * These cannot share an instance because Axios does not support
 * per-request Content-Type overrides cleanly with interceptors.
 */
const hupieUpdateAxios = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/sparql-update',
    'Accept': 'application/json',
  },
  params: {
    token: config.api.apiKey,
  },
});

const handleApiError = (error: unknown, endpoint: string): ApiError => {
  if (axios.isAxiosError(error)) {
    const apiError: ApiError = {
      message: error.message,
      statusCode: error.response?.status,
      endpoint,
    };
    console.error(`[TDI500 API Error] ${endpoint} (${apiError.statusCode || 'Network/Timeout'}):`, error.message);
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
  try {
    const response = await hupieDetailAxios.post('', SPARQL_HEATPUMP_DETAILS(heatpumpUri));
    return response.data;
  } catch (error) {
    throw handleApiError(error, `POST sparql-detail [${heatpumpUri}]`);
  }
};

/**
 * Two-phase data fetcher with streaming support.
 *
 * Phase 1: fetch all heat pump URIs via SPARQL_LIST_HEATPUMPS
 * Phase 2: fire fetchHeatPumpDetails() for each URI concurrently
 *
 * onPumpLoaded callback fires as each pump resolves — callers can
 * update the UI immediately instead of waiting for all pumps.
 * If no callback is provided, falls back to returning the full array
 * after all pumps settle (original behavior, used in tests).
 */
export const fetchAllHeatPumpData = async (
  onPumpLoaded?: (pump: HeatPumpSystem) => void
): Promise<HeatPumpSystem[]> => {
  const listResponse = await executeSparqlQuery(SPARQL_LIST_HEATPUMPS);
  const uris = listResponse.results.bindings
    .map((b) => b['heatpump']?.value)
    .filter((uri): uri is string => Boolean(uri));

  if (uris.length === 0) {
    console.warn('[TDI500] fetchAllHeatPumpData: no heat pump URIs returned');
    return [];
  }

  console.log(`[TDI500] fetchAllHeatPumpData: fetching details for ${uris.length} heat pumps`);

  const allPumps: HeatPumpSystem[] = [];

  const promises = uris.map(async (uri) => {
    try {
      const response = await fetchHeatPumpDetails(uri);
      const mapped = mapSparqlToHeatPumps(response);
      mapped.forEach((pump) => {
        allPumps.push(pump);
        if (onPumpLoaded) onPumpLoaded(pump);
      });
    } catch (error) {
      console.warn(
        `[TDI500] fetchAllHeatPumpData: failed for ${uri}:`,
        error
      );
    }
  });

  await Promise.allSettled(promises);

  console.log(`[TDI500] fetchAllHeatPumpData: mapped ${allPumps.length} heat pumps`);
  return allPumps;
};

/**
 * Executes a SPARQL UPDATE query against the Hupie endpoint.
 * Used for write operations: SET heating curve, SET temperature setpoint.
 *
 * SPARQL UPDATE returns no result body on success (HTTP 200/204).
 * Returns Promise<void>.
 */
export const executeSparqlUpdate = async (query: string): Promise<void> => {
  try {
    await hupieUpdateAxios.post('', query);
  } catch (error) {
    throw handleApiError(error, 'POST sparql-update');
  }
};