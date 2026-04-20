/**
 * Mock heat pump data for demonstration and development.
 *
 * Covers all code paths in the dashboard:
 * - All 5 status types (active, warning, error, offline, unknown)
 * - Error codes with different severities
 * - Full measurement set matching the real Hupie API response
 * - Valid heatingCurve values using Hupie's negative slope convention
 *
 * Used when VITE_USE_MOCK_DATA=true or when the runtime toggle
 * in Header selects "Mock".
 *
 * NOTE: SET commands (SPARQL UPDATE via heatPumpCommandService) are
 * NOT mocked. If mock mode is active and the user clicks a SET button
 * in HeatPumpCommandPanel, the command will still fire against the
 * live Hupie API. This is intentional — write operations bypass the
 * data-source toggle.
 */

import type { HeatPumpSystem } from '../types/heatpump';

export const MOCK_HEAT_PUMPS: HeatPumpSystem[] = [
  {
    id: 'mock-pump-01',
    uri: 'https://mock.tdi500/heatPump/mock-pump-01',
    building: 'Mock woning Rotterdam',
    room: 'Woonkamer',
    status: 'active',
    internetConnection: 'connected',
    serverConnection: 'connected',
    measurements: [
      { property: 'roomTemperature',      value: 21.2, unit: '°C',  rawUnit: 'degreeCelsius' },
      { property: 'temperatureSetpoint',  value: 21.0, unit: '°C',  rawUnit: 'degreeCelsius' },
      { property: 'outsideTemperature',   value: 7.5,  unit: '°C',  rawUnit: 'degreeCelsius' },
      { property: 'waterPressure',        value: 1.8,  unit: 'bar', rawUnit: 'bar' },
      { property: 'cop',                  value: 4.1,  unit: 'kW/kW', rawUnit: 'kiloWattPerKiloWatt' },
      { property: 'energyUsage',          value: 12.4, unit: 'kWh', rawUnit: 'kiloWattHour' },
    ],
    errorCodes: [],
    heatingCurve: {
      baseValue: 38.0,
      baseUnit: '°C',
      slopeValue: -0.6,
      slopeUnit: '°C/°C',
    },
    deviceSpecs: {
      manufacturer: 'Remeha',
      model: 'Elga Ace 8',
      serialNumber: 'RMH-2021-084521',
      firmwareVersion: '3.1.2',
      yearOfManufacture: 2021,
    },
  },
  {
    id: 'mock-pump-02',
    uri: 'https://mock.tdi500/heatPump/mock-pump-02',
    building: 'Mock woning Den Haag',
    room: 'Woonkamer',
    status: 'warning',
    internetConnection: 'connected',
    serverConnection: 'connected',
    measurements: [
      { property: 'roomTemperature',      value: 19.8, unit: '°C',  rawUnit: 'degreeCelsius' },
      { property: 'temperatureSetpoint',  value: 21.5, unit: '°C',  rawUnit: 'degreeCelsius' },
      { property: 'outsideTemperature',   value: 2.1,  unit: '°C',  rawUnit: 'degreeCelsius' },
      { property: 'waterPressure',        value: 1.5,  unit: 'bar', rawUnit: 'bar' },
      { property: 'cop',                  value: 2.3,  unit: 'kW/kW', rawUnit: 'kiloWattPerKiloWatt' },
      { property: 'energyUsage',          value: 18.7, unit: 'kWh', rawUnit: 'kiloWattHour' },
    ],
    errorCodes: [
      {
        code: 'W042',
        message: 'Aanvoertemperatuur onder setpoint',
        severity: 'warning',
      },
    ],
    heatingCurve: {
      baseValue: 42.0,
      baseUnit: '°C',
      slopeValue: -0.8,
      slopeUnit: '°C/°C',
    },
    deviceSpecs: {
      manufacturer: 'Bosch',
      model: 'Compress 7400i AW',
      serialNumber: 'BSH-2020-117834',
      firmwareVersion: '2.8.0',
      yearOfManufacture: 2020,
    },
  },
  {
    id: 'mock-pump-03',
    uri: 'https://mock.tdi500/heatPump/mock-pump-03',
    building: 'Mock jaren 30-woning Amsterdam',
    room: 'Woonkamer',
    status: 'error',
    internetConnection: 'connected',
    serverConnection: 'connected',
    measurements: [
      { property: 'roomTemperature',      value: 17.1, unit: '°C',  rawUnit: 'degreeCelsius' },
      { property: 'temperatureSetpoint',  value: 20.0, unit: '°C',  rawUnit: 'degreeCelsius' },
      { property: 'outsideTemperature',   value: -1.5, unit: '°C',  rawUnit: 'degreeCelsius' },
      { property: 'waterPressure',        value: 0.9,  unit: 'bar', rawUnit: 'bar' },
      { property: 'cop',                  value: 2.1,  unit: 'kW/kW', rawUnit: 'kiloWattPerKiloWatt' },
      { property: 'energyUsage',          value: 24.3, unit: 'kWh', rawUnit: 'kiloWattHour' },
    ],
    errorCodes: [
      {
        code: 'F101',
        message: 'Waterdruk kritisch laag',
        severity: 'high',
      },
      {
        code: 'F042',
        message: 'Temperatuursensor onbetrouwbaar',
        severity: 'critical',
      },
    ],
    heatingCurve: {
      baseValue: 52.0,
      baseUnit: '°C',
      slopeValue: -1.4,
      slopeUnit: '°C/°C',
    },
    deviceSpecs: {
      manufacturer: 'Intergas',
      model: 'HReco 200',
      serialNumber: 'ITG-2019-003291',
      firmwareVersion: '1.4.7',
      yearOfManufacture: 2019,
    },
  },
  {
    id: 'mock-pump-04',
    uri: 'https://mock.tdi500/heatPump/mock-pump-04',
    building: 'Mock nieuwbouw Utrecht',
    room: 'Open keuken',
    status: 'active',
    internetConnection: 'connected',
    serverConnection: 'connected',
    measurements: [
      { property: 'roomTemperature',      value: 20.8, unit: '°C',  rawUnit: 'degreeCelsius' },
      { property: 'temperatureSetpoint',  value: 20.5, unit: '°C',  rawUnit: 'degreeCelsius' },
      { property: 'outsideTemperature',   value: 9.2,  unit: '°C',  rawUnit: 'degreeCelsius' },
      { property: 'waterPressure',        value: 2.0,  unit: 'bar', rawUnit: 'bar' },
      { property: 'cop',                  value: 4.3,  unit: 'kW/kW', rawUnit: 'kiloWattPerKiloWatt' },
      { property: 'energyUsage',          value: 8.1,  unit: 'kWh', rawUnit: 'kiloWattHour' },
    ],
    errorCodes: [],
    heatingCurve: {
      baseValue: 30.0,
      baseUnit: '°C',
      slopeValue: -0.3,
      slopeUnit: '°C/°C',
    },
    deviceSpecs: {
      manufacturer: 'Alklima',
      model: 'ERST20D-VM2E',
      serialNumber: 'ALK-2023-209156',
      firmwareVersion: '4.0.1',
      yearOfManufacture: 2023,
    },
  },
  {
    id: 'mock-pump-05',
    uri: 'https://mock.tdi500/heatPump/mock-pump-05',
    building: 'Mock woning Eindhoven',
    room: 'Woonkamer',
    status: 'offline',
    internetConnection: 'disconnected',
    serverConnection: 'connected',
    measurements: [],
    errorCodes: [],
    heatingCurve: undefined,
    deviceSpecs: {
      manufacturer: 'Remeha',
      model: 'Elga Ace 6',
      serialNumber: 'RMH-2018-061203',
      firmwareVersion: '2.2.3',
      yearOfManufacture: 2018,
    },
  },
];
