import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import HeatPumpCommandPanel from '../dashboard/HeatPumpCommandPanel';
import { PROPERTY_LABEL_MAP } from '../../types/units';
import type { HeatPumpSystem, SupplyTemperatureClass } from '../../types/heatpump';
import { estimateExpectedCop } from '../../services/weatherService';

type PumpStatus = 'active' | 'warning' | 'error' | 'offline' | 'unknown';

const statusDotColor: Record<PumpStatus, string> = {
  active: '#16A34A',
  warning: '#D97706',
  error: '#DC2626',
  offline: '#6B7280',
  unknown: '#6B7280',
};

const statusLabel: Record<PumpStatus, string> = {
  active: 'Actief',
  warning: 'Waarschuwing',
  error: 'Fout',
  offline: 'Offline',
  unknown: 'Onbekend',
};

const getSeveritySx = (severity: string, isDark: boolean) => {
  const s = severity.toLowerCase();
  if (s === 'critical' || s === 'high' || s === 'error') {
    return {
      bg:     isDark ? 'rgba(220,38,38,0.15)'  : '#FEE2E2',
      text:   isDark ? '#FCA5A5'               : '#991B1B',
      border: '#DC2626',
    };
  }
  if (s === 'warning') {
    return {
      bg:     isDark ? 'rgba(217,119,6,0.15)'  : '#FEF3C7',
      text:   isDark ? '#FCD34D'               : '#92400E',
      border: '#D97706',
    };
  }
  return {
    bg:     isDark ? 'rgba(148,163,184,0.10)' : '#F1F5F9',
    text:   isDark ? '#94A3B8'               : '#475569',
    border: isDark ? '#475569'               : '#94A3B8',
  };
};

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

  // Expected COP based on outdoor temp + supply class
  // Only calculated when we have outdoor temperature context
  const copMeasurement = heatPump.measurements.find(
    (m) => m.property === 'cop'
  );
  const actualCop = copMeasurement?.value ?? null;

  const expectedCop =
    outdoorTempCelsius !== undefined && supplyTemperatureClass
      ? estimateExpectedCop(outdoorTempCelsius, supplyTemperatureClass)
      : null;

  // COP status: how does actual compare to expected?
  const copDelta =
    actualCop !== null && expectedCop !== null
      ? actualCop - expectedCop
      : null;

  const copStatus: 'good' | 'warning' | 'critical' | null =
    copDelta === null
      ? null
      : copDelta >= -0.3
      ? 'good'       // within 0.3 of expected or above
      : copDelta >= -0.8
      ? 'warning'    // 0.3–0.8 below expected
      : 'critical';  // more than 0.8 below expected

  const copStatusColor: Record<'good' | 'warning' | 'critical', string> = {
    good:     '#16A34A',
    warning:  '#D97706',
    critical: '#DC2626',
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25, flexShrink: 0 }}>
          <Box sx={{
            width: 8, height: 8, borderRadius: '50%',
            bgcolor: statusDotColor[status],
            flexShrink: 0,
          }} />
          <Typography variant="caption" color="text.secondary">
            {statusLabel[status]}
          </Typography>
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

      {/* ── Error codes ───────────────────────────────────────────── */}
      {heatPump.errorCodes.length > 0 && (
        <Box sx={{ mt: 1, mb: 0.5 }}>
          {heatPump.errorCodes.map((ec) => {
            const sev = getSeveritySx(ec.severity, isDark);
            return (
              <Box key={ec.code}
                sx={{
                  display: 'flex', alignItems: 'flex-start', gap: 0.75,
                  p: '6px 10px', mb: 0.5,
                  bgcolor: sev.bg,
                  borderLeft: `3px solid ${sev.border}`,
                  borderRadius: '0 4px 4px 0',
                }}>
                <WarningAmberIcon sx={{ fontSize: 13, mt: 0.2,
                  color: sev.text, flexShrink: 0 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="caption" fontWeight={700}
                    sx={{ fontFamily: 'monospace', color: sev.text }}>
                    {ec.code}
                  </Typography>
                  {ec.message && (
                    <Typography variant="caption"
                      sx={{ display: 'block', fontSize: '0.7rem', color: sev.text }}>
                      {ec.message}
                    </Typography>
                  )}
                </Box>
                <Tooltip title={`Ernst: ${ec.severity}`} placement="top">
                  <Chip label={ec.severity} size="small"
                    sx={{
                      ml: 'auto', height: 16, fontSize: '0.6rem',
                      bgcolor: sev.border, color: '#fff', flexShrink: 0,
                    }} />
                </Tooltip>
              </Box>
            );
          })}
        </Box>
      )}

      {/* ── Command panel ─────────────────────────────────────────── */}
      <HeatPumpCommandPanel heatPump={heatPump} />

    </Paper>
  );
};

export default HeatPumpDetailCard;
