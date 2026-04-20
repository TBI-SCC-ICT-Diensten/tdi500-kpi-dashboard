/**
 * WeatherWidget — displays current KNMI weather for a BAG address location.
 *
 * Shows: temperature, wind, precipitation, station info, and COP context.
 * The COP context shows what COP is expected at this outdoor temperature
 * for the selected supply temperature class.
 *
 * Data source: KNMI Actuele10mindataKNMIstations (10-minute observations)
 */

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import AirIcon from '@mui/icons-material/Air';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { fetchKnmiWeather, type KnmiObservation } from '../../services/knmiService';
import { rdToWgs84 } from '../../utils/rdToWgs84';
import type { SupplyTemperatureClass } from '../../types/heatpump';

interface Props {
  rdCoordinates: [number, number];  // RD New [x, y]
  supplyTemperatureClass?: SupplyTemperatureClass;
}

/**
 * Estimates expected COP based on outdoor temperature and supply class.
 * Based on typical air-to-water heat pump performance curves.
 * Source: EN 14825 test conditions and TNO TDI 500 profiel analysis.
 */
export function estimateExpectedCop(
  outdoorTempC: number,
  supplyClass?: SupplyTemperatureClass
): number {
  // Base COP at 7°C outdoor (A7/W35 reference point)
  // Supply class 1 (≤30°C): high efficiency floor heating
  // Supply class 2 (30-55°C): radiators
  // Supply class 3 (≥55°C): high-temp systems
  const baseCop = supplyClass === '1' ? 4.5 : supplyClass === '3' ? 2.5 : 3.5;

  // COP decreases by ~0.1 per degree outdoor temp drops below 7°C
  // COP increases by ~0.05 per degree outdoor temp rises above 7°C
  const delta = outdoorTempC - 7;
  const adjustment = delta >= 0 ? delta * 0.05 : delta * 0.10;

  return Math.max(1.0, Math.round((baseCop + adjustment) * 10) / 10);
}

function windDirection(deg: number): string {
  const dirs = ['N', 'NO', 'O', 'ZO', 'Z', 'ZW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8] ?? 'N';
}

const WeatherWidget = ({ rdCoordinates, supplyTemperatureClass }: Props) => {
  const [obs, setObs] = useState<KnmiObservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const [wgsLat, wgsLon] = rdToWgs84(rdCoordinates[0], rdCoordinates[1]);

    fetchKnmiWeather(wgsLat, wgsLon)
      .then((result) => {
        if (cancelled) return;
        if (result) {
          setObs(result);
        } else {
          setError('Weerdata tijdelijk niet beschikbaar');
        }
      })
      .catch(() => {
        if (!cancelled) setError('Verbindingsfout met KNMI Data Platform');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [rdCoordinates[0], rdCoordinates[1]]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 2 }}>
        <CircularProgress size={16} />
        <Typography variant="caption" color="text.secondary">
          Weerdata ophalen via KNMI...
        </Typography>
      </Box>
    );
  }

  if (error || !obs || !obs.isValid) {
    return (
      <Box sx={{ py: 1 }}>
        <Typography variant="caption" color="text.disabled">
          {error ?? 'Geen weerdata beschikbaar voor dit gebied'}
        </Typography>
      </Box>
    );
  }

  const expectedCop = obs.temperatureCelsius !== null
    ? estimateExpectedCop(obs.temperatureCelsius, supplyTemperatureClass)
    : null;

  const time = new Date(obs.observationTime).toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Box>
      {/* Station info header */}
      <Box sx={{ display: 'flex', alignItems: 'center',
                 justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="caption" color="text.secondary">
          KNMI station #{obs.stationId} — {obs.distanceKm} km afstand
        </Typography>
        <Typography variant="caption" color="text.disabled">
          {time}
        </Typography>
      </Box>

      {/* Weather metrics */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                 gap: 1.5, mb: 2 }}>

        {/* Temperature */}
        <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
          <ThermostatIcon sx={{ fontSize: 20, color: 'primary.main', mb: 0.5 }} />
          <Typography variant="h6" fontWeight={700} lineHeight={1}>
            {obs.temperatureCelsius?.toFixed(1) ?? '—'}°C
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Buitentemperatuur
          </Typography>
        </Paper>

        {/* Wind */}
        <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
          <AirIcon sx={{ fontSize: 20, color: 'info.main', mb: 0.5 }} />
          <Typography variant="h6" fontWeight={700} lineHeight={1}>
            {obs.windSpeedMs?.toFixed(1) ?? '—'} m/s
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Wind {obs.windDirectionDeg !== null
              ? windDirection(obs.windDirectionDeg)
              : ''}
          </Typography>
        </Paper>

        {/* Precipitation */}
        <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
          <WaterDropIcon sx={{ fontSize: 20, color: 'info.light', mb: 0.5 }} />
          <Typography variant="h6" fontWeight={700} lineHeight={1}>
            {obs.precipitationMm !== null
              ? obs.precipitationMm.toFixed(1)
              : '—'} mm
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Neerslag (10 min)
          </Typography>
        </Paper>
      </Box>

      {/* COP context */}
      {expectedCop !== null && (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1,
                   p: 1.5, bgcolor: 'action.hover',
                   borderRadius: 1, border: '1px solid',
                   borderColor: 'divider' }}>
          <InfoOutlinedIcon sx={{ fontSize: 16, mt: 0.15,
                                   color: 'text.secondary', flexShrink: 0 }} />
          <Box>
            <Typography variant="caption" fontWeight={600} display="block">
              COP-context bij {obs.temperatureCelsius?.toFixed(1)}°C buiten
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Verwachte COP voor dit profiel: ≈{' '}
              <strong>{expectedCop.toFixed(1)}</strong>.{' '}
              {obs.temperatureCelsius !== null && obs.temperatureCelsius < 0
                ? 'Koude dag — hogere aanvoertemperatuur en lager rendement verwacht.'
                : obs.temperatureCelsius !== null && obs.temperatureCelsius > 10
                ? 'Mild weer — gunstige omstandigheden voor warmtepomp.'
                : 'Normale stookomstandigheden.'}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default WeatherWidget;
