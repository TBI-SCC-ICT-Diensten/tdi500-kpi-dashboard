import { describe, it, expect } from 'vitest';
import {
  SPARQL_SET_HEATING_CURVE,
  SPARQL_SET_TEMPERATURE_SETPOINT,
} from '../services/sparqlQueries';

describe('SPARQL_SET_HEATING_CURVE', () => {
  it('includes the heat pump id in a VALUES clause', () => {
    const query = SPARQL_SET_HEATING_CURVE('abc123', 36.0, -0.5);
    expect(query).toContain('VALUES ?id { "abc123" }');
  });

  it('includes the base value as xsd:double', () => {
    const query = SPARQL_SET_HEATING_CURVE('abc123', 36.0, -0.5);
    expect(query).toContain('"36"');
  });

  it('includes the slope value as xsd:double', () => {
    const query = SPARQL_SET_HEATING_CURVE('abc123', 36.0, -0.5);
    expect(query).toContain('"-0.5"');
  });

  it('includes hco:ControlHeatingCurve', () => {
    const query = SPARQL_SET_HEATING_CURVE('abc123', 36.0, -0.5);
    expect(query).toContain('hco:ControlHeatingCurve');
  });

  it('generates unique IRIs on each call', () => {
    const query1 = SPARQL_SET_HEATING_CURVE('abc123', 36.0, -0.5);
    const query2 = SPARQL_SET_HEATING_CURVE('abc123', 36.0, -0.5);
    expect(query1).not.toBe(query2);
  });
});

describe('SPARQL_SET_TEMPERATURE_SETPOINT', () => {
  it('includes the heat pump id in a VALUES clause', () => {
    const query = SPARQL_SET_TEMPERATURE_SETPOINT('abc123', 20.5);
    expect(query).toContain('VALUES ?id { "abc123" }');
  });

  it('includes the setpoint value as xsd:double', () => {
    const query = SPARQL_SET_TEMPERATURE_SETPOINT('abc123', 20.5);
    expect(query).toContain('"20.5"');
  });

  it('includes hco:ControlTemperatureSetpoint', () => {
    const query = SPARQL_SET_TEMPERATURE_SETPOINT('abc123', 20.5);
    expect(query).toContain('hco:ControlTemperatureSetpoint');
  });

  it('generates unique IRIs on each call', () => {
    const query1 = SPARQL_SET_TEMPERATURE_SETPOINT('abc123', 20.0);
    const query2 = SPARQL_SET_TEMPERATURE_SETPOINT('abc123', 20.0);
    expect(query1).not.toBe(query2);
  });
});
