import { useState, useEffect } from 'react';
import { getErrorMessage } from '../utils/getErrorMessage';
import { setHeatingCurve, setTemperatureSetpoint } from '../services/heatPumpCommandService';
import { RateLimitError } from '../services/hupieApi';
import { useDataSource } from './useDataSource';
import { COMMAND_RANGES } from '../config/commandRanges';
import type { HeatPumpSystem, CommandStatus } from '../types/heatpump';

type ConfirmDialog = { title: string; message: string; onConfirm: () => void };

/**
 * View hook for HeatPumpCommandPanel: owns the setpoint + heating-curve write flow —
 * validation feedback, the mock/live decision, the confirmation dialog and the
 * rate-limit cooldown — and calls heatPumpCommandService. Keeps the panel free of any
 * service import; the service's own range guard is unchanged (#138). Behaviour and all
 * Dutch copy are moved verbatim.
 */
export const useHeatPumpCommand = (heatPump: HeatPumpSystem) => {
  // Reactive data-source mode (shared hook) — mock simulates, live confirms.
  const { dataSource } = useDataSource();
  const isMock = dataSource === 'mock';

  const [confirm, setConfirm] = useState<ConfirmDialog | null>(null);

  // ── Temperature setpoint state ───────────────────────────────────
  const currentSetpoint = heatPump.measurements.find((m) => m.property === 'temperatureSetpoint');
  const [setpointValue, setSetpointValue] = useState(currentSetpoint ? String(currentSetpoint.value) : '');
  const [setpointStatus, setSetpointStatus] = useState<CommandStatus>('idle');
  const [setpointError, setSetpointError] = useState<string | null>(null);
  const [setpointMock, setSetpointMock] = useState(false);

  // ── Heating curve state ──────────────────────────────────────────
  const currentCurve = heatPump.heatingCurve;
  const [curveBase, setCurveBase] = useState(currentCurve ? String(currentCurve.baseValue) : '');
  const [curveSlope, setCurveSlope] = useState(currentCurve ? String(currentCurve.slopeValue) : '');
  const [curveStatus, setCurveStatus] = useState<CommandStatus>('idle');
  const [curveError, setCurveError] = useState<string | null>(null);
  const [curveMock, setCurveMock] = useState(false);

  // ── Rate-limit cooldown (shared across both forms, per-pump) ─────
  const [rateLimitCooldown, setRateLimitCooldown] = useState(0);
  useEffect(() => {
    if (rateLimitCooldown <= 0) return;
    const timer = setTimeout(() => setRateLimitCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [rateLimitCooldown]);

  // ── Sync incoming props ──────────────────────────────────────────
  useEffect(() => {
    if (currentSetpoint) {
      setSetpointValue(String(currentSetpoint.value));
    }
    if (currentCurve) {
      setCurveBase(String(currentCurve.baseValue));
      setCurveSlope(String(currentCurve.slopeValue));
    }
  }, [heatPump, currentSetpoint, currentCurve]);

  // ── Setpoint ─────────────────────────────────────────────────────
  const handleSetpointChange = (value: string): void => {
    setSetpointValue(value);
    setSetpointStatus('idle');
    setSetpointError(null);
  };

  const submitSetpoint = async (value: number, mock: boolean): Promise<void> => {
    setSetpointStatus('pending');
    setSetpointError(null);
    try {
      await setTemperatureSetpoint({ heatPumpId: heatPump.id, value });
      setSetpointMock(mock);
      setSetpointStatus('success');
    } catch (err) {
      setSetpointStatus('error');
      if (err instanceof RateLimitError) {
        setRateLimitCooldown(30);
        setSetpointError(
          'Rate limit bereikt — Triple Solar server is tijdelijk bezet. ' +
          'Knop wordt automatisch opnieuw ingeschakeld.'
        );
      } else {
        setSetpointError(getErrorMessage(err));
      }
    }
  };

  const handleSetpointSubmit = (): void => {
    const parsed = parseFloat(setpointValue);
    if (!Number.isFinite(parsed)) {
      setSetpointError('Voer een geldig getal in.');
      return;
    }
    if (parsed < COMMAND_RANGES.setpoint.min || parsed > COMMAND_RANGES.setpoint.max) {
      setSetpointError('Setpoint moet tussen 10°C en 30°C liggen.');
      return;
    }
    setSetpointError(null);

    if (isMock) {
      void submitSetpoint(parsed, true);
      return;
    }
    setConfirm({
      title: 'Setpoint instellen',
      message:
        `Je staat op het punt om warmtepomp ${heatPump.id} in te stellen op ` +
        `${parsed} °C. Deze wijziging wordt direct actief op de warmtepomp. ` +
        `Weet je het zeker?`,
      onConfirm: () => {
        setConfirm(null);
        void submitSetpoint(parsed, false);
      },
    });
  };

  // ── Heating curve ────────────────────────────────────────────────
  const handleCurveBaseChange = (value: string): void => {
    setCurveBase(value);
    setCurveStatus('idle');
    setCurveError(null);
  };

  const handleCurveSlopeChange = (value: string): void => {
    setCurveSlope(value);
    setCurveStatus('idle');
    setCurveError(null);
  };

  const submitCurve = async (base: number, slope: number, mock: boolean): Promise<void> => {
    setCurveStatus('pending');
    setCurveError(null);
    try {
      await setHeatingCurve({ heatPumpId: heatPump.id, baseValue: base, slopeValue: slope });
      setCurveMock(mock);
      setCurveStatus('success');
    } catch (err) {
      setCurveStatus('error');
      if (err instanceof RateLimitError) {
        setRateLimitCooldown(30);
        setCurveError(
          'Rate limit bereikt — Triple Solar server is tijdelijk bezet. ' +
          'Knop wordt automatisch opnieuw ingeschakeld.'
        );
      } else {
        setCurveError(getErrorMessage(err));
      }
    }
  };

  const handleCurveSubmit = (): void => {
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
    if (base < COMMAND_RANGES.curveBase.min || base > COMMAND_RANGES.curveBase.max) {
      setCurveError('Basiswaarde moet tussen 20°C en 60°C liggen (aanvoertemperatuur).');
      return;
    }
    if (slope < COMMAND_RANGES.curveSlope.min || slope > COMMAND_RANGES.curveSlope.max) {
      setCurveError('Hellingswaarde moet tussen −4,0 en −0,1 liggen (Hupie-conventie).');
      return;
    }
    setCurveError(null);

    if (isMock) {
      void submitCurve(base, slope, true);
      return;
    }
    setConfirm({
      title: 'Stooklijn instellen',
      message:
        `Je staat op het punt om de stooklijn van warmtepomp ${heatPump.id} in te ` +
        `stellen op basiswaarde ${base} °C en helling ${slope}. Deze wijziging wordt ` +
        `direct actief op de warmtepomp. Weet je het zeker?`,
      onConfirm: () => {
        setConfirm(null);
        void submitCurve(base, slope, false);
      },
    });
  };

  return {
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
  };
};
