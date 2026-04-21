/**
 * WeatherWidget — current weather for a BAG address location.
 *
 * Displays Open-Meteo weather data with COP context relevant
 * to heat pump performance at the current outdoor temperature.
 *
 * Data source: Open-Meteo (KNMI + ECMWF model data for Netherlands)
 */
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import AirIcon from '@mui/icons-material/Air';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { fetchWeather, estimateExpectedCop, type WeatherObservation }
  from '../../services/weatherService';
import { rdToWgs84 } from '../../utils/rdToWgs84';
import type { SupplyTemperatureClass } from '../../types/heatpump';

interface Props {
  rdCoordinates:          [number, number];
  supplyTemperatureClass?: SupplyTemperatureClass;
}

function windDirectionLabel(deg: number): string {
  const dirs = ['N', 'NO', 'O', 'ZO', 'Z', 'ZW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8] ?? 'N';
}

const WeatherWidget = ({ rdCoordinates, supplyTemperatureClass }: Props) => {
  const [obs,     setObs]     = useState<WeatherObservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 2 }}>
        <CircularProgress size={16} />
        <Typography variant="caption" color="text.secondary">
          Weerdata ophalen...
        </Typography>
      </Box>
    );
  }

  if (error || !obs) {
    return (
      <Typography variant="caption" color="text.disabled" sx={{ py: 1, display: 'block' }}>
        {error ?? 'Geen weerdata beschikbaar'}
      </Typography>
    );
  }

  const expectedCop = obs.temperatureCelsius !== null
    ? estimateExpectedCop(obs.temperatureCelsius, supplyTemperatureClass)
    : null;

  const time = new Date(obs.observationTime).toLocaleTimeString('nl-NL', {
    hour: '2-digit', minute: '2-digit',
  });

  const copContext = obs.temperatureCelsius !== null
    ? obs.temperatureCelsius < 0
      ? 'Koude dag — hogere aanvoertemperatuur en lager rendement verwacht.'
      : obs.temperatureCelsius > 10
      ? 'Mild weer — gunstige omstandigheden voor de warmtepomp.'
      : 'Normale stookomstandigheden.'
    : null;

  return (
    <Box>
      {/* Source + time */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between',
                 alignItems: 'center', mb: 1.5 }}>
        <Typography variant="caption" color="text.secondary">
          Open-Meteo (KNMI/ECMWF model)
        </Typography>
        <Typography variant="caption" color="text.disabled">
          {time}
        </Typography>
      </Box>

      {/* Weather description */}
      {obs.weatherDescription && (
        <Typography variant="caption" color="text.secondary"
          sx={{ display: 'block', mb: 1.5, fontStyle: 'italic' }}>
          {obs.weatherDescription}
        </Typography>
      )}

      {/* Metrics grid */}
      <Box sx={{ display: 'grid',
                 gridTemplateColumns: 'repeat(4, 1fr)',
                 gap: 1, mb: 2 }}>

        <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
          <ThermostatIcon sx={{ fontSize: 18, color: 'primary.main',
                                display: 'block', mx: 'auto', mb: 0.5 }} />
          <Typography variant="subtitle2" fontWeight={700} lineHeight={1}>
            {obs.temperatureCelsius?.toFixed(1)}°C
          </Typography>
          <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
            Buiten
          </Typography>
        </Paper>

        <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
          <DeviceThermostatIcon sx={{ fontSize: 18, color: 'text.secondary',
                                      display: 'block', mx: 'auto', mb: 0.5 }} />
          <Typography variant="subtitle2" fontWeight={700} lineHeight={1}>
            {obs.feelsLikeCelsius?.toFixed(1)}°C
          </Typography>
          <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
            Gevoeld
          </Typography>
        </Paper>

        <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
          <AirIcon sx={{ fontSize: 18, color: 'info.main',
                         display: 'block', mx: 'auto', mb: 0.5 }} />
          <Typography variant="subtitle2" fontWeight={700} lineHeight={1}>
            {obs.windSpeedMs?.toFixed(1)} m/s
          </Typography>
          <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
            Wind {obs.windDirectionDeg !== null
              ? windDirectionLabel(obs.windDirectionDeg) : ''}
          </Typography>
        </Paper>

        <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
          <WaterDropIcon sx={{ fontSize: 18, color: 'info.light',
                               display: 'block', mx: 'auto', mb: 0.5 }} />
          <Typography variant="subtitle2" fontWeight={700} lineHeight={1}>
            {obs.precipitationMm?.toFixed(1)} mm
          </Typography>
          <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
            Neerslag
          </Typography>
        </Paper>
      </Box>

      {/* COP context */}
      {expectedCop !== null && (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1,
                   p: 1.5, borderRadius: 1,
                   border: '1px solid', borderColor: 'divider',
                   bgcolor: 'action.hover' }}>
          <InfoOutlinedIcon sx={{ fontSize: 15, mt: 0.2,
                                   color: 'text.secondary', flexShrink: 0 }} />
          <Box>
            <Typography variant="caption" fontWeight={600} display="block">
              COP-verwachting bij {obs.temperatureCelsius?.toFixed(1)}°C
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Verwachte COP voor dit profiel: ≈{' '}
              <strong>{expectedCop.toFixed(1)}</strong>.{' '}
              {copContext}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default WeatherWidget;
