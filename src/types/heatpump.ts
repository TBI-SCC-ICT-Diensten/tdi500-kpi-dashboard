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

export interface Contingent {
  id: string;
  name: string;
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

export type KpiCategory = 'efficiency' | 'comfort' | 'reliability' | 'energy';
export type KpiStatus = 'good' | 'warning' | 'critical';
