import { useEffect, useState } from 'react';
import {
  fetchWeather,
  estimateExpectedCop,
  type WeatherObservation,
} from '../services/weatherService';
import { rdToWgs84 } from '../utils/rdToWgs84';
import type { SupplyTemperatureClass } from '../types/heatpump';

export type { WeatherObservation };

/**
 * View hook for WeatherWidget: fetches current weather for an RD location and
 * derives the expected-COP figure + the Dutch advisory copy. Keeps the component
 * out of the weather service and free of the in-render advisory logic.
 */
export const useWeather = (
  rdCoordinates: [number, number],
  supplyTemperatureClass?: SupplyTemperatureClass
) => {
  const [obs, setObs] = useState<WeatherObservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const [lat, lon] = rdToWgs84(rdCoordinates[0], rdCoordinates[1]);

    fetchWeather(lat, lon)
      .then((result) => {
        if (cancelled) return;
        if (result?.isValid) {
          setObs(result);
        } else {
          setError('Weerdata tijdelijk niet beschikbaar');
        }
      })
      .catch(() => {
        if (!cancelled) setError('Verbindingsfout met Open-Meteo');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [rdCoordinates[0], rdCoordinates[1]]);

  const expectedCop =
    obs && obs.temperatureCelsius !== null
      ? estimateExpectedCop(obs.temperatureCelsius, supplyTemperatureClass)
      : null;

  const copContext =
    obs && obs.temperatureCelsius !== null
      ? obs.temperatureCelsius < 0
        ? 'Koude dag — hogere aanvoertemperatuur en lager rendement verwacht.'
        : obs.temperatureCelsius > 10
        ? 'Mild weer — gunstige omstandigheden voor de warmtepomp.'
        : 'Normale stookomstandigheden.'
      : null;

  return { obs, loading, error, expectedCop, copContext };
};
