import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import HeatPumpCommandPanel from '../dashboard/HeatPumpCommandPanel';
import ErrorCodeRow from './ErrorCodeRow';
import StatusPill, { type PumpStatus } from '../common/StatusPill';
import { PROPERTY_LABEL_MAP } from '../../types/units';
import type { HeatPumpSystem, SupplyTemperatureClass } from '../../types/heatpump';
import { useHeatPumpDetail } from '../../hooks/useHeatPumpDetail';
import { STATUS_COLORS } from '../../theme/statusColors';

interface Props {
  heatPump: HeatPumpSystem;
  outdoorTempCelsius?: number;
  supplyTemperatureClass?: SupplyTemperatureClass;
}

const HeatPumpDetailCard = ({
  heatPump,
  outdoorTempCelsius,
  supplyTemperatureClass,
}: Props) => {
  const [specsExpanded, setSpecsExpanded] = useState(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const specs = heatPump.deviceSpecs;
  const hasSpecs = specs && Object.values(specs).some(Boolean);
  const status = heatPump.status as PumpStatus;

  const { expectedCop, copDelta, copStatus, errorCodes } =
    useHeatPumpDetail(heatPump, outdoorTempCelsius, supplyTemperatureClass);

  const copStatusColor: Record<'good' | 'warning' | 'critical', string> = {
    good:     STATUS_COLORS.healthy,
    warning:  STATUS_COLORS.warning,
    critical: STATUS_COLORS.danger,
  };

  return (
    <Paper data-testid="contingent-pump-card" variant="outlined" sx={{ p: 2 }}>

      {/* ── Header: manufacturer/model (prominent) + status dot ─── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between',
                 alignItems: 'flex-start', mb: 0.5 }}>
        <Box>
          <Typography variant="body1" fontWeight={600} sx={{ lineHeight: 1.3 }}>
            {specs?.manufacturer
              ? `${specs.manufacturer}${specs.model ? ` — ${specs.model}` : ''}`
              : 'Warmtepomp'}
          </Typography>
          <Typography variant="caption" color="text.secondary"
            sx={{ fontFamily: 'monospace' }}>
            {heatPump.id}
          </Typography>
        </Box>
        {/* Puur-Tailwind leaf in een MUI-parent (migratiepatroon: geen adapter
            nodig — Emotion- en Tailwind-classes bestaan naast elkaar). */}
        <Box sx={{ mt: 0.25, flexShrink: 0 }}>
          <StatusPill status={status} />
        </Box>
      </Box>

      {/* ── Building / room ─────────────────────────────────────── */}
      {(heatPump.building || heatPump.room) && (
        <Typography variant="caption" color="text.disabled"
          sx={{ display: 'block', mb: 1 }}>
          {[heatPump.building, heatPump.room].filter(Boolean).join(' · ')}
        </Typography>
      )}

      <Divider sx={{ mb: 1.5, mt: heatPump.building || heatPump.room ? 0 : 1 }} />

      {/* ── Device specs collapsible ─────────────────────────────── */}
      {hasSpecs && (
        <Box sx={{ mb: 1.5 }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', cursor: 'pointer' }}
            onClick={() => setSpecsExpanded(p => !p)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" fontWeight={600}
                color="text.secondary"
                sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                Apparaatinformatie
              </Typography>
            </Box>
            <IconButton size="small" disableRipple>
              {specsExpanded
                ? <ExpandLessIcon fontSize="small" />
                : <ExpandMoreIcon fontSize="small" />}
            </IconButton>
          </Box>
          <Collapse in={specsExpanded}>
            <Box sx={{
              bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'grey.50',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '6px',
              p: '8px 12px',
              mt: 0.75,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.4,
            }}>
              {[
                { label: 'Fabrikant',   value: specs.manufacturer },
                { label: 'Model',       value: specs.model },
                { label: 'Serienummer', value: specs.serialNumber },
                { label: 'Firmware',    value: specs.firmwareVersion },
                { label: 'Bouwjaar',    value: specs.yearOfManufacture?.toString() },
              ]
                .filter(r => r.value)
                .map(({ label, value }) => (
                  <Box key={label}
                    sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography variant="caption" fontWeight={500}
                      sx={{ fontFamily: label === 'Serienummer' ||
                                        label === 'Firmware'
                              ? 'monospace' : 'inherit' }}>
                      {value}
                    </Typography>
                  </Box>
                ))}
            </Box>
          </Collapse>
          <Divider sx={{ mt: 1.5 }} />
        </Box>
      )}

      {/* ── Measurements ─────────────────────────────────────────── */}
      {heatPump.measurements.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column',
                   gap: 0.5, mb: 1 }}>
          {heatPump.measurements.map((m) => {

            // Special treatment for COP when we have context
            if (m.property === 'cop' && expectedCop !== null && copStatus !== null) {
              return (
                <Box key={m.property}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between',
                             alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {PROPERTY_LABEL_MAP[m.property] ?? m.property}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Typography variant="caption" fontWeight={700}
                        sx={{ color: copStatusColor[copStatus] }}>
                        {m.value} {m.unit}
                      </Typography>
                      <Typography variant="caption"
                        sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
                        / verwacht {expectedCop.toFixed(1)}
                      </Typography>
                    </Box>
                  </Box>
                  {/* Inline context line for warning/critical */}
                  {copStatus !== 'good' && (
                    <Typography variant="caption"
                      sx={{ display: 'block', mt: 0.25, mb: 0.25,
                            fontSize: '0.68rem', fontStyle: 'italic',
                            color: copStatusColor[copStatus],
                            pl: 0 }}>
                      {copStatus === 'critical'
                        ? `${Math.abs(copDelta!).toFixed(1)} onder verwachting bij ${outdoorTempCelsius!.toFixed(1)}°C — controleren`
                        : `Licht onder verwachting bij ${outdoorTempCelsius!.toFixed(1)}°C`}
                    </Typography>
                  )}
                </Box>
              );
            }

            // Generic row for all other measurements
            if (m.property === 'temperatureSetpoint') return null; // Handled after roomTemperature

            if (m.property === 'roomTemperature') {
              const setpointMeasurement = heatPump.measurements.find(x => x.property === 'temperatureSetpoint');
              return (
                <React.Fragment key={m.property}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      {PROPERTY_LABEL_MAP[m.property] ?? m.property}
                    </Typography>
                    <Typography variant="caption" fontWeight={500}>
                      {m.value} {m.unit}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      Huidig Setpoint
                    </Typography>
                    <Typography variant="caption" fontWeight={500}>
                      {setpointMeasurement ? `${setpointMeasurement.value} °C` : 'Onbekend'}
                    </Typography>
                  </Box>
                </React.Fragment>
              );
            }

            return (
              <Box key={m.property}
                sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                  {PROPERTY_LABEL_MAP[m.property] ?? m.property}
                </Typography>
                <Typography variant="caption" fontWeight={500}>
                  {m.value} {m.unit}
                </Typography>
              </Box>
            );
          })}
        </Box>
      ) : (
        <Typography variant="caption" color="text.disabled"
          sx={{ display: 'block', mb: 1 }}>
          Geen metingen beschikbaar
        </Typography>
      )}

      {/* ── Error codes — puur-Tailwind rijen (ErrorCodeRow, #172-sjabloon) ── */}
      {errorCodes.length > 0 && (
        <Box sx={{ mt: 1, mb: 0.5 }}>
          {errorCodes.map((ecWithTermijn) => (
            <ErrorCodeRow
              key={ecWithTermijn.errorCode.code}
              errorCodeWithTermijn={ecWithTermijn}
            />
          ))}
          <Typography variant="caption" color="text.disabled"
            sx={{ display: 'block', mt: 0.25, fontSize: '0.66rem' }}>
            Oplostermijn op basis van de ernst van de storing.
          </Typography>
        </Box>
      )}

      {/* ── Command panel ─────────────────────────────────────────── */}
      <HeatPumpCommandPanel heatPump={heatPump} />

    </Paper>
  );
};

export default HeatPumpDetailCard;
