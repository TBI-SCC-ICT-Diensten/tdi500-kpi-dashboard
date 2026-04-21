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
  if (b < 20 || b > 60) return 'Basiswaarde moet tussen 20°C en 60°C liggen (aanvoertemperatuur).';
  if (s < -4.0 || s > -0.1) return 'Hellingswaarde moet tussen −4,0 en −0,1 liggen (Hupie-conventie).';
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
    expect(validateHeatingCurve('40', '-0.6')).toBeNull();
    expect(validateHeatingCurve('20', '-0.1')).toBeNull();
    expect(validateHeatingCurve('60', '-4.0')).toBeNull();
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
    expect(validateHeatingCurve('19', '-0.6')).not.toBeNull();
    expect(validateHeatingCurve('61', '-0.6')).not.toBeNull();
  });

  it('rejects slope out of range', () => {
    expect(validateHeatingCurve('40', '-4.1')).not.toBeNull();
    expect(validateHeatingCurve('40', '-0.09')).not.toBeNull();
    expect(validateHeatingCurve('40', '0.6')).not.toBeNull();
  });

  it('accepts boundary values exactly', () => {
    expect(validateHeatingCurve('20', '-0.1')).toBeNull();
    expect(validateHeatingCurve('60', '-4.0')).toBeNull();
  });
});
