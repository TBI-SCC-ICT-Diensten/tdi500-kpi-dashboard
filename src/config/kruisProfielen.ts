import type { KruisProfiel, KruisProfielCode } from '../types/heatpump';

/**
 * The 9 official TDI 500 kruisprofielen.
 * Source: TNO Activity 2.1 — Catalogus inregelinstellingen (October 2025)
 *
 * Y-axis: insulationLevel (isolatieniveau)
 *   A = RC > 2.5 m²K/W  (goed geïsoleerd)
 *   B = RC 1.3–2.5 m²K/W (matig geïsoleerd)
 *   C = RC < 1.3 m²K/W  (slecht geïsoleerd)
 *
 * X-axis: supplyTemperatureClass (afgiftesysteem)
 *   1 = ≤ 30°C  (vloerverwarming)
 *   2 = 30–55°C (radiator)
 *   3 = ≥ 55°C  (hete lucht)
 */
export const KRUIS_PROFIEL_MAP: Record<KruisProfielCode, KruisProfiel> = {
  A1: {
    code: 'A1',
    insulationLevel: 'A',
    supplyTemperatureClass: '1',
    maxSupplyTemperatureCelsius: 30,
    description: 'Goed geïsoleerd — vloerverwarming (max. 30°C)',
  },
  A2: {
    code: 'A2',
    insulationLevel: 'A',
    supplyTemperatureClass: '2',
    maxSupplyTemperatureCelsius: 55,
    description: 'Goed geïsoleerd — radiator (30–55°C)',
  },
  A3: {
    code: 'A3',
    insulationLevel: 'A',
    supplyTemperatureClass: '3',
    maxSupplyTemperatureCelsius: 80,
    description: 'Goed geïsoleerd — hete lucht (≥ 55°C)',
  },
  B1: {
    code: 'B1',
    insulationLevel: 'B',
    supplyTemperatureClass: '1',
    maxSupplyTemperatureCelsius: 30,
    description: 'Matig geïsoleerd — vloerverwarming (max. 30°C)',
  },
  B2: {
    code: 'B2',
    insulationLevel: 'B',
    supplyTemperatureClass: '2',
    maxSupplyTemperatureCelsius: 55,
    description: 'Matig geïsoleerd — radiator (30–55°C)',
  },
  B3: {
    code: 'B3',
    insulationLevel: 'B',
    supplyTemperatureClass: '3',
    maxSupplyTemperatureCelsius: 80,
    description: 'Matig geïsoleerd — hete lucht (≥ 55°C)',
  },
  C1: {
    code: 'C1',
    insulationLevel: 'C',
    supplyTemperatureClass: '1',
    maxSupplyTemperatureCelsius: 30,
    description: 'Slecht geïsoleerd — vloerverwarming (max. 30°C)',
  },
  C2: {
    code: 'C2',
    insulationLevel: 'C',
    supplyTemperatureClass: '2',
    maxSupplyTemperatureCelsius: 55,
    description: 'Slecht geïsoleerd — radiator (30–55°C)',
  },
  C3: {
    code: 'C3',
    insulationLevel: 'C',
    supplyTemperatureClass: '3',
    maxSupplyTemperatureCelsius: 80,
    description: 'Slecht geïsoleerd — hete lucht (≥ 55°C)',
  },
};

/**
 * Returns the KruisProfiel for a given code.
 */
export const getKruisProfiel = (code: KruisProfielCode): KruisProfiel => {
  return KRUIS_PROFIEL_MAP[code];
};

/**
 * All 9 kruisprofielen as an ordered array.
 */
export const ALL_KRUIS_PROFIELEN: KruisProfiel[] = Object.values(KRUIS_PROFIEL_MAP);
