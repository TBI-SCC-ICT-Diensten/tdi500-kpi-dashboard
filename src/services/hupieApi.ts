import axios from 'axios';
import { config } from '../config';
import type { SparqlResponse, ApiError } from '../types/api';
import { SPARQL_LIST_HEATPUMPS, SPARQL_HEATPUMP_DETAILS } from './sparqlQueries';
import { mapSparqlToHeatPumps } from './dataMapper';
import type { HeatPumpSystem } from '../types/heatpump';
import { MOCK_HEAT_PUMPS } from './mockData';

/**
 * Thrown when the manufacturer's server is rate limiting requests.
 * The Hupie API returns HTTP 200 with this message in the body
 * rather than a proper HTTP 429, so we must parse the response text.
 *
 * Triple Solar specifically returns:
 *   "No response from manufacturer server"
 */
export class RateLimitError extends Error {
  readonly type = 'rate_limit' as const;
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * Thrown when the manufacturer's server is unreachable for other reasons.
 * Also returned as HTTP 200 with an error message in the body.
 */
export class ManufacturerServerError extends Error {
  readonly type = 'manufacturer_server' as const;
  constructor(message: string) {
    super(message);
    this.name = 'ManufacturerServerError';
  }
}

export type DataSource = 'live' | 'mock';

// Default from env, overridable at runtime via setDataSource()
const envDefault: DataSource =
  (import.meta.env['VITE_USE_MOCK_DATA'] as string | undefined) === 'true'
    ? 'mock'
    : 'live';

let currentDataSource: DataSource = envDefault;

type DataSourceListener = (source: DataSource) => void;
const dataSourceListeners = new Set<DataSourceListener>();

export const getDataSource = (): DataSource => currentDataSource;

export const setDataSource = (source: DataSource): void => {
  if (currentDataSource === source) return;
  currentDataSource = source;
  console.info(`[hupieApi] Data source switched to: ${source}`);
  dataSourceListeners.forEach((listener) => listener(source));
};

/**
 * Subscribe to data source changes. The listener fires each time
 * setDataSource() is called with a new value. Returns an unsubscribe
 * function for cleanup.
 *
 * Used by useDashboardData to auto-refetch when the user toggles the
 * source, and by Header to keep its chip label in sync.
 */
export const subscribeToDataSource = (listener: DataSourceListener): (() => void) => {
  dataSourceListeners.add(listener);
  return () => {
    dataSourceListeners.delete(listener);
  };
};

const hupieAxios = axios.create({
  baseURL: config.api.baseUrl,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/sparql-query',
    'Accept': 'application/json',
  },
});

/**
 * Separate Axios instance for per-pump detail queries (60s timeout, same as
 * the list client). The /api/hupie proxy holds the token server-side.
 */
const hupieDetailAxios = axios.create({
  baseURL: config.api.baseUrl,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/sparql-query',
    'Accept': 'application/json',
  },
});

/**
 * Separate Axios instance for SPARQL UPDATE queries.
 * SPARQL UPDATE requires Content-Type: application/sparql-update, which is
 * different from the SELECT client (application/sparql-query). The /api/hupie
 * proxy reads this Content-Type and forwards to the Hupie /update/ endpoint
 * (reads go to /query/); the token is attached server-side.
 */
const hupieUpdateAxios = axios.create({
  baseURL: config.api.baseUrl,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/sparql-update',
    'Accept': 'application/json',
  },
});

const handleApiError = (error: unknown, endpoint: string): ApiError => {
  if (axios.isAxiosError(error)) {
    // Surface the server's real message — the proxy returns { error: "..." } —
    // instead of the generic "Request failed with status code 500".
    const data: unknown = error.response?.data;
    const serverMessage =
      data && typeof data === 'object' && typeof (data as { error?: unknown }).error === 'string'
        ? (data as { error: string }).error
        : typeof data === 'string' && data.trim().length > 0
          ? data
          : null;
    const apiError: ApiError = {
      message: serverMessage ?? error.message,
      statusCode: error.response?.status,
      endpoint,
    };
    console.error(`[TDI500 API Error] ${endpoint} (${apiError.statusCode || 'Network/Timeout'}):`, apiError.message);
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

/**
 * Fetches detail data for a single heat pump URI.
 * Uses SPARQL_HEATPUMP_DETAILS which scopes the query to one pump via VALUES.
 * Each query is small enough for the Hupie endpoint to handle without timeout.
 */
export const fetchHeatPumpDetails = async (
  id: string
): Promise<SparqlResponse> => {
  try {
    const response = await hupieDetailAxios.post('', SPARQL_HEATPUMP_DETAILS(id));
    return response.data;
  } catch (error) {
    throw handleApiError(error, `POST sparql-detail [${id}]`);
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
  // Short-circuit: if mock mode is active, return mock data
  if (currentDataSource === 'mock') {
    console.info('[hupieApi] Using mock data (mock mode active)');
    // Simulate a brief loading delay so UI shows spinner realistically
    await new Promise((resolve) => setTimeout(resolve, 600));
    // If streaming callback is provided, call it for each pump
    if (onPumpLoaded) {
      for (const pump of MOCK_HEAT_PUMPS) {
        onPumpLoaded(pump);
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
    }
    return MOCK_HEAT_PUMPS;
  }

  const listResponse = await executeSparqlQuery(SPARQL_LIST_HEATPUMPS);
  const ids = listResponse.results.bindings
    .map((b) => b['id']?.value)
    .filter((id): id is string => Boolean(id));

  if (ids.length === 0) {
    console.warn('[TDI500] fetchAllHeatPumpData: no heat pump IDs returned');
    return [];
  }

  console.log(`[TDI500] fetchAllHeatPumpData: fetching details for ${ids.length} heat pumps`);

  const allPumps: HeatPumpSystem[] = [];

  for (const id of ids) {
    try {
      const response = await fetchHeatPumpDetails(id);
      const mapped = mapSparqlToHeatPumps(response);
      mapped.forEach((pump) => {
        allPumps.push(pump);
        if (onPumpLoaded) onPumpLoaded(pump);
      });
    } catch (error) {
      console.warn(
        `[TDI500] fetchAllHeatPumpData: failed for ${id}:`,
        error
      );
    }
  }

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
  // Mock-mode guard — mirrors the read-path short-circuit in fetchAllHeatPumpData.
  // A SET/UPDATE has no manufacturer mock to write to, so in mock mode we SIMULATE:
  // log the would-be SPARQL UPDATE (the parsed values are embedded in it) and
  // return success WITHOUT any network call. Enforced here, at the lowest write
  // chokepoint, so no caller can reach a real pump while the dashboard is in mock
  // mode (the read path guards the same way at fetchAllHeatPumpData).
  if (currentDataSource === 'mock') {
    console.info(
      '[hupieApi] Mock-modus — gesimuleerde schrijfactie, GEEN netwerkverzoek verzonden.\n' +
      'Onderstaande SPARQL UPDATE zou naar de Hupie API zijn verstuurd:\n' +
      query
    );
    return; // simulated success — same return shape (void) as a real write
  }

  let response;
  try {
    response = await hupieUpdateAxios.post('', query);
  } catch (error) {
    throw handleApiError(error, 'POST sparql-update');
  }

  // Hupie returns HTTP 200 even when the manufacturer's server
  // rate-limits the request. Check response body for error strings.
  const responseBody = typeof response.data === 'string'
    ? response.data
    : JSON.stringify(response.data ?? '');

  if (responseBody.includes('No response from manufacturer server')) {
    throw new RateLimitError(
      'Triple Solar server niet bereikbaar — rate limit bereikt. ' +
      'Wacht 30 seconden en probeer opnieuw.'
    );
  }

  if (responseBody.toLowerCase().includes('manufacturer server')) {
    throw new ManufacturerServerError(
      'Geen reactie van de fabrikantserver. Probeer het opnieuw.'
    );
  }
};