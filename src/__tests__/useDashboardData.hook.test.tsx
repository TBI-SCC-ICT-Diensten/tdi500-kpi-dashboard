import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { DashboardProvider } from '../context/DashboardContext';
import type { HeatPumpSystem } from '../types/heatpump';

/**
 * CHARACTERIZATION tests for the useDashboardData hook (previously 0% — the existing
 * useDashboardData.test.ts only exercises the pure helpers, never renders the hook).
 *
 * Only the network boundary (hupieApi.fetchAllHeatPumpData / subscribeToDataSource) is
 * mocked; the real contingent-build + KPI aggregation run. fetchAllHeatPumpData is made
 * controllable so streaming, out-of-order (stale) responses and rejection can be driven.
 *
 * NOTE: this also locks the embedded kruisprofiel derivation (B/2 defaults, B2 fallback)
 * that PR-10 will later lift out of the hook — deliberately, so this is PR-10's net too.
 */

const hupie = vi.hoisted(() => {
  const calls: {
    onPump: (p: unknown) => void;
    resolve: (v: unknown) => void;
    reject: (e: unknown) => void;
  }[] = [];
  let dsCallback: (() => void) | null = null;
  return {
    calls,
    fetchAll: vi.fn(
      (onPump: (p: unknown) => void) =>
        new Promise((resolve, reject) => {
          calls.push({ onPump, resolve, reject });
        })
    ),
    subscribe: vi.fn((cb: () => void) => {
      dsCallback = cb;
      return () => {
        dsCallback = null;
      };
    }),
    fireDataSource: () => dsCallback?.(),
  };
});

vi.mock('../services/hupieApi', () => ({
  fetchAllHeatPumpData: hupie.fetchAll,
  subscribeToDataSource: hupie.subscribe,
}));

import useDashboardData from '../hooks/useDashboardData';

const hp = (id: string, status: HeatPumpSystem['status'] = 'active'): HeatPumpSystem => ({
  id,
  uri: `u/${id}`,
  status,
  measurements: [],
  errorCodes: [],
});

const wrapper =
  (url: string) =>
  ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[url]}>
      <DashboardProvider>{children}</DashboardProvider>
    </MemoryRouter>
  );

/** The i-th fetchAllHeatPumpData invocation (asserts it exists — tsc-safe). */
const call = (i: number) => {
  const c = hupie.calls[i];
  if (!c) throw new Error(`no fetchAllHeatPumpData call #${i}`);
  return c;
};

beforeEach(() => {
  hupie.calls.length = 0;
  hupie.fetchAll.mockClear();
  hupie.subscribe.mockClear();
});

describe('useDashboardData — loading + streaming', () => {
  it('starts loading with no pumps, then streams them in and clears loading on the first', async () => {
    const { result } = renderHook(() => useDashboardData(), { wrapper: wrapper('/') });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.heatPumps).toEqual([]);

    await act(async () => {
      call(0).onPump(hp('a'));
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.heatPumps.map((p) => p.id)).toEqual(['a']);

    await act(async () => {
      call(0).onPump(hp('b'));
      call(0).resolve([hp('a'), hp('b')]);
    });
    expect(result.current.heatPumps.map((p) => p.id)).toEqual(['a', 'b']);
  });

  it('de-duplicates pumps that stream in twice by id', async () => {
    const { result } = renderHook(() => useDashboardData(), { wrapper: wrapper('/') });
    await act(async () => {
      call(0).onPump(hp('a'));
      call(0).onPump(hp('a'));
    });
    expect(result.current.heatPumps.map((p) => p.id)).toEqual(['a']);
  });
});

describe('useDashboardData — stale-request guard', () => {
  it('ignores a callback from a superseded load and accepts the current one', async () => {
    const { result } = renderHook(() => useDashboardData(), { wrapper: wrapper('/') });

    // Start a second load; the first (call 0) becomes stale.
    await act(async () => {
      result.current.refetch();
    });
    expect(hupie.calls).toHaveLength(2);

    await act(async () => {
      call(0).onPump(hp('stale'));
    });
    expect(result.current.heatPumps).toEqual([]);

    await act(async () => {
      call(1).onPump(hp('fresh'));
    });
    expect(result.current.heatPumps.map((p) => p.id)).toEqual(['fresh']);

    await act(async () => {
      call(0).resolve([]);
      call(1).resolve([hp('fresh')]);
    });
  });
});

describe('useDashboardData — contingent build + KPI memo', () => {
  it('builds the default B2 contingent, auto-selects it, and aggregates 4 KPIs', async () => {
    const { result } = renderHook(() => useDashboardData(), { wrapper: wrapper('/') });
    await act(async () => {
      call(0).onPump(hp('a'));
      call(0).resolve([hp('a')]);
    });
    await waitFor(() => expect(result.current.selectedContingent).not.toBeNull());

    expect(result.current.contingents).toHaveLength(1);
    expect(result.current.selectedContingent?.id).toBe('contingent-B2');
    expect(result.current.selectedContingent?.kruisProfiel.code).toBe('B2');
    expect(result.current.kpis).toHaveLength(4);
  });
});

describe('useDashboardData — embedded kruisprofiel derivation (PR-10 will lift this out)', () => {
  it('derives the code from isolatie + aanvoer URL params', async () => {
    const { result } = renderHook(() => useDashboardData(), {
      wrapper: wrapper('/?isolatie=A&aanvoer=1'),
    });
    await act(async () => {
      call(0).onPump(hp('a'));
      call(0).resolve([hp('a')]);
    });
    await waitFor(() => expect(result.current.selectedContingent?.kruisProfiel.code).toBe('A1'));
  });

  it('falls back to B2 when the params form an invalid code', async () => {
    const { result } = renderHook(() => useDashboardData(), {
      wrapper: wrapper('/?isolatie=Z&aanvoer=9'),
    });
    await act(async () => {
      call(0).onPump(hp('a'));
      call(0).resolve([hp('a')]);
    });
    await waitFor(() => expect(result.current.selectedContingent?.kruisProfiel.code).toBe('B2'));
  });
});

describe('useDashboardData — error + data-source change', () => {
  it('surfaces a Dutch error message when the fetch rejects', async () => {
    const { result } = renderHook(() => useDashboardData(), { wrapper: wrapper('/') });
    await act(async () => {
      call(0).reject(new Error('boom'));
    });
    await waitFor(() => expect(result.current.error).toContain('Kon warmtepompdata niet ophalen'));
    expect(result.current.isLoading).toBe(false);
  });

  it('refetches when the data source changes', async () => {
    renderHook(() => useDashboardData(), { wrapper: wrapper('/') });
    expect(hupie.calls).toHaveLength(1);
    await act(async () => {
      hupie.fireDataSource();
    });
    expect(hupie.calls).toHaveLength(2);
  });
});
