import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Write-guard integration tests — the SET path end to end:
 *   service (range validation) → executeCommand (mock guard) → axios.
 *
 * axios is mocked at the instance level (same harness as hupieApiErrors.test.ts)
 * so we can assert exactly whether a network POST happens. The service and the
 * executor are the REAL implementations — this is what makes "mock mode never
 * touches the network" a real guarantee rather than a mocked one.
 */

const mockPost = vi.hoisted(() => vi.fn());

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>();
  return {
    ...actual,
    default: {
      ...actual.default,
      create: () => ({
        post: mockPost,
        get: vi.fn(),
        defaults: { params: {} },
      }),
      isAxiosError: actual.default.isAxiosError,
    },
  };
});

import { setDataSource } from '../services/hupieApi';
import {
  setTemperatureSetpoint,
  setHeatingCurve,
} from '../services/heatPumpCommandService';

describe('write guard — mock mode simulates with ZERO network', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPost.mockResolvedValue({ status: 200, data: '' });
    setDataSource('mock');
  });

  it('setpoint SET in mock mode makes NO network call and resolves', async () => {
    await expect(
      setTemperatureSetpoint({ heatPumpId: 'abc123', value: 20.5 })
    ).resolves.toBeUndefined();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('heating-curve SET in mock mode makes NO network call and resolves', async () => {
    await expect(
      setHeatingCurve({ heatPumpId: 'abc123', baseValue: 40, slopeValue: -0.6 })
    ).resolves.toBeUndefined();
    expect(mockPost).not.toHaveBeenCalled();
  });
});

describe('write guard — live mode validates, then posts the structured command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPost.mockResolvedValue({ status: 200, data: '' });
    setDataSource('live');
  });

  it('in-range setpoint POSTs the structured command (no client-side SPARQL)', async () => {
    await setTemperatureSetpoint({ heatPumpId: 'abc123', value: 20.5 });
    expect(mockPost).toHaveBeenCalledTimes(1);
    const [url, payload] = mockPost.mock.calls[0] as [string, unknown];
    expect(url).toBe(''); // baseURL is '/api/hupie'
    expect(payload).toEqual({ command: 'setpoint', id: 'abc123', value: 20.5 });
  });

  it('in-range heating curve POSTs the structured command (no client-side SPARQL)', async () => {
    await setHeatingCurve({ heatPumpId: 'abc123', baseValue: 40, slopeValue: -0.6 });
    expect(mockPost).toHaveBeenCalledTimes(1);
    const [, payload] = mockPost.mock.calls[0] as [string, unknown];
    expect(payload).toEqual({ command: 'heating-curve', id: 'abc123', base: 40, slope: -0.6 });
  });

  it('out-of-range setpoint is rejected BEFORE any network call', async () => {
    await expect(
      setTemperatureSetpoint({ heatPumpId: 'abc123', value: 5 })
    ).rejects.toThrow(/between 10 and 30/);
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('out-of-range curve slope is rejected BEFORE any network call', async () => {
    await expect(
      setHeatingCurve({ heatPumpId: 'abc123', baseValue: 40, slopeValue: -5 })
    ).rejects.toThrow(/between/);
    expect(mockPost).not.toHaveBeenCalled();
  });
});
