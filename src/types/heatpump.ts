export interface HeatPumpSystem {
  id: string;
  uri: string;
  building?: string;
  room?: string;
  status: HeatPumpStatus;
  measurements: Measurement[];
  errorCodes: ErrorCode[];
  internetConnection?: ConnectionState;
  serverConnection?: ConnectionState;
  heatingCurve?: HeatingCurve;
}

export type HeatPumpStatus = 'active' | 'warning' | 'error' | 'offline' | 'unknown';

export interface Measurement {
  property: MeasurementProperty;
  value: number;
  unit: string;
  rawUnit: string;
  timestamp?: Date;
}

export type MeasurementProperty =
  | 'roomTemperature'
  | 'temperatureSetpoint'
  | 'outsideTemperature'
  | 'waterPressure'
  | 'cop'
  | 'energyUsage'
  | 'supplyTemperature'
  | 'returnTemperature'
  | 'hotWaterTemperature'
  | 'power'
  | 'unknown';

export interface ErrorCode {
  code: string;
  message: string;
  severity: string;
}

export type ConnectionState = 'connected' | 'disconnected' | 'unknown';

export interface HeatingCurve {
  baseValue: number;
  baseUnit: string;
  slopeValue: number;
  slopeUnit: string;
}

// ── TDI 500 Domain: Kruisprofielen ──────────────────────────────────────────
// 9 official cross-profiles from TNO Activity 2.1 — Catalogus inregelinstellingen
// X-axis: supply temperature class | Y-axis: insulation level

export type InsulationLevel = 'A' | 'B' | 'C';
// A = good insulation    (RC > 2.5 m²K/W)
// B = moderate insulation (RC 1.3–2.5 m²K/W)
// C = poor insulation    (RC < 1.3 m²K/W)

export type SupplyTemperatureClass = '1' | '2' | '3';
// 1 = max supply temperature ≤ 30°C   (floor heating / vloerverwarming)
// 2 = max supply temperature 30–55°C  (radiators)
// 3 = max supply temperature ≥ 55°C   (hot air / hete lucht)

export type KruisProfielCode =
  | 'A1' | 'A2' | 'A3'
  | 'B1' | 'B2' | 'B3'
  | 'C1' | 'C2' | 'C3';

export interface KruisProfiel {
  code: KruisProfielCode;
  insulationLevel: InsulationLevel;
  supplyTemperatureClass: SupplyTemperatureClass;
  maxSupplyTemperatureCelsius: number;
  description: string;
}

export interface Contingent {
  id: string;
  name: string;
  kruisProfiel: KruisProfiel;
  heatPumps: HeatPumpSystem[];
}

export interface KeyPerformanceIndicator {
  name: string;
  value: number;
  unit: string;
  category: KpiCategory;
  status: KpiStatus;
  description?: string;
}

export type KpiCategory =
  | 'efficiency'
  | 'comfort'
  | 'reliability'
  | 'energy'
  | 'commissioning';
// 'commissioning' covers official TDI 500 KPIs: inregelsnelheid and storingen
export type KpiStatus = 'good' | 'warning' | 'critical';
