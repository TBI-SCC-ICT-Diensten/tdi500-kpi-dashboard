import { describe, it, expect } from 'vitest';
import { estimateExpectedCop } from '../components/bag/WeatherWidget';

describe('estimateExpectedCop', () => {
  it('returns 3.5 for supply class 2 at 7°C', () => {
    expect(estimateExpectedCop(7, '2')).toBeCloseTo(3.5, 1);
  });

  it('returns lower COP at -7°C than at 7°C for supply class 2', () => {
    const cold = estimateExpectedCop(-7, '2');
    const ref = estimateExpectedCop(7, '2');
    expect(cold).toBeLessThan(ref);
  });

  it('returns higher COP at 15°C than at 7°C for supply class 2', () => {
    const mild = estimateExpectedCop(15, '2');
    const ref = estimateExpectedCop(7, '2');
    expect(mild).toBeGreaterThan(ref);
  });

  it('supply class 1 always yields higher COP than class 3 at same temperature', () => {
    for (const temp of [-10, 0, 7, 15]) {
      expect(estimateExpectedCop(temp, '1')).toBeGreaterThan(
        estimateExpectedCop(temp, '3')
      );
    }
  });

  it('COP never falls below 1.0', () => {
    expect(estimateExpectedCop(-30, '3')).toBeGreaterThanOrEqual(1.0);
    expect(estimateExpectedCop(-50, '3')).toBeGreaterThanOrEqual(1.0);
  });
});
