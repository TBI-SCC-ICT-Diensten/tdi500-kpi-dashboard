import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { HeatPumpSystem, Contingent, KeyPerformanceIndicator, KruisProfielCode } from '../types/heatpump';
import { isValidKruisProfielCode } from '../types/heatpump';
import { fetchAllHeatPumpData, subscribeToDataSource } from '../services/hupieApi';
import { createContingent } from '../services/contingentService';
import { aggregateKpisForContingent } from '../services/kpiAggregator';
import { SCORING_THRESHOLDS_BY_PROFIEL } from '../services/scoringConfig';
import { useDashboardContext } from '../context/DashboardContext';

export interface DashboardData {
  heatPumps: HeatPumpSystem[];
  contingents: Contingent[];
  selectedContingent: Contingent | null;
  kpis: KeyPerformanceIndicator[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const useDashboardData = (): DashboardData => {
  const { state, setSelectedContingentId } = useDashboardContext();
  const { selectedContingentId } = state;

  const [searchParams] = useSearchParams();
  const isolatie = searchParams.get('isolatie');
  const aanvoer = searchParams.get('aanvoer');

  const [heatPumps, setHeatPumps] = useState<HeatPumpSystem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Bump on each load() call so stale in-flight responses are dropped.
  const requestIdRef = useRef(0);

  const load = useCallback(async (): Promise<void> => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);
    setHeatPumps([]);

    try {
      // Stream pumps into state as each one resolves.
      // setIsLoading stays true until the first pump arrives,
      // then turns false so the UI renders partial results immediately.
      let firstPumpReceived = false;

      await fetchAllHeatPumpData((pump) => {
        if (requestId !== requestIdRef.current) return; // stale
        if (!firstPumpReceived) {
          firstPumpReceived = true;
          setIsLoading(false);
        }
        setHeatPumps((prev) => {
          // Avoid duplicates if pump already in state
          if (prev.some((p) => p.id === pump.id)) return prev;
          return [...prev, pump];
        });
      });

      if (requestId !== requestIdRef.current) return;
      if (!firstPumpReceived) {
        // No pumps loaded at all
        setIsLoading(false);
      }
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      const message = err instanceof Error ? err.message : String(err);
      console.error('[useDashboardData] Failed to load heat pump data:', message);
      setError(`Kon warmtepompdata niet ophalen: ${message}`);
      setIsLoading(false);
    }
  }, []);

  // Initial load on mount.
  useEffect(() => {
    load();
    return () => {
      // Bump so any in-flight callback is treated as stale.
      requestIdRef.current++;
    };
  }, [load]);

  // Auto-refetch when the data source (live/mock) changes.
  useEffect(() => {
    return subscribeToDataSource(() => {
      load();
    });
  }, [load]);

  // Build contingents from heat pump data.
  const contingents = useMemo((): Contingent[] => {
    if (heatPumps.length === 0) return [];

    // Defaults to 'B' and '2' if missing/null
    const isolatieniveau = isolatie || 'B';
    const aanvoertemp = aanvoer || '2';

    const candidateCode = `${isolatieniveau}${aanvoertemp}`;
    const kruisProfielCode: KruisProfielCode = isValidKruisProfielCode(candidateCode)
      ? candidateCode
      : 'B2'; // fallback to default profiel if URL params are invalid
    const contingentId = `contingent-${kruisProfielCode}`;

    // Filter heat pumps properly under this specific Kruisprofiel code.
    // Pumps without an assigned code are included (API hasn't mapped yet).
    const filteredPumps = heatPumps.filter((hp) => {
      if (hp.kruisProfielCode) {
        return hp.kruisProfielCode === kruisProfielCode;
      }
      return true;
    });

    const activeContingent = createContingent(
      contingentId,
      `Contingent ${kruisProfielCode}`,
      kruisProfielCode,
      filteredPumps
    );

    return [activeContingent];
  }, [heatPumps, isolatie, aanvoer]);

  // Auto-select the first contingent when contingents load or if the current isn't found
  useEffect(() => {
    if (contingents.length > 0) {
      const found = contingents.some(c => c.id === selectedContingentId);
      if (!found) {
        setSelectedContingentId(contingents[0]!.id);
      }
    }
  }, [contingents, selectedContingentId, setSelectedContingentId]);

  const selectedContingent = useMemo(
    () => contingents.find((c) => c.id === selectedContingentId) ?? null,
    [contingents, selectedContingentId]
  );

  const kpis = useMemo((): KeyPerformanceIndicator[] => {
    if (!selectedContingent) return [];
    const thresholds = SCORING_THRESHOLDS_BY_PROFIEL[selectedContingent.kruisProfiel.code];
    return aggregateKpisForContingent(selectedContingent.heatPumps, thresholds);
  }, [selectedContingent]);

  return {
    heatPumps,
    contingents,
    selectedContingent,
    kpis,
    isLoading,
    error,
    refetch: load,
  };
};

export default useDashboardData;
