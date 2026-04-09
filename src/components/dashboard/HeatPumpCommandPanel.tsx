/**
 * HeatPumpCommandPanel — Layer 2 Remote Control UI
 *
 * Provides SET forms for:
 *   - Temperature setpoint (°C)
 *   - Heating curve (base °C + slope °C/°C)
 *
 * Calls heatPumpCommandService which sends SPARQL UPDATE to Hupie API.
 * Disabled when heat pump is offline.
 */
import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import TuneIcon from '@mui/icons-material/Tune';
import {
  setHeatingCurve,
  setTemperatureSetpoint,
} from '../../services/heatPumpCommandService';
import type {
  HeatPumpSystem,
  CommandStatus,
} from '../../types/heatpump';

interface Props {
  heatPump: HeatPumpSystem;
}

const HeatPumpCommandPanel = ({ heatPump }: Props) => {
  const isOffline = heatPump.status === 'offline';
  const [expanded, setExpanded] = useState(false);

  // ── Temperature setpoint state ───────────────────────────────────
  const currentSetpoint = heatPump.measurements.find(
    (m) => m.property === 'temperatureSetpoint'
  );
  const [setpointValue, setSetpointValue] = useState(
    currentSetpoint ? String(currentSetpoint.value) : ''
  );
  const [setpointStatus, setSetpointStatus] = useState<CommandStatus>('idle');
  const [setpointError, setSetpointError] = useState<string | null>(null);

  // ── Heating curve state ──────────────────────────────────────────
  const currentCurve = heatPump.heatingCurve;
  const [curveBase, setCurveBase] = useState(
    currentCurve ? String(currentCurve.baseValue) : ''
  );
  const [curveSlope, setCurveSlope] = useState(
    currentCurve ? String(currentCurve.slopeValue) : ''
  );
  const [curveStatus, setCurveStatus] = useState<CommandStatus>('idle');
  const [curveError, setCurveError] = useState<string | null>(null);

  // ── Handlers ─────────────────────────────────────────────────────
  const handleSetpointSubmit = async () => {
    const parsed = parseFloat(setpointValue);
    if (!Number.isFinite(parsed)) {
      setSetpointError('Voer een geldig getal in.');
      return;
    }
    if (parsed < 10 || parsed > 30) {
      setSetpointError('Setpoint moet tussen 10°C en 30°C liggen.');
      return;
    }

    setSetpointStatus('pending');
    setSetpointError(null);
    try {
      await setTemperatureSetpoint({ heatPumpId: heatPump.id, value: parsed });
      setSetpointStatus('success');
    } catch (err) {
      setSetpointStatus('error');
      setSetpointError(
        err instanceof Error ? err.message : 'Onbekende fout bij versturen commando.'
      );
    }
  };

  const handleCurveSubmit = async () => {
    const base = parseFloat(curveBase);
    const slope = parseFloat(curveSlope);

    if (!Number.isFinite(base)) {
      setCurveError('Voer een geldige basiswaarde in.');
      return;
    }
    if (!Number.isFinite(slope)) {
      setCurveError('Voer een geldige hellingswaarde in.');
      return;
    }
    if (base < 15 || base > 60) {
      setCurveError('Basiswaarde moet tussen 15°C en 60°C liggen.');
      return;
    }
    if (slope < 0.1 || slope > 4.0) {
      setCurveError('Hellingswaarde moet tussen 0,1 en 4,0 liggen.');
      return;
    }

    setCurveStatus('pending');
    setCurveError(null);
    try {
      await setHeatingCurve({
        heatPumpId: heatPump.id,
        baseValue: base,
        slopeValue: slope,
      });
      setCurveStatus('success');
    } catch (err) {
      setCurveStatus('error');
      setCurveError(
        err instanceof Error ? err.message : 'Onbekende fout bij versturen commando.'
      );
    }
  };

  return (
    <Box sx={{ mt: 1.5 }}>
      <Divider sx={{ mb: 1 }} />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => setExpanded((prev) => !prev)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <TuneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="caption" fontWeight={600} color="text.secondary"
            sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
            Inregelinstellingen
          </Typography>
        </Box>
        <IconButton size="small" disableRipple>
          {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ pt: 1.5 }}>
          {isOffline && (
            <Alert severity="warning" sx={{ mb: 1.5, py: 0.5, fontSize: '0.75rem' }}>
              Warmtepomp offline — commando's kunnen niet worden verstuurd.
            </Alert>
          )}

          {/* Temperature Setpoint */}
          <Typography variant="caption" color="text.secondary"
            sx={{ textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600, display: 'block', mb: 0.75 }}>
            Temperatuur Setpoint
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 0.5 }}>
            <TextField
              label="Setpoint (°C)"
              value={setpointValue}
              onChange={(e) => {
                setSetpointValue(e.target.value);
                setSetpointStatus('idle');
                setSetpointError(null);
              }}
              size="small"
              sx={{ width: 130 }}
              disabled={isOffline || setpointStatus === 'pending'}
              inputProps={{ inputMode: 'decimal', step: '0.5' }}
              helperText="10–30°C"
            />
            <Button
              variant="contained"
              size="small"
              onClick={handleSetpointSubmit}
              disabled={isOffline || setpointStatus === 'pending' || !setpointValue.trim()}
              sx={{ height: 40, minWidth: 80 }}
            >
              {setpointStatus === 'pending'
                ? <CircularProgress size={16} color="inherit" />
                : 'Instellen'}
            </Button>
          </Box>

          {setpointStatus === 'success' && (
            <Alert severity="success" sx={{ mb: 1, py: 0.25, fontSize: '0.72rem' }}>
              Setpoint succesvol ingesteld.
            </Alert>
          )}
          {setpointError && (
            <Alert severity="error" sx={{ mb: 1, py: 0.25, fontSize: '0.72rem' }}>
              {setpointError}
            </Alert>
          )}

          <Divider sx={{ my: 1.5 }} />

          {/* Heating Curve */}
          <Typography variant="caption" color="text.secondary"
            sx={{ textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600, display: 'block', mb: 0.75 }}>
            Stooklijn
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Basiswaarde: aanvoertemperatuur bij 0°C buitentemperatuur.
            Hellingswaarde: toename aanvoertemperatuur per graad buitentemperatuurdaling.
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flexWrap: 'wrap', mb: 0.5 }}>
            <TextField
              label="Basis (°C)"
              value={curveBase}
              onChange={(e) => {
                setCurveBase(e.target.value);
                setCurveStatus('idle');
                setCurveError(null);
              }}
              size="small"
              sx={{ width: 110 }}
              disabled={isOffline || curveStatus === 'pending'}
              inputProps={{ inputMode: 'decimal', step: '0.5' }}
              helperText="15–60°C"
            />
            <TextField
              label="Helling"
              value={curveSlope}
              onChange={(e) => {
                setCurveSlope(e.target.value);
                setCurveStatus('idle');
                setCurveError(null);
              }}
              size="small"
              sx={{ width: 110 }}
              disabled={isOffline || curveStatus === 'pending'}
              inputProps={{ inputMode: 'decimal', step: '0.1' }}
              helperText="0,1–4,0"
            />
            <Button
              variant="contained"
              size="small"
              onClick={handleCurveSubmit}
              disabled={
                isOffline ||
                curveStatus === 'pending' ||
                !curveBase.trim() ||
                !curveSlope.trim()
              }
              sx={{ height: 40, minWidth: 80 }}
            >
              {curveStatus === 'pending'
                ? <CircularProgress size={16} color="inherit" />
                : 'Instellen'}
            </Button>
          </Box>

          {curveStatus === 'success' && (
            <Alert severity="success" sx={{ mt: 0.5, py: 0.25, fontSize: '0.72rem' }}>
              Stooklijn succesvol ingesteld.
            </Alert>
          )}
          {curveError && (
            <Alert severity="error" sx={{ mt: 0.5, py: 0.25, fontSize: '0.72rem' }}>
              {curveError}
            </Alert>
          )}

          <Alert severity="info" sx={{ mt: 1.5, py: 0.5, fontSize: '0.72rem' }}>
            Commando's worden direct via SPARQL UPDATE naar de Hupie API verstuurd.
            Wijzigingen zijn direct actief op de warmtepomp.
          </Alert>
        </Box>
      </Collapse>
    </Box>
  );
};

export default HeatPumpCommandPanel;
