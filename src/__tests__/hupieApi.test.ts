import { vi, describe, it, expect } from 'vitest';
import * as hupieApi from '../services/hupieApi';
import { config } from '../config';

vi.mock('axios', () => {
  return {
    default: {
      create: vi.fn(() => ({
        post: vi.fn(),
        get: vi.fn(),
        defaults: { params: {} },
      })),
      isAxiosError: vi.fn(),
    },
  };
});

describe('Hupie API Config', () => {
  it('should export an expected config shape', () => {
    expect(config).toHaveProperty('api');
    expect(config.api).toHaveProperty('baseUrl');
    expect(config.api).toHaveProperty('timeout');
    // VV-26: the client-side API key is gone — the server-side proxy holds it.
    expect(config.api).not.toHaveProperty('apiKey');
  });
});

describe('Hupie API Service', () => {
  it('should export executeSparqlQuery as a function', () => {
    expect(typeof hupieApi.executeSparqlQuery).toBe('function');
  });
});