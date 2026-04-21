import { describe, it, expect } from 'vitest';
import { estimateExpectedCop } from '../services/weatherService';

describe('estimateExpectedCop', () => {
  it('returns 3.5 baseline for supply class 2 at 7°C', () => {
    expect(estimateExpectedCop(7, '2')).toBe(3.5);
  });

  it('returns higher baseline for supply class 1', () => {
    expect(estimateExpectedCop(7, '1')).toBeGreaterThan(
      estimateExpectedCop(7, '2')
    );
  });

  it('returns lower baseline for supply class 3', () => {
    expect(estimateExpectedCop(7, '3')).toBeLessThan(
      estimateExpectedCop(7, '2')
    );
  });

  it('decreases COP as outdoor temp drops below 7°C', () => {
    const at7  = estimateExpectedCop(7,  '2');
    const at0  = estimateExpectedCop(0,  '2');
    const atM5 = estimateExpectedCop(-5, '2');
    expect(at0).toBeLessThan(at7);
    expect(atM5).toBeLessThan(at0);
  });

  it('increases COP as outdoor temp rises above 7°C', () => {
    const at7  = estimateExpectedCop(7,  '2');
    const at10 = estimateExpectedCop(10, '2');
    const at15 = estimateExpectedCop(15, '2');
    expect(at10).toBeGreaterThan(at7);
    expect(at15).toBeGreaterThan(at10);
  });

  it('never returns COP below 1.0 even at extreme cold', () => {
    expect(estimateExpectedCop(-30, '3')).toBeGreaterThanOrEqual(1.0);
  });

  it('defaults to class 2 baseline when no supply class given', () => {
    expect(estimateExpectedCop(7)).toBe(estimateExpectedCop(7, '2'));
  });
});
