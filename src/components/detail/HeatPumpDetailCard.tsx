/**
 * HeatPumpDetailCard — per-pump card for ContingentDetailPage
 *
 * Renders: device header, spec panel (manufacturer/model/serial/firmware/year),
 * building/room info, measurements, error codes expanded, and command panel.
 */
import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CircleIcon from '@mui/icons-material/Circle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import HeatPumpCommandPanel from '../dashboard/HeatPumpCommandPanel';
import { PROPERTY_LABEL_MAP } from '../../types/units';
import type { HeatPumpSystem } from '../../types/heatpump';

const statusColor = {
  active: 'success' as const,
  warning: 'warning' as const,
  error: 'error' as const,
  offline: 'default' as const,
  unknown: 'default' as const,
};

const statusLabel = {
  active: 'Actief',
  warning: 'Waarschuwing',
  error: 'Fout',
  offline: 'Offline',
  unknown: 'Onbekend',
};

const severityColor: Record<string, string> = {
  critical: 'error.dark',
  high: 'error.dark',
  error: 'error.dark',
  warning: 'warning.dark',
  low: 'text.secondary',
};

interface Props {
  heatPump: HeatPumpSystem;
}

const HeatPumpDetailCard = ({ heatPump }: Props) => {
  const [specsExpanded, setSpecsExpanded] = useState(false);
  const specs = heatPump.deviceSpecs;
  const hasSpecs = specs && Object.values(specs).some(Boolean);

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>

      {/* ── Header: ID + status ─────────────────────── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between',
                 alignItems: 'center', mb: 0.5 }}>
        <Typography variant="subtitle2" fontWeight={600}
          sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
          {heatPump.id}
        </Typography>
        <Chip
          icon={<CircleIcon sx={{ fontSize: '10px !important' }} />}
          label={statusLabel[heatPump.status]}
          color={statusColor[heatPump.status]}
          size="small"
          variant="outlined"
        />
      </Box>

      {/* ── Manufacturer + model subtitle ───────────── */}
      {specs?.manufacturer && (
        <Typography variant="caption" color="text.secondary"
          sx={{ display: 'block', mb: 1 }}>
          {specs.manufacturer}{specs.model ? ` — ${specs.model}` : ''}
        </Typography>
      )}

      {/* ── Building / room ─────────────────────────── */}
      {(heatPump.building || heatPump.room) && (
        <Typography variant="caption" color="text.disabled"
          sx={{ display: 'block', mb: 1 }}>
          {[heatPump.building, heatPump.room].filter(Boolean).join(' · ')}
        </Typography>
      )}

      <Divider sx={{ mb: 1.5 }} />

      {/* ── Device specs collapsible ─────────────────── */}
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
            <Box sx={{ display: 'flex', flexDirection: 'column',
                       gap: 0.4, pt: 1,
                       pl: 1, borderLeft: '2px solid',
                       borderColor: 'divider' }}>
              {[
                { label: 'Fabrikant',     value: specs.manufacturer },
                { label: 'Model',         value: specs.model },
                { label: 'Serienummer',   value: specs.serialNumber },
                { label: 'Firmware',      value: specs.firmwareVersion },
                { label: 'Bouwjaar',      value: specs.yearOfManufacture?.toString() },
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

      {/* ── Measurements ────────────────────────────── */}
      {heatPump.measurements.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1 }}>
          {heatPump.measurements.map((m) => (
            <Box key={m.property}
              sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">
                {PROPERTY_LABEL_MAP[m.property] ?? m.property}
              </Typography>
              <Typography variant="caption" fontWeight={500}>
                {m.value} {m.unit}
              </Typography>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="caption" color="text.disabled"
          sx={{ display: 'block', mb: 1 }}>
          Geen metingen beschikbaar
        </Typography>
      )}

      {/* ── Error codes expanded ─────────────────────── */}
      {heatPump.errorCodes.length > 0 && (
        <Box sx={{ mt: 1, mb: 0.5 }}>
          {heatPump.errorCodes.map((ec) => (
            <Box key={ec.code}
              sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75,
                    p: 0.75, mb: 0.5, bgcolor: 'error.light',
                    borderRadius: 1 }}>
              <WarningAmberIcon sx={{ fontSize: 14, mt: 0.1,
                color: severityColor[ec.severity.toLowerCase()] ?? 'error.dark' }} />
              <Box>
                <Typography variant="caption" fontWeight={700}
                  color={severityColor[ec.severity.toLowerCase()] ?? 'error.dark'}
                  sx={{ fontFamily: 'monospace' }}>
                  {ec.code}
                </Typography>
                {ec.message && (
                  <Typography variant="caption" color="error.dark"
                    sx={{ display: 'block', fontSize: '0.7rem' }}>
                    {ec.message}
                  </Typography>
                )}
              </Box>
              <Tooltip title={`Ernst: ${ec.severity}`} placement="top">
                <Chip label={ec.severity} size="small"
                  sx={{ ml: 'auto', height: 16, fontSize: '0.6rem' }} />
              </Tooltip>
            </Box>
          ))}
        </Box>
      )}

      {/* ── Command panel ────────────────────────────── */}
      <HeatPumpCommandPanel heatPump={heatPump} />

    </Paper>
  );
};

export default HeatPumpDetailCard;
