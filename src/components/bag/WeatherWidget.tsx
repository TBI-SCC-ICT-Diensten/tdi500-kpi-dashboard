/**
 * WeatherWidget — current weather for a BAG address location.
 *
 * Displays Open-Meteo weather data with COP context relevant
 * to heat pump performance at the current outdoor temperature.
 *
 * Data source: Open-Meteo (KNMI + ECMWF model data for Netherlands)
 */
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Thermometer, Wind, Droplet, Info } from 'lucide-react';
import { useWeather } from '../../hooks/useWeather';
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
  const { obs, loading, error, expectedCop, copContext } =
    useWeather(rdCoordinates, supplyTemperatureClass);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 2 }}>
        {/* C6: owned Spinner op text-primary (de oude default-primary-arc,
            TNO-gerebrand per #178). */}
        <Spinner size={16} className="text-primary" />
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

  const time = new Date(obs.observationTime).toLocaleTimeString('nl-NL', {
    hour: '2-digit', minute: '2-digit',
  });

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

        <Card className="p-3 text-center">
          <Thermometer size={18} className="mx-auto mb-1 block text-primary" />
          <Typography variant="subtitle2" fontWeight={700} lineHeight={1}>
            {obs.temperatureCelsius?.toFixed(1)}°C
          </Typography>
          <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
            Buiten
          </Typography>
        </Card>

        <Card className="p-3 text-center">
          <Thermometer size={18} className="mx-auto mb-1 block text-slate-600 dark:text-slate-400" />
          <Typography variant="subtitle2" fontWeight={700} lineHeight={1}>
            {obs.feelsLikeCelsius?.toFixed(1)}°C
          </Typography>
          <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
            Gevoeld
          </Typography>
        </Card>

        <Card className="p-3 text-center">
          <Wind size={18} className="mx-auto mb-1 block text-sky-500" />
          <Typography variant="subtitle2" fontWeight={700} lineHeight={1}>
            {obs.windSpeedMs?.toFixed(1)} m/s
          </Typography>
          <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
            Wind {obs.windDirectionDeg !== null
              ? windDirectionLabel(obs.windDirectionDeg) : ''}
          </Typography>
        </Card>

        <Card className="p-3 text-center">
          <Droplet size={18} className="mx-auto mb-1 block text-sky-400" />
          <Typography variant="subtitle2" fontWeight={700} lineHeight={1}>
            {obs.precipitationMm?.toFixed(1)} mm
          </Typography>
          <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
            Neerslag
          </Typography>
        </Card>
      </Box>

      {/* COP context */}
      {expectedCop !== null && (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1,
                   p: 1.5, borderRadius: 1,
                   border: '1px solid', borderColor: 'divider',
                   bgcolor: 'action.hover' }}>
          <Info size={15} className="mt-0.5 shrink-0 text-slate-600 dark:text-slate-400" />
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
