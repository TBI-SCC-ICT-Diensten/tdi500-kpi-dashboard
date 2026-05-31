import type { HeatPumpSystem, KeyPerformanceIndicator, KpiStatus } from '../types/heatpump';
import type { ScoringThresholds } from './scoringConfig';

/**
 * Calculates the average COP across all heat pumps in a contingent.
 * COP (Coefficient of Performance) measures heating efficiency.
 * A heat pump with COP 3.0 delivers 3 kWh of heat per 1 kWh of electricity used.
 */
export const calculateCopKpi = (
  heatPumps: HeatPumpSystem[],
  thresholds: ScoringThresholds
): KeyPerformanceIndicator => {
  const copValues = heatPumps
    .flatMap((hp) => hp.measurements)
    .filter((m) => m.property === 'cop')
    .map((m) => m.value);

  const averageCop =
    copValues.length > 0
      ? copValues.reduce((sum, v) => sum + v, 0) / copValues.length
      : 0;

  const status: KpiStatus =
    averageCop === 0              ? 'warning'  :
    averageCop >= thresholds.minCop ? 'good'    :
    averageCop >= thresholds.minCop * 0.85 ? 'warning' :
                                    'critical';

  return {
    id: 'cop',
    name: 'Gemiddelde COP',
    value: Math.round(averageCop * 100) / 100,
    unit: '',
    category: 'efficiency',
    status,
    description: `Minimale COP voor dit profiel: ${thresholds.minCop}`,
  };
};

/**
 * Counts heat pumps by connection status.
 * Returns ratio of online pumps as the KPI value (0–100 as a percentage).
 */
export const calculateConnectivityKpi = (
  heatPumps: HeatPumpSystem[]
): KeyPerformanceIndicator => {
  if (heatPumps.length === 0) {
    return {
      id: 'connectivity',
      name: 'Connectiviteit',
      value: 0,
      unit: '%',
      category: 'reliability',
      status: 'warning',
      description: 'Geen warmtepompen in dit contingent',
    };
  }

  const online = heatPumps.filter((hp) => hp.status !== 'offline').length;
  const percentage = Math.round((online / heatPumps.length) * 100);

  const status: KpiStatus =
    percentage === 100 ? 'good'     :
    percentage >= 80   ? 'warning'  :
                         'critical';

  return {
    id: 'connectivity',
    name: 'Connectiviteit',
    value: percentage,
    unit: '%',
    category: 'reliability',
    status,
    description: `${online} van ${heatPumps.length} warmtepompen online`,
  };
};

/**
 * KPI: Storingen — official TDI 500 KPI #2
 * Counts active high-severity error codes across all heat pumps in a contingent.
 * Source: TNO Activity 2.1 defines this as a primary success metric.
 */
export const calculateStoringenKpi = (
  heatPumps: HeatPumpSystem[]
): KeyPerformanceIndicator => {
  const highSeverityErrors = heatPumps.flatMap((hp) =>
    hp.errorCodes.filter(
      (e) => e.severity.toLowerCase() === 'high' || e.severity.toLowerCase() === 'critical'
    )
  );

  const count = highSeverityErrors.length;

  const status: KpiStatus =
    count === 0 ? 'good'     :
    count <= 2  ? 'warning'  :
                  'critical';

  return {
    id: 'storingen',
    name: 'Storingen',
    value: count,
    unit: 'meldingen',
    category: 'commissioning',
    status,
    description: 'Actieve storingen met hoge prioriteit (TDI 500 KPI)',
  };
};

/**
 * KPI: Inregelsnelheid — official TDI 500 KPI #1
 * Commissioning speed in minutes. The Hupie API does not currently expose
 * commissioning timestamps, so this returns a placeholder until that data
 * is available. When available, implement calculation here.
 * Source: TNO Activity 2.1 defines inregelsnelheid as a primary success metric.
 */
export const calculateInregelsnelheidKpi = (): KeyPerformanceIndicator => {
  return {
    id: 'inregelsnelheid',
    name: 'Inregelsnelheid',
    value: 0,
    unit: 'min',
    category: 'commissioning',
    status: 'good',
    description: 'Inregeldata nog niet beschikbaar via Hupie API',
  };
};

/**
 * Aggregates all KPIs for a contingent.
 * Requires the contingent's kruisprofiel thresholds to score correctly.
 */
export const aggregateKpisForContingent = (
  heatPumps: HeatPumpSystem[],
  thresholds: ScoringThresholds
): KeyPerformanceIndicator[] => {
  return [
    calculateCopKpi(heatPumps, thresholds),
    calculateConnectivityKpi(heatPumps),
    calculateStoringenKpi(heatPumps),
    calculateInregelsnelheidKpi(),
  ];
};
