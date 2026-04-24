import { describe, it, expect } from 'vitest';
import { isValidKruisProfielCode, VALID_KRUISPROFIEL_CODES }
  from '../types/heatpump';

describe('isValidKruisProfielCode', () => {
  it('accepts all 9 valid codes', () => {
    VALID_KRUISPROFIEL_CODES.forEach((code) => {
      expect(isValidKruisProfielCode(code)).toBe(true);
    });
  });

  it('rejects invalid codes', () => {
    expect(isValidKruisProfielCode('D1')).toBe(false);
    expect(isValidKruisProfielCode('A4')).toBe(false);
    expect(isValidKruisProfielCode('')).toBe(false);
    expect(isValidKruisProfielCode('B')).toBe(false);
    expect(isValidKruisProfielCode('b2')).toBe(false);
  });

  it('returns false for lowercase variants', () => {
    expect(isValidKruisProfielCode('a1')).toBe(false);
    expect(isValidKruisProfielCode('c3')).toBe(false);
  });
});
