import { describe, it, expect } from 'vitest';

// Inline the validation logic to test boundary conditions.
// These match the validation in HeatPumpCommandPanel exactly.

const validateSetpoint = (value: string): string | null => {
  const parsed = parseFloat(value);
  if (!Number.isFinite(parsed)) return 'Voer een geldig getal in.';
  if (parsed < 10 || parsed > 30) return 'Setpoint moet tussen 10°C en 30°C liggen.';
  return null;
};

const validateHeatingCurve = (
  base: string,
  slope: string
): string | null => {
  const b = parseFloat(base);
  const s = parseFloat(slope);
  if (!Number.isFinite(b)) return 'Voer een geldige basiswaarde in.';
  if (!Number.isFinite(s)) return 'Voer een geldige hellingswaarde in.';
  if (b < -10 || b > 30) return 'Voetpunt moet een getal in graden Celsius zijn (typisch 15–25°C).';
  if (s < 0.1 || s > 4.0) return 'Hellingswaarde moet tussen 0,1 en 4,0 liggen.';
  return null;
};

describe('setpoint validation', () => {
  it('accepts valid setpoint', () => {
    expect(validateSetpoint('20')).toBeNull();
    expect(validateSetpoint('10')).toBeNull();
    expect(validateSetpoint('30')).toBeNull();
    expect(validateSetpoint('21.5')).toBeNull();
  });

  it('rejects non-numeric input', () => {
    expect(validateSetpoint('')).not.toBeNull();
    expect(validateSetpoint('abc')).not.toBeNull();
    expect(validateSetpoint('NaN')).not.toBeNull();
  });

  it('rejects out-of-range setpoint', () => {
    expect(validateSetpoint('9')).not.toBeNull();
    expect(validateSetpoint('31')).not.toBeNull();
    expect(validateSetpoint('-5')).not.toBeNull();
  });

  it('accepts boundary values exactly', () => {
    expect(validateSetpoint('10')).toBeNull();
    expect(validateSetpoint('30')).toBeNull();
  });
});

describe('heating curve validation', () => {
  it('accepts valid curve', () => {
    expect(validateHeatingCurve('20', '0.8')).toBeNull();
    expect(validateHeatingCurve('15', '0.1')).toBeNull();
    expect(validateHeatingCurve('30', '4.0')).toBeNull();
  });

  it('rejects non-numeric base', () => {
    expect(validateHeatingCurve('abc', '0.8')).not.toBeNull();
    expect(validateHeatingCurve('', '0.8')).not.toBeNull();
  });

  it('rejects non-numeric slope', () => {
    expect(validateHeatingCurve('20', 'abc')).not.toBeNull();
    expect(validateHeatingCurve('20', '')).not.toBeNull();
  });

  it('rejects base out of range', () => {
    expect(validateHeatingCurve('-11', '0.8')).not.toBeNull();
    expect(validateHeatingCurve('31', '0.8')).not.toBeNull();
  });

  it('rejects slope out of range', () => {
    expect(validateHeatingCurve('20', '0.09')).not.toBeNull();
    expect(validateHeatingCurve('20', '4.1')).not.toBeNull();
  });

  it('accepts boundary values exactly', () => {
    expect(validateHeatingCurve('-10', '0.1')).toBeNull();
    expect(validateHeatingCurve('30', '4.0')).toBeNull();
  });
});
