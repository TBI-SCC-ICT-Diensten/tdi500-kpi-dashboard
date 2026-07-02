import { useState, useEffect } from 'react';
import { fetchWeather } from '../services/weatherService';
import type { Contingent } from '../types/heatpump';

/**
 * View hook for ContingentDetailPage: fetches the current outdoor temperature for
 * a contingent (from the first heat pump that carries WGS84 coordinates). Keeps the
 * page out of the weather service. Non-fatal — weather context is enhancement only.
 */
export const useOutdoorTemperature = (contingent: Contingent | undefined): number | null => {
  const [outdoorTempCelsius, setOutdoorTempCelsius] = useState<number | null>(null);

  useEffect(() => {
    if (!contingent) return;

    const pumpWithCoords = contingent.heatPumps.find((p) => p.wgs84);
    if (!pumpWithCoords?.wgs84) return;

    const { lat, lon } = pumpWithCoords.wgs84;
    fetchWeather(lat, lon)
      .then((obs) => {
        if (obs?.isValid && obs.temperatureCelsius !== null) {
          setOutdoorTempCelsius(obs.temperatureCelsius);
        }
      })
      .catch(() => {
        // Non-fatal — weather context is enhancement only
      });
  }, [contingent?.id]);

  return outdoorTempCelsius;
};
