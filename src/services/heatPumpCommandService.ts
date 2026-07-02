import { executeCommand } from './hupieApi';
import type { HeatingCurveCommand, TemperatureSetpointCommand } from '../types/heatpump';
import { COMMAND_RANGES } from '../config/commandRanges';

/**
 * Validates that a heat pump ID is a non-empty string.
 * Throws a descriptive error if invalid — callers must not send bad data.
 */
const validateId = (id: string): void => {
  if (!id || id.trim().length === 0) {
    throw new Error('[heatPumpCommandService] heatPumpId must be a non-empty string');
  }
};

/**
 * Validates that a numeric value is a finite number.
 * Throws a descriptive error if invalid.
 */
const validateNumeric = (value: number, fieldName: string): void => {
  if (!Number.isFinite(value)) {
    throw new Error(
      `[heatPumpCommandService] ${fieldName} must be a finite number, got: ${value}`
    );
  }
};

/**
 * Validates that a numeric value lies within an inclusive [min, max] range.
 * Range enforcement lives here (not only in the UI) so the executor receives
 * an authoritative, validated value — no caller can push an unsafe value to a
 * live heat pump by bypassing the form. Mirrors the UI ranges in
 * HeatPumpCommandPanel (defense in depth).
 */
const validateRange = (
  value: number,
  min: number,
  max: number,
  fieldName: string
): void => {
  if (value < min || value > max) {
    throw new Error(
      `[heatPumpCommandService] ${fieldName} must be between ${min} and ${max}, got: ${value}`
    );
  }
};

/**
 * Sets the heating curve of a specific heat pump via SPARQL UPDATE.
 *
 * @param command - HeatingCurveCommand with heatPumpId, baseValue, slopeValue
 * @throws Error if inputs are invalid or the API call fails
 *
 * Source: Hupie API docs — UPDATE/SET: Heating Curve
 */
export const setHeatingCurve = async (command: HeatingCurveCommand): Promise<void> => {
  validateId(command.heatPumpId);
  validateNumeric(command.baseValue, 'baseValue');
  validateNumeric(command.slopeValue, 'slopeValue');
  validateRange(command.baseValue, COMMAND_RANGES.curveBase.min, COMMAND_RANGES.curveBase.max, 'baseValue');
  validateRange(command.slopeValue, COMMAND_RANGES.curveSlope.min, COMMAND_RANGES.curveSlope.max, 'slopeValue');

  console.log(`[TDI500] setHeatingCurve: sending command for heat pump ${command.heatPumpId}`);
  await executeCommand({
    command: 'heating-curve',
    id: command.heatPumpId,
    base: command.baseValue,
    slope: command.slopeValue,
  });
  console.log(`[TDI500] setHeatingCurve: success for heat pump ${command.heatPumpId}`);
};

/**
 * Sets the temperature setpoint of a specific heat pump via SPARQL UPDATE.
 *
 * @param command - TemperatureSetpointCommand with heatPumpId and value
 * @throws Error if inputs are invalid or the API call fails
 *
 * Source: Hupie API docs — UPDATE/SET: Temperature Setpoint
 */
export const setTemperatureSetpoint = async (
  command: TemperatureSetpointCommand
): Promise<void> => {
  validateId(command.heatPumpId);
  validateNumeric(command.value, 'value');
  validateRange(command.value, COMMAND_RANGES.setpoint.min, COMMAND_RANGES.setpoint.max, 'value');

  console.log(
    `[TDI500] setTemperatureSetpoint: sending command for heat pump ${command.heatPumpId}`
  );
  await executeCommand({ command: 'setpoint', id: command.heatPumpId, value: command.value });
  console.log(
    `[TDI500] setTemperatureSetpoint: success for heat pump ${command.heatPumpId}`
  );
};
