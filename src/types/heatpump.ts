/**
 * WGS84 coordinates for weather lookup.
 * Populated from BAG API rdCoordinates via rdToWgs84 conversion.
 * Optional — Hupie API does not expose location data.
 */
export interface Wgs84Location {
  lat: number;
  lon: number;
}

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
  deviceSpecs?: DeviceSpecs;
  wgs84?: Wgs84Location;
  /**
   * Optional kruisprofiel code assigned during contingent classification.
   * Not exposed by the Hupie API — populated from BAG lookup or manual
   * assignment by the installer.
   */
  kruisProfielCode?: KruisProfielCode;
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
  severity: 'low' | 'warning' | 'high' | 'critical' | 'error' | string;
  /**
   * ISO date string of when the storing was first detected.
   * Optional — the Hupie API does not currently expose detection
   * timestamps. Used to derive the resolve-by horizon (oplostermijn).
   */
  detectedAt?: string;
}

export type ConnectionState = 'connected' | 'disconnected' | 'unknown';

export interface HeatingCurve {
  baseValue: number;
  baseUnit: string;
  slopeValue: number;
  slopeUnit: string;
}

/**
 * Static device specification data for a heat pump.
 * Sourced from HCO device spec pattern:
 *   saref:hasManufacturer, saref:hasModel, s4ener:serialNumber,
 *   s4watr:hasFirmwareVersion, hco:hasYearOfManufacture
 */
export interface DeviceSpecs {
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  firmwareVersion?: string;
  yearOfManufacture?: number;
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
  id: string;
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

// ── Hupie Write Commands ─────────────────────────────────────────────────────
// Types for SPARQL UPDATE operations (SET heating curve, SET temperature setpoint)

export interface HeatingCurveCommand {
  heatPumpId: string;   // the string identifier (e.g. "bdgp0cbmq2t7uke")
  baseValue: number;    // °C — the base temperature of the heating curve
  slopeValue: number;   // °C/°C — the slope of the heating curve
}

export interface TemperatureSetpointCommand {
  heatPumpId: string;   // the string identifier
  value: number;        // °C — the desired room temperature setpoint
}

export type CommandStatus = 'idle' | 'pending' | 'success' | 'error';

/** All valid kruisprofiel codes from the TNO catalogus. */
export const VALID_KRUISPROFIEL_CODES: readonly KruisProfielCode[] = [
  'A1', 'A2', 'A3',
  'B1', 'B2', 'B3',
  'C1', 'C2', 'C3',
] as const;

/** Type guard — validates that a string is a valid KruisProfielCode. */
export function isValidKruisProfielCode(code: string): code is KruisProfielCode {
  return VALID_KRUISPROFIEL_CODES.includes(code as KruisProfielCode);
}

// ── TNO Catalogus (Activiteit 2.1) ──────────────────────────────────────────

/**
 * Manufacturers that participated in the TNO TDI 500 catalogus (Activiteit 2.1).
 * Source: TNO 2025 R00000, Tabel 1–9.
 *
 * These are the four fabrikanten that submitted standard inregelinstellingen
 * per kruisprofiel. Other manufacturers (Daikin, Stiebel-Eltron, Atag,
 * Climate for Life, Inventum, Triple Solar) participated in the consortium
 * but did not submit catalogus entries for Activiteit 2.1.
 */
export type Fabrikant = 'Intergas' | 'Bosch' | 'Remeha' | 'Alklima';

export const ALL_FABRIKANTEN: readonly Fabrikant[] = [
  'Intergas',
  'Bosch',
  'Remeha',
  'Alklima',
] as const;

/**
 * A single parameter entry in the TNO catalogus.
 *
 * Values can be:
 *   - A concrete value (string for free-form, number when numeric)
 *   - null when the source document has 'X' (niet opgegeven door fabrikant)
 *
 * Free-form strings are used because the source data varies in format:
 *   "20/20, -10/30" (stooklijn as piecewise linear)
 *   "0,3" (stooklijn as slope coefficient)
 *   "Variabel (vrijgave: 5gr)" (bivalent temperature description)
 *   "instelbaar (300K/°/min)" (backup delay description)
 *
 * A stricter schema would require the fabrikanten to standardize their
 * formats — out of scope for this project.
 */
export type CatalogusValue = string | number | null;

/**
 * One fabrikant's settings for one kruisprofiel.
 * All 11 parameters from Tabel 1–9 in the TNO document.
 */
export interface FabrikantInstellingen {
  /** e.g. "xtend", "compress 3400i compress 7400i" — null when fabrikant has no applicable model */
  warmtepompType: CatalogusValue;
  /** e.g. "vloerverw", "radiator", "hete lucht" */
  afgiftesysteem: CatalogusValue;
  /** Celsius. "X" in source → null */
  maxAanvoertemperatuur: CatalogusValue;
  /** e.g. "Model afh.", or null */
  minimaleCop: CatalogusValue;
  /** e.g. "20/20, -10/30" or "0,3". Free-form — fabrikanten use different formats */
  stooklijn: CatalogusValue;
  /** e.g. "1K", "4k". Free-form */
  ruimteInvloed: CatalogusValue;
  /** e.g. "0gr", "5gr", "7gr" */
  vrijgaveBijverwarming: CatalogusValue;
  /** Minutes before backup kicks in. e.g. 120, or "instelbaar (300K/°/min)" */
  wachttijdBackupMin: CatalogusValue;
  /** e.g. "Instelbaar (hybride)", "ERSD-VM2E", "Kosten" */
  hybrideModus: CatalogusValue;
  /** e.g. "7K" */
  deltaT: CatalogusValue;
  /** e.g. "Variabel (vrijgave: 5gr)" */
  bivalentTemperatuur: CatalogusValue;
}

/**
 * Full catalogus entry for one kruisprofiel — one FabrikantInstellingen
 * per fabrikant.
 */
export type CatalogusProfiel = Record<Fabrikant, FabrikantInstellingen>;

/**
 * Complete TNO catalogus: all 9 profielen × 4 fabrikanten.
 */
export type TnoCatalogus = Record<KruisProfielCode, CatalogusProfiel>;
