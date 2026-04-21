/**
 * Weather service — current conditions via Open-Meteo API.
 *
 * Open-Meteo is a free, open-source weather API requiring no API key.
 * For the Netherlands it uses KNMI and ECMWF model data.
 * CORS is unrestricted — direct browser calls work without a proxy.
 *
 * Source: https://open-meteo.com/en/docs
 * WMO weather interpretation codes:
 *   https://open-meteo.com/en/docs#weathervariables
 */

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';

export interface WeatherObservation {
  temperatureCelsius: number | null;
  feelsLikeCelsius: number | null;
  windSpeedMs: number | null;
  windDirectionDeg: number | null;
  precipitationMm: number | null;
  relativeHumidity: number | null;
  weatherCode: number | null;
  weatherDescription: string | null;
  observationTime: string;
  isValid: boolean;
}

/**
 * WMO weather interpretation codes → Dutch description.
 */
export const WMO_CODES: Record<number, string> = {
  0:  'Helder',
  1:  'Overwegend helder',
  2:  'Gedeeltelijk bewolkt',
  3:  'Bewolkt',
  45: 'Mist',
  48: 'IJsmist',
  51: 'Lichte motregen',
  53: 'Matige motregen',
  55: 'Dichte motregen',
  61: 'Lichte regen',
  63: 'Matige regen',
  65: 'Zware regen',
  71: 'Lichte sneeuw',
  73: 'Matige sneeuw',
  75: 'Zware sneeuw',
  77: 'Korrelige sneeuw',
  80: 'Lichte buien',
  81: 'Matige buien',
  82: 'Zware buien',
  85: 'Lichte sneeuwbuien',
  86: 'Zware sneeuwbuien',
  95: 'Onweer',
  96: 'Onweer met hagel',
  99: 'Zwaar onweer met hagel',
};

/**
 * Estimates expected COP based on outdoor temperature and supply class.
 * Based on typical air-to-water heat pump performance curves (EN 14825).
 *
 * Supply class 1 (≤30°C vloerverwarming): high efficiency baseline
 * Supply class 2 (30–55°C radiator): mid efficiency baseline
 * Supply class 3 (≥55°C hete lucht): low efficiency baseline
 */
export function estimateExpectedCop(
  outdoorTempC: number,
  supplyClass?: '1' | '2' | '3'
): number {
  const baseCop = supplyClass === '1' ? 4.5
                : supplyClass === '3' ? 2.5
                : 3.5;
  const delta = outdoorTempC - 7;
  const adjustment = delta >= 0 ? delta * 0.05 : delta * 0.10;
  return Math.max(1.0, Math.round((baseCop + adjustment) * 10) / 10);
}

/**
 * Fetches current weather for a WGS84 location via Open-Meteo.
 *
 * @param lat - WGS84 latitude
 * @param lon - WGS84 longitude
 * @returns WeatherObservation or null on failure
 */
export async function fetchWeather(
  lat: number,
  lon: number
): Promise<WeatherObservation | null> {
  try {
    const params = new URLSearchParams({
      latitude:  lat.toFixed(6),
      longitude: lon.toFixed(6),
      current: [
        'temperature_2m',
        'apparent_temperature',
        'relative_humidity_2m',
        'precipitation',
        'weather_code',
        'wind_speed_10m',
        'wind_direction_10m',
      ].join(','),
      wind_speed_unit: 'ms',
      timezone:        'Europe/Amsterdam',
      forecast_days:   '1',
    });

    const res = await fetch(`${OPEN_METEO_BASE}?${params}`);
    if (!res.ok) {
      console.warn('[weatherService] Open-Meteo request failed:', res.status);
      return null;
    }

    const data = await res.json() as OpenMeteoResponse;
    const c = data.current;
    if (!c) return null;

    const weatherCode = c.weather_code ?? null;

    return {
      temperatureCelsius:  c.temperature_2m         ?? null,
      feelsLikeCelsius:    c.apparent_temperature   ?? null,
      windSpeedMs:         c.wind_speed_10m         ?? null,
      windDirectionDeg:    c.wind_direction_10m     ?? null,
      precipitationMm:     c.precipitation          ?? null,
      relativeHumidity:    c.relative_humidity_2m   ?? null,
      weatherCode,
      weatherDescription:  weatherCode !== null
        ? (WMO_CODES[weatherCode] ?? `Code ${weatherCode}`)
        : null,
      observationTime: c.time ?? new Date().toISOString(),
      isValid:         c.temperature_2m != null,
    };
  } catch (err) {
    console.warn('[weatherService] Open-Meteo request error:', err);
    return null;
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface OpenMeteoResponse {
  current: {
    time:                  string;
    temperature_2m:        number;
    apparent_temperature:  number;
    relative_humidity_2m:  number;
    precipitation:         number;
    weather_code:          number;
    wind_speed_10m:        number;
    wind_direction_10m:    number;
  };
}
