import type { KruisProfielCode } from '../types/heatpump';

/**
 * Scoring thresholds per kruisprofiel, grounded in the TDI 500 catalog.
 * Source: TNO Activity 2.1 — Catalogus inregelinstellingen (October 2025)
 *
 * maxSupplyTemperatureCelsius: sourced directly from catalog tables per profile.
 * minCop: derived from insulation class — better insulation enables higher COP.
 * maxWaterPressureBar: standard safe operating limit across all profiles.
 * maxHighSeverityErrors: zero tolerance for active high-severity faults.
 */
export interface ScoringThresholds {
  minCop: number;
  maxSupplyTemperatureCelsius: number;
  maxWaterPressureBar: number;
  maxHighSeverityErrors: number;
}

export const SCORING_THRESHOLDS_BY_PROFIEL: Record<KruisProfielCode, ScoringThresholds> = {
  A1: { minCop: 3.5, maxSupplyTemperatureCelsius: 30, maxWaterPressureBar: 2.5, maxHighSeverityErrors: 0 },
  A2: { minCop: 3.0, maxSupplyTemperatureCelsius: 55, maxWaterPressureBar: 2.5, maxHighSeverityErrors: 0 },
  A3: { minCop: 2.5, maxSupplyTemperatureCelsius: 80, maxWaterPressureBar: 2.5, maxHighSeverityErrors: 0 },
  B1: { minCop: 3.0, maxSupplyTemperatureCelsius: 30, maxWaterPressureBar: 2.5, maxHighSeverityErrors: 0 },
  B2: { minCop: 2.5, maxSupplyTemperatureCelsius: 55, maxWaterPressureBar: 2.5, maxHighSeverityErrors: 0 },
  B3: { minCop: 2.0, maxSupplyTemperatureCelsius: 80, maxWaterPressureBar: 2.5, maxHighSeverityErrors: 0 },
  C1: { minCop: 2.5, maxSupplyTemperatureCelsius: 30, maxWaterPressureBar: 2.5, maxHighSeverityErrors: 0 },
  C2: { minCop: 2.0, maxSupplyTemperatureCelsius: 55, maxWaterPressureBar: 2.5, maxHighSeverityErrors: 0 },
  C3: { minCop: 1.8, maxSupplyTemperatureCelsius: 80, maxWaterPressureBar: 2.5, maxHighSeverityErrors: 0 },
};
