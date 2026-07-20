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
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Collapsible } from '@/components/ui/collapsible';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import { ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import { useHeatPumpCommand } from '../../hooks/useHeatPumpCommand';
import type { HeatPumpSystem } from '../../types/heatpump';
import { COMMAND_RANGES } from '../../config/commandRanges';

interface Props {
  heatPump: HeatPumpSystem;
}

const HeatPumpCommandPanel = ({ heatPump }: Props) => {
  const isOffline = heatPump.status === 'offline';
  const [expanded, setExpanded] = useState(false);

  const {
    isMock,
    confirm,
    setConfirm,
    setpointValue,
    handleSetpointChange,
    setpointStatus,
    setpointError,
    setpointMock,
    handleSetpointSubmit,
    curveBase,
    handleCurveBaseChange,
    curveSlope,
    handleCurveSlopeChange,
    curveStatus,
    curveError,
    curveMock,
    handleCurveSubmit,
    rateLimitCooldown,
  } = useHeatPumpCommand(heatPump);


  return (
    <Box sx={{ mt: 1.5 }}>
      <Separator className="mb-2" />
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
          <SlidersHorizontal size={16} className="text-slate-600 dark:text-slate-400" />
          <Typography variant="caption" fontWeight={600} color="text.secondary"
            sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
            Inregelinstellingen
          </Typography>
        </Box>
        {/* Decoratief: de RIJ is het kliktarget — een span i.p.v. een dode
            button is eerlijker a11y. p-[5px] = de oude 30px-IconButton-box. */}
        <span
          data-chevron
          aria-hidden="true"
          className="inline-flex shrink-0 p-[5px] text-slate-600 dark:text-slate-400"
        >
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </span>
      </Box>

      <Collapsible open={expanded} data-testid="command-collapsible">
        <Box sx={{ pt: 1.5 }}>
          {isOffline && (
            <Alert severity="warning" className="mb-3 py-2.5 text-xs">
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
              onChange={(e) => handleSetpointChange(e.target.value)}
              size="small"
              sx={{ width: 130 }}
              disabled={isOffline || setpointStatus === 'pending'}
              inputProps={{ inputMode: 'decimal', step: '0.5' }}
              helperText={`${COMMAND_RANGES.setpoint.min}–${COMMAND_RANGES.setpoint.max}°C`}
            />
            <Button
              size="sm"
              onClick={handleSetpointSubmit}
              disabled={
                isOffline ||
                setpointStatus === 'pending' ||
                !setpointValue.trim() ||
                rateLimitCooldown > 0
              }
              className="h-10 min-w-20"
            >
              {setpointStatus === 'pending'
                ? <Spinner size={16} />
                : rateLimitCooldown > 0
                ? `Wacht ${rateLimitCooldown}s`
                : 'Instellen'}
            </Button>
          </Box>

          {setpointStatus === 'success' && (
            <Alert severity={setpointMock ? 'info' : 'success'} className="mb-2 py-2 text-xs">
              {setpointMock
                ? 'Mock-modus — geen echte schrijfactie verzonden (gesimuleerd).'
                : 'Setpoint succesvol ingesteld.'}
            </Alert>
          )}
          {setpointError && (
            <Alert severity="danger" className="mb-2 py-2 text-xs">
              {setpointError}
            </Alert>
          )}

          <Separator className="my-3" />

          {/* Heating Curve */}
          <Typography variant="caption" color="text.secondary"
            sx={{ textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600, display: 'block', mb: 0.75 }}>
            Stooklijn
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Basiswaarde: de aanvoertemperatuur bij 0°C buitentemperatuur (bijv. 40°C).
            Stooklijn: wiskundige helling — negatieve waarde (bijv. −0,6 betekent 0,6°C toename aanvoer per graad daling buiten).
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flexWrap: 'wrap', mb: 0.5 }}>
            <TextField
              label="Basiswaarde (°C)"
              value={curveBase}
              onChange={(e) => handleCurveBaseChange(e.target.value)}
              size="small"
              sx={{ width: 110 }}
              disabled={isOffline || curveStatus === 'pending'}
              inputProps={{ inputMode: 'decimal', step: '0.5' }}
              helperText={`bijv. 40°C (${COMMAND_RANGES.curveBase.min}–${COMMAND_RANGES.curveBase.max})`}
            />
            <TextField
              label="Helling"
              value={curveSlope}
              onChange={(e) => handleCurveSlopeChange(e.target.value)}
              size="small"
              sx={{ width: 110 }}
              disabled={isOffline || curveStatus === 'pending'}
              inputProps={{ inputMode: 'decimal', step: '0.1' }}
              helperText="bijv. −0,6"
            />
            <Button
              size="sm"
              onClick={handleCurveSubmit}
              disabled={
                isOffline ||
                curveStatus === 'pending' ||
                !curveBase.trim() ||
                !curveSlope.trim() ||
                rateLimitCooldown > 0
              }
              className="h-10 min-w-20"
            >
              {curveStatus === 'pending'
                ? <Spinner size={16} />
                : rateLimitCooldown > 0
                ? `Wacht ${rateLimitCooldown}s`
                : 'Instellen'}
            </Button>
          </Box>

          {curveStatus === 'success' && (
            <Alert severity={curveMock ? 'info' : 'success'} className="mt-1 py-2 text-xs">
              {curveMock
                ? 'Mock-modus — geen echte schrijfactie verzonden (gesimuleerd).'
                : 'Stooklijn succesvol ingesteld.'}
            </Alert>
          )}
          {curveError && (
            <Alert severity="danger" className="mt-1 py-2 text-xs">
              {curveError}
            </Alert>
          )}

          {rateLimitCooldown > 0 && (
            <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{
                flex: 1,
                height: 3,
                bgcolor: 'action.hover',
                borderRadius: 2,
                overflow: 'hidden'
              }}>
                <Box sx={{
                  height: '100%',
                  width: `${(rateLimitCooldown / 30) * 100}%`,
                  bgcolor: 'warning.main',
                  transition: 'width 1s linear',
                  borderRadius: 2,
                }} />
              </Box>
              <Typography variant="caption" color="warning.main"
                sx={{ minWidth: 32, textAlign: 'right', fontWeight: 600 }}>
                {rateLimitCooldown}s
              </Typography>
            </Box>
          )}

          <Alert severity={isMock ? 'warning' : 'info'} className="mt-3 py-2.5 text-xs">
            {isMock
              ? "Mock-modus actief — commando's worden gesimuleerd en niet naar de warmtepomp verstuurd."
              : "Commando's worden direct via SPARQL UPDATE naar de Hupie API verstuurd. Wijzigingen zijn direct actief op de warmtepomp."}
          </Alert>
        </Box>
      </Collapsible>

      <Dialog open={confirm !== null} onClose={() => setConfirm(null)}>
        <DialogTitle>{confirm?.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirm?.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="ghost" onClick={() => setConfirm(null)}>Annuleren</Button>
          <Button onClick={() => confirm?.onConfirm()}>
            Bevestigen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HeatPumpCommandPanel;
