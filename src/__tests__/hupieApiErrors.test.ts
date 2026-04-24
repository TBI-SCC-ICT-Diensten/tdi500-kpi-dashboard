import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock axios at the instance level — executeSparqlUpdate calls
// hupieUpdateAxios.post() on a custom instance, so we intercept there.
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
  executeSparqlUpdate,
  RateLimitError,
  ManufacturerServerError,
  setDataSource,
} from '../services/hupieApi';

describe('executeSparqlUpdate — manufacturer server error detection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setDataSource('live');
  });

  it('throws RateLimitError when response contains Triple Solar rate limit message', async () => {
    mockPost.mockResolvedValueOnce({
      status: 200,
      data: 'No response from manufacturer server',
    });

    await expect(executeSparqlUpdate('INSERT { } WHERE { }'))
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

    await expect(executeSparqlUpdate('INSERT { } WHERE { }'))
      .rejects.toThrow(ManufacturerServerError);
  });

  it('does not throw for normal success responses', async () => {
    mockPost.mockResolvedValueOnce({
      status: 200,
      data: '',
    });

    await expect(executeSparqlUpdate('INSERT { } WHERE { }'))
      .resolves.not.toThrow();
  });

  it('ManufacturerServerError has correct type', () => {
    const err = new ManufacturerServerError('test');
    expect(err.type).toBe('manufacturer_server');
    expect(err.name).toBe('ManufacturerServerError');
  });
});
