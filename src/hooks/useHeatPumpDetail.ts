import { estimateExpectedCop } from '../services/weatherService';
import { bepaalOplostermijn, type Oplostermijn } from '../utils/oplostermijn';
import type { HeatPumpSystem, SupplyTemperatureClass, ErrorCode } from '../types/heatpump';

export interface ErrorCodeWithTermijn {
  errorCode: ErrorCode;
  termijn: Oplostermijn;
}

/**
 * View hook for HeatPumpDetailCard: derives the expected COP + the actual-vs-expected
 * COP status, and precomputes the oplostermijn per error code. Moves the COP-delta
 * scoring and the resolution-deadline calls out of the component's render.
 *
 * COP-delta thresholds (−0.3 good, −0.8 warning) preserved verbatim from the component.
 */
export const useHeatPumpDetail = (
  heatPump: HeatPumpSystem,
  outdoorTempCelsius?: number,
  supplyTemperatureClass?: SupplyTemperatureClass
) => {
  const actualCop =
    heatPump.measurements.find((m) => m.property === 'cop')?.value ?? null;

  const expectedCop =
    outdoorTempCelsius !== undefined && supplyTemperatureClass
      ? estimateExpectedCop(outdoorTempCelsius, supplyTemperatureClass)
      : null;

  const copDelta =
    actualCop !== null && expectedCop !== null ? actualCop - expectedCop : null;

  const copStatus: 'good' | 'warning' | 'critical' | null =
    copDelta === null
      ? null
      : copDelta >= -0.3
      ? 'good'
      : copDelta >= -0.8
      ? 'warning'
      : 'critical';

  const errorCodes: ErrorCodeWithTermijn[] = heatPump.errorCodes.map((errorCode) => ({
    errorCode,
    termijn: bepaalOplostermijn(errorCode.severity, errorCode.detectedAt),
  }));

  return { actualCop, expectedCop, copDelta, copStatus, errorCodes };
};
