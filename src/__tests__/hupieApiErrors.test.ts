import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock axios at the instance level — executeCommand calls
// hupieCommandAxios.post() on a custom instance, so we intercept there.
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

import {
  executeCommand,
  RateLimitError,
  ManufacturerServerError,
  setDataSource,
} from '../services/hupieApi';

describe('executeCommand — manufacturer server error detection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setDataSource('live');
  });

  it('throws RateLimitError when response contains Triple Solar rate limit message', async () => {
    mockPost.mockResolvedValueOnce({
      status: 200,
      data: 'No response from manufacturer server',
    });

    await expect(executeCommand({ command: 'setpoint', id: 'abc123', value: 20 }))
      .rejects.toThrow(RateLimitError);
  });

  it('RateLimitError has correct type and name', () => {
    const err = new RateLimitError('test');
    expect(err.type).toBe('rate_limit');
    expect(err.name).toBe('RateLimitError');
    expect(err).toBeInstanceOf(Error);
  });

  it('throws ManufacturerServerError for other manufacturer server errors', async () => {
    mockPost.mockResolvedValueOnce({
      status: 200,
      data: 'manufacturer server timeout',
    });

    await expect(executeCommand({ command: 'setpoint', id: 'abc123', value: 20 }))
      .rejects.toThrow(ManufacturerServerError);
  });

  it('does not throw for normal success responses', async () => {
    mockPost.mockResolvedValueOnce({
      status: 200,
      data: '',
    });

    await expect(executeCommand({ command: 'setpoint', id: 'abc123', value: 20 }))
      .resolves.not.toThrow();
  });

  it('ManufacturerServerError has correct type', () => {
    const err = new ManufacturerServerError('test');
    expect(err.type).toBe('manufacturer_server');
    expect(err.name).toBe('ManufacturerServerError');
  });
});
