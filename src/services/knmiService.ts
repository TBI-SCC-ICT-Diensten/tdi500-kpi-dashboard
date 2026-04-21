/**
 * KNMI Data Platform service — current weather observations.
 *
 * Uses the Actuele10mindataKNMIstations dataset (10-minute observations).
 * Data is served as NetCDF3 binary files via signed download URLs.
 *
 * Flow:
 *   1. Get latest filename from file listing endpoint
 *   2. Get signed temporary download URL for that file
 *   3. Download binary NetCDF file as ArrayBuffer
 *   4. Parse with netcdfjs, find nearest station to target coordinates
 *   5. Return structured weather observation
 *
 * Requires: VITE_KNMI_API_KEY environment variable
 * CORS: proxied through Vite dev server (/knmi-dataplatform) — Authorization
 * header is injected server-side; no browser CORS preflight.
 *
 * Source: https://api.dataplatform.knmi.nl/open-data/v1/
 * Dataset: Actuele10mindataKNMIstations, version 2
 */

import { NetCDFReader } from 'netcdfjs';
import { haversineKm } from '../utils/rdToWgs84';

const KNMI_BASE = '/knmi-dataplatform/open-data/v1';
const DATASET_NAME = 'Actuele10mindataKNMIstations';
const DATASET_VERSION = '2';

export interface KnmiObservation {
  stationId: number;
  stationName?: string;
  distanceKm: number;
  temperatureCelsius: number | null;
  windSpeedMs: number | null;
  windDirectionDeg: number | null;
  precipitationMm: number | null;
  relativeHumidity: number | null;
  observationTime: string;  // ISO string from filename
  isValid: boolean;
}

/**
 * Fetches current weather observation for a given WGS84 location.
 *
 * @param targetLat - WGS84 latitude
 * @param targetLon - WGS84 longitude
 * @returns KnmiObservation for the nearest station, or null on failure
 */
export async function fetchKnmiWeather(
  targetLat: number,
  targetLon: number
): Promise<KnmiObservation | null> {
  const apiKey = import.meta.env['VITE_KNMI_API_KEY'] as string | undefined;
  if (!apiKey) {
    console.warn('[knmiService] VITE_KNMI_API_KEY not set — weather lookup skipped');
    return null;
  }
  // Key is injected server-side by Vite proxy — not sent from browser

  // Step 1: Get latest filename
  const listUrl =
    `${KNMI_BASE}/datasets/${DATASET_NAME}/versions/${DATASET_VERSION}/files` +
    `?maxKeys=1&orderBy=created&sorting=desc`;

  const listRes = await fetch(listUrl);
  if (!listRes.ok) {
    console.warn('[knmiService] File listing failed:', listRes.status);
    return null;
  }
  const listData = await listRes.json() as {
    files: { filename: string; created: string }[]
  };
  const filename = listData.files?.[0]?.filename;
  const fileCreated = listData.files?.[0]?.created ?? '';
  if (!filename) {
    console.warn('[knmiService] No files found in KNMI dataset');
    return null;
  }

  // Step 2: Get signed download URL
  const urlRes = await fetch(
    `${KNMI_BASE}/datasets/${DATASET_NAME}/versions/${DATASET_VERSION}/files/${filename}/url`
  );
  if (!urlRes.ok) {
    console.warn('[knmiService] Download URL request failed:', urlRes.status);
    return null;
  }
  const { temporaryDownloadUrl } = await urlRes.json() as {
    temporaryDownloadUrl: string
  };

  // Step 3: Download binary NetCDF file
  const fileRes = await fetch(temporaryDownloadUrl);
  if (!fileRes.ok) {
    console.warn('[knmiService] NetCDF file download failed:', fileRes.status);
    return null;
  }
  const buffer = await fileRes.arrayBuffer();

  // Step 4: Parse NetCDF and find nearest station
  return parseNetcdfAndFindNearest(buffer, targetLat, targetLon, fileCreated);
}

function parseNetcdfAndFindNearest(
  buffer: ArrayBuffer,
  targetLat: number,
  targetLon: number,
  fileCreated: string
): KnmiObservation | null {
  try {
    const reader = new NetCDFReader(buffer);

    // Log available variables on first parse for debugging
    if (import.meta.env.DEV) {
      console.debug(
        '[knmiService] NetCDF variables:',
        reader.variables.map((v: { name: string }) => v.name)
      );
    }

    // Station coordinates — try common variable name patterns
    const lats = tryGetVariable(reader, ['lat', 'latitude', 'LAT']) as number[] | null;
    const lons = tryGetVariable(reader, ['lon', 'longitude', 'LON']) as number[] | null;

    if (!lats || !lons || lats.length === 0) {
      console.warn('[knmiService] Could not find lat/lon variables in NetCDF');
      return null;
    }

    // Find nearest station index
    let nearestIdx = 0;
    let minDist = Infinity;
    for (let i = 0; i < lats.length; i++) {
      const lat = lats[i];
      const lon = lons[i];
      if (lat === undefined || lon === undefined) continue;
      const dist = haversineKm(targetLat, targetLon, lat, lon);
      if (dist < minDist) {
        minDist = dist;
        nearestIdx = i;
      }
    }

    // Station ID
    const stationIds = tryGetVariable(reader, ['station', 'STN', 'station_id', 'stationId']);
    const stationId = Array.isArray(stationIds)
      ? (stationIds[nearestIdx] as number) ?? nearestIdx
      : nearestIdx;

    // Extract observations — KNMI stores values as integers with scale factors
    // Temperature: variable 'T', units 0.1°C → divide by 10
    const tempRaw = tryGetVariableAtIndex(reader, ['T', 'temp', 'temperature', 'air_temperature'], nearestIdx);
    const temperatureCelsius = tempRaw !== null && tempRaw > -9999
      ? tempRaw / 10
      : null;

    // Wind speed: variable 'FF', units 0.1 m/s
    const windRaw = tryGetVariableAtIndex(reader, ['FF', 'FH', 'wind_speed', 'FF10'], nearestIdx);
    const windSpeedMs = windRaw !== null && windRaw > -9999
      ? windRaw / 10
      : null;

    // Wind direction: variable 'DD', degrees
    const windDirRaw = tryGetVariableAtIndex(reader, ['DD', 'wind_direction', 'DD10'], nearestIdx);
    const windDirectionDeg = windDirRaw !== null && windDirRaw > -9999
      ? windDirRaw
      : null;

    // Precipitation: variable 'RH', units 0.1 mm
    const precipRaw = tryGetVariableAtIndex(reader, ['RH', 'precipitation', 'DR'], nearestIdx);
    const precipitationMm = precipRaw !== null && precipRaw >= 0
      ? precipRaw / 10
      : null;

    // Relative humidity: variable 'U', percent
    const humRaw = tryGetVariableAtIndex(reader, ['U', 'humidity', 'relative_humidity'], nearestIdx);
    const relativeHumidity = humRaw !== null && humRaw > -9999
      ? humRaw
      : null;

    return {
      stationId,
      distanceKm: Math.round(minDist * 10) / 10,
      temperatureCelsius,
      windSpeedMs,
      windDirectionDeg,
      precipitationMm,
      relativeHumidity,
      observationTime: fileCreated,
      isValid: temperatureCelsius !== null,
    };
  } catch (err) {
    // netcdfjs throws on NetCDF4/HDF5 files — handle gracefully
    if (err instanceof Error && err.message.includes('Not a valid NetCDF v3 file')) {
      console.warn(
        '[knmiService] KNMI file is NetCDF4 format — netcdfjs only supports NetCDF3.',
        'A server-side conversion layer would be needed for NetCDF4 support.'
      );
    } else {
      console.warn('[knmiService] NetCDF parse error:', err);
    }
    return null;
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

type NetCdfReader = InstanceType<typeof NetCDFReader>;

function tryGetVariable(
  reader: NetCdfReader,
  names: string[]
): unknown[] | null {
  for (const name of names) {
    try {
      const data = reader.getDataVariable(name);
      if (data != null) return data as unknown[];
    } catch {
      // variable not found — try next
    }
  }
  return null;
}

function tryGetVariableAtIndex(
  reader: NetCdfReader,
  names: string[],
  index: number
): number | null {
  const data = tryGetVariable(reader, names);
  if (!data) return null;
  // Data may be 1D [stations] or 2D [time, stations] — flatten
  const flat = Array.isArray(data[0]) ? (data[0] as number[]) : (data as number[]);
  return flat[index] ?? null;
}
