import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockExecuteSparqlUpdate = vi.hoisted(() => vi.fn());

vi.mock('../services/hupieApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/hupieApi')>();
  return { ...actual, executeSparqlUpdate: mockExecuteSparqlUpdate };
});

import {
  setHeatingCurve,
  setTemperatureSetpoint,
} from '../services/heatPumpCommandService';

describe('setHeatingCurve', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls executeSparqlUpdate once with valid inputs', async () => {
    mockExecuteSparqlUpdate.mockResolvedValueOnce(undefined);
    await setHeatingCurve({ heatPumpId: 'abc123', baseValue: 36.0, slopeValue: -0.5 });
    expect(mockExecuteSparqlUpdate).toHaveBeenCalledTimes(1);
  });

  it('throws and does not call executeSparqlUpdate when id is empty', async () => {
    await expect(
      setHeatingCurve({ heatPumpId: '', baseValue: 36.0, slopeValue: -0.5 })
    ).rejects.toThrow('heatPumpId must be a non-empty string');
    expect(mockExecuteSparqlUpdate).not.toHaveBeenCalled();
  });

  it('throws and does not call executeSparqlUpdate when baseValue is NaN', async () => {
    await expect(
      setHeatingCurve({ heatPumpId: 'abc123', baseValue: NaN, slopeValue: -0.5 })
    ).rejects.toThrow('baseValue must be a finite number');
    expect(mockExecuteSparqlUpdate).not.toHaveBeenCalled();
  });

  it('throws and does not call executeSparqlUpdate when slopeValue is Infinity', async () => {
    await expect(
      setHeatingCurve({ heatPumpId: 'abc123', baseValue: 36.0, slopeValue: Infinity })
    ).rejects.toThrow('slopeValue must be a finite number');
    expect(mockExecuteSparqlUpdate).not.toHaveBeenCalled();
  });

  it('throws and does not call executeSparqlUpdate when baseValue is out of range', async () => {
    await expect(
      setHeatingCurve({ heatPumpId: 'abc123', baseValue: 10, slopeValue: -0.5 })
    ).rejects.toThrow('baseValue must be between 20 and 60');
    expect(mockExecuteSparqlUpdate).not.toHaveBeenCalled();
  });

  it('throws and does not call executeSparqlUpdate when slopeValue is out of range', async () => {
    await expect(
      setHeatingCurve({ heatPumpId: 'abc123', baseValue: 40, slopeValue: -5 })
    ).rejects.toThrow('slopeValue must be between -4 and -0.1');
    expect(mockExecuteSparqlUpdate).not.toHaveBeenCalled();
  });
});

describe('setTemperatureSetpoint', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls executeSparqlUpdate once with valid inputs', async () => {
    mockExecuteSparqlUpdate.mockResolvedValueOnce(undefined);
    await setTemperatureSetpoint({ heatPumpId: 'abc123', value: 20.5 });
    expect(mockExecuteSparqlUpdate).toHaveBeenCalledTimes(1);
  });

  it('throws and does not call executeSparqlUpdate when id is empty string', async () => {
    await expect(
      setTemperatureSetpoint({ heatPumpId: '', value: 20.5 })
    ).rejects.toThrow('heatPumpId must be a non-empty string');
    expect(mockExecuteSparqlUpdate).not.toHaveBeenCalled();
  });

  it('throws and does not call executeSparqlUpdate when value is NaN', async () => {
    await expect(
      setTemperatureSetpoint({ heatPumpId: 'abc123', value: NaN })
    ).rejects.toThrow('value must be a finite number');
    expect(mockExecuteSparqlUpdate).not.toHaveBeenCalled();
  });

  it('throws and does not call executeSparqlUpdate when value is out of range', async () => {
    await expect(
      setTemperatureSetpoint({ heatPumpId: 'abc123', value: 40 })
    ).rejects.toThrow('value must be between 10 and 30');
    expect(mockExecuteSparqlUpdate).not.toHaveBeenCalled();
  });
});
