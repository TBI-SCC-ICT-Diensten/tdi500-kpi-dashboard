import { useState, useEffect, useMemo } from 'react';
import type { HeatPumpSystem, Contingent, KeyPerformanceIndicator } from '../types/heatpump';
import { fetchAllHeatPumpData } from '../services/hupieApi';
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
}

const useDashboardData = (): DashboardData => {
  const { state, setSelectedContingentId } = useDashboardContext();
  const { selectedContingentId } = state;

  const [heatPumps, setHeatPumps] = useState<HeatPumpSystem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const pumps = await fetchAllHeatPumpData();
        if (cancelled) return;
        setHeatPumps(pumps);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : String(err);
        console.error('[useDashboardData] Failed to load heat pump data:', message);
        setError(`Kon warmtepompdata niet ophalen: ${message}`);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadData();
    return () => { cancelled = true; };
  }, []);

  // Build contingents from heat pump data.
  // The Hupie API does not expose kruisprofiel per heat pump.
  // All heat pumps are assigned to one default contingent (B2) until
  // the API provides per-pump kruisprofiel assignments.
  const contingents = useMemo((): Contingent[] => {
    if (heatPumps.length === 0) return [];

    const defaultContingent = createContingent(
      'default-b2',
      'Alle warmtepompen',
      'B2',
      heatPumps
    );

    return [defaultContingent];
  }, [heatPumps]);

  // Auto-select the first contingent when contingents load
  useEffect(() => {
    if (contingents.length > 0 && selectedContingentId === null) {
      const first = contingents[0];
      if (first) setSelectedContingentId(first.id);
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
  };
};

export default useDashboardData;
