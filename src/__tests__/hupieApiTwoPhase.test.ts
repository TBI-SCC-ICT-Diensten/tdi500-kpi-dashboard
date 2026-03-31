import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock axios at the instance level — executeSparqlQuery calls hupieAxios.post()
// internally, so we intercept there rather than at the exported function level.
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

vi.mock('../services/sparqlQueries', () => ({
  SPARQL_LIST_HEATPUMPS: 'MOCK_LIST_QUERY',
  SPARQL_HEATPUMP_DETAILS: (uri: string) => `MOCK_DETAILS_FOR_${uri}`,
  SPARQL_ALL_HEATPUMP_DATA: 'MOCK_ALL_QUERY',
}));

vi.mock('../services/dataMapper', () => ({
  mapSparqlToHeatPumps: vi.fn((response) =>
    response.results.bindings.map((_: unknown, i: number) => ({
      id: `mock-hp-${i}`,
      uri: `https://example.com/hp/${i}`,
      status: 'active' as const,
      measurements: [],
      errorCodes: [],
    }))
  ),
}));

import { fetchAllHeatPumpData, fetchHeatPumpDetails } from '../services/hupieApi';

// Helpers — wrapped in { data: ... } because executeSparqlQuery returns response.data
const makeListResponse = (uris: string[]) => ({
  data: {
    head: { vars: ['heatpump'] },
    results: {
      bindings: uris.map((uri) => ({
        heatpump: { type: 'uri' as const, value: uri },
      })),
    },
  },
});

const makeDetailResponse = (count = 1) => ({
  data: {
    head: { vars: ['heatpump'] },
    results: {
      bindings: Array.from({ length: count }, (_, i) => ({
        heatpump: { type: 'uri' as const, value: `https://example.com/hp/${i}` },
      })),
    },
  },
});

describe('fetchHeatPumpDetails', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls executeSparqlQuery with a string query', async () => {
    mockPost.mockResolvedValueOnce(makeDetailResponse(1));
    await fetchHeatPumpDetails('https://example.com/hp/abc');
    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(typeof mockPost.mock.calls[0]?.[1]).toBe('string');
  });
});

describe('fetchAllHeatPumpData', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns empty array when list query returns no URIs', async () => {
    mockPost.mockResolvedValueOnce(makeListResponse([]));
    const result = await fetchAllHeatPumpData();
    expect(result).toEqual([]);
  });

  it('fires one detail query per URI from the list', async () => {
    const uris = ['https://example.com/hp/1', 'https://example.com/hp/2'];
    mockPost
      .mockResolvedValueOnce(makeListResponse(uris))
      .mockResolvedValueOnce(makeDetailResponse(1))
      .mockResolvedValueOnce(makeDetailResponse(1));

    await fetchAllHeatPumpData();
    // 1 list query + 2 detail queries = 3 total
    expect(mockPost).toHaveBeenCalledTimes(3);
  });

  it('returns combined heat pumps from all detail responses', async () => {
    const uris = ['https://example.com/hp/1', 'https://example.com/hp/2'];
    mockPost
      .mockResolvedValueOnce(makeListResponse(uris))
      .mockResolvedValueOnce(makeDetailResponse(1))
      .mockResolvedValueOnce(makeDetailResponse(1));

    const result = await fetchAllHeatPumpData();
    expect(result).toHaveLength(2);
  });

  it('skips failed detail queries and returns the rest', async () => {
    const uris = ['https://example.com/hp/1', 'https://example.com/hp/2'];
    mockPost
      .mockResolvedValueOnce(makeListResponse(uris))
      .mockRejectedValueOnce(new Error('timeout'))
      .mockResolvedValueOnce(makeDetailResponse(1));

    const result = await fetchAllHeatPumpData();
    // hp/1 failed, hp/2 succeeded — must not crash, must return 1 result
    expect(result).toHaveLength(1);
  });
});
