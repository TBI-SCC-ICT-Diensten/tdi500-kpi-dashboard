import { describe, it, expect } from 'vitest';
import { isValidKruisProfielCode } from '../types/heatpump';

describe('contingent filtering logic', () => {
  it('builds correct kruisprofiel code from isolatie + aanvoer', () => {
    const isolatie = 'A';
    const aanvoer = '3';
    const code = `${isolatie}${aanvoer}`;
    expect(isValidKruisProfielCode(code)).toBe(true);
    expect(code).toBe('A3');
  });

  it('falls back to B2 for invalid combinations', () => {
    const code = 'X9';
    const result = isValidKruisProfielCode(code) ? code : 'B2';
    expect(result).toBe('B2');
  });

  it('falls back to B2 for empty params', () => {
    const isolatie = '';
    const aanvoer = '';
    const code = `${isolatie}${aanvoer}`;
    const result = isValidKruisProfielCode(code) ? code : 'B2';
    expect(result).toBe('B2');
  });
});
