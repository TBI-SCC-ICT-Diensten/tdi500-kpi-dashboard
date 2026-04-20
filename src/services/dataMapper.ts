import type { SparqlResponse, SparqlBinding } from '../types/api';
import type { HeatPumpSystem, Measurement, ErrorCode, HeatingCurve, HeatPumpStatus, MeasurementProperty, DeviceSpecs } from '../types/heatpump';
import {
  resolveUnit,
  parseNumericValue,
  parseTimestamp,
  extractIdFromUri,
  resolveConnectionState,
  extractStringValue,
} from '../utils/ontologyUtils';

export const mapSparqlToHeatPumps = (response: SparqlResponse): HeatPumpSystem[] => {
  const bindings = response.results.bindings;
  if (bindings.length === 0) return [];

  const grouped = groupBindingsByHeatPump(bindings);
  const heatPumps: HeatPumpSystem[] = [];

  for (const [uri, hpBindings] of grouped) {
    const firstBinding = hpBindings[0];
    if (!firstBinding) continue;

    const measurements = extractMeasurements(hpBindings);
    const errorCodes = extractErrorCodes(hpBindings);
    const heatingCurve = extractHeatingCurve(hpBindings);
    const deviceSpecs = extractDeviceSpecs(hpBindings);

    const internetValue = extractStringValue(firstBinding['internetConnectionStateValue']);
    const serverValue = extractStringValue(firstBinding['connectionstateServer']);
    const internetConnection = resolveConnectionState(internetValue);
    const serverConnection = resolveConnectionState(serverValue);

    heatPumps.push({
      id: extractIdFromUri(uri),
      uri,
      building: extractStringValue(firstBinding['building']) || undefined,
      room: extractStringValue(firstBinding['room']) || undefined,
      status: determineStatus(errorCodes, internetValue, serverValue),
      measurements,
      errorCodes,
      internetConnection,
      serverConnection,
      heatingCurve,
      deviceSpecs,
    });
  }

  return heatPumps;
};

export const groupBindingsByHeatPump = (bindings: SparqlBinding[]): Map<string, SparqlBinding[]> => {
  const grouped = new Map<string, SparqlBinding[]>();

  for (const binding of bindings) {
    const hpValue = binding['heatpump'];
    if (!hpValue?.value) continue;

    const uri = hpValue.value;
    const existing = grouped.get(uri);
    if (existing) {
      existing.push(binding);
    } else {
      grouped.set(uri, [binding]);
    }
  }

  return grouped;
};

export const extractMeasurements = (bindings: SparqlBinding[]): Measurement[] => {
  const measurements: Measurement[] = [];
  const seen = new Set<MeasurementProperty>();

  for (const binding of bindings) {
    const valueField = binding['value'];
    const unitField = binding['unit'];
    if (!valueField?.value) continue;

    const property = determineMeasurementProperty(binding);
    if (property === 'unknown' || seen.has(property)) continue;
    seen.add(property);

    const rawUnit = extractStringValue(unitField);

    measurements.push({
      property,
      value: parseNumericValue(valueField),
      unit: rawUnit ? resolveUnit(rawUnit) : 'unknown unit',
      rawUnit,
      timestamp: parseTimestamp(binding['startDateTime']),
    });
  }

  return measurements;
};

const determineMeasurementProperty = (binding: SparqlBinding): MeasurementProperty => {
  if (binding['currentTemperature']?.value) {
    if (binding['outside']?.value) return 'outsideTemperature';
    return 'roomTemperature';
  }
  if (binding['temperatureSetpoint']?.value) return 'temperatureSetpoint';
  if (binding['flowPressure']?.value) return 'waterPressure';
  if (binding['cop']?.value) return 'cop';
  if (binding['energyUse']?.value) return 'energyUsage';
  return 'unknown';
};

export const extractErrorCodes = (bindings: SparqlBinding[]): ErrorCode[] => {
  const errorCodes: ErrorCode[] = [];
  const seen = new Set<string>();

  for (const binding of bindings) {
    const code = extractStringValue(binding['errorCodeValue']);
    if (!code || seen.has(code)) continue;
    seen.add(code);

    errorCodes.push({
      code,
      message: extractStringValue(binding['errorCodeMessage']),
      severity: extractStringValue(binding['errorCodeSeverity']),
    });
  }

  return errorCodes;
};

export const extractHeatingCurve = (bindings: SparqlBinding[]): HeatingCurve | undefined => {
  for (const binding of bindings) {
    if (!binding['baseValue']?.value || !binding['slopeValue']?.value) continue;

    return {
      baseValue: parseNumericValue(binding['baseValue']),
      baseUnit: resolveUnit(extractStringValue(binding['baseUnit'])),
      slopeValue: parseNumericValue(binding['slopeValue']),
      slopeUnit: resolveUnit(extractStringValue(binding['slopeUnit'])),
    };
  }

  return undefined;
};

export const extractDeviceSpecs = (bindings: SparqlBinding[]): DeviceSpecs => {
  // Device spec fields are static per pump — take first non-null value found
  const spec: DeviceSpecs = {};
  for (const binding of bindings) {
    if (!spec.manufacturer && binding['manufacturer']?.value) {
      spec.manufacturer = extractStringValue(binding['manufacturer']);
    }
    if (!spec.model && binding['model']?.value) {
      spec.model = extractStringValue(binding['model']);
    }
    if (!spec.serialNumber && binding['serialNumber']?.value) {
      spec.serialNumber = extractStringValue(binding['serialNumber']);
    }
    if (!spec.firmwareVersion && binding['firmwareVersion']?.value) {
      spec.firmwareVersion = extractStringValue(binding['firmwareVersion']);
    }
    if (!spec.yearOfManufacture && binding['yearOfManufacture']?.value) {
      const year = parseInt(
        extractStringValue(binding['yearOfManufacture']), 10
      );
      if (Number.isFinite(year)) spec.yearOfManufacture = year;
    }
  }
  return spec;
};

export const determineStatus = (
  errorCodes: ErrorCode[],
  internetConnection: string,
  serverConnection: string
): HeatPumpStatus => {
  const isDisconnected =
    resolveConnectionState(internetConnection) === 'disconnected' ||
    resolveConnectionState(serverConnection) === 'disconnected';

  if (isDisconnected) return 'offline';

  const hasErrors = errorCodes.some(
    (e) => e.severity.toLowerCase() === 'critical' || e.severity.toLowerCase() === 'error'
  );
  if (hasErrors) return 'error';

  const hasWarnings = errorCodes.some((e) => e.severity.toLowerCase() === 'warning');
  if (hasWarnings) return 'warning';

  return 'active';
};
