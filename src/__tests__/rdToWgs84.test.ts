import { describe, it, expect } from 'vitest';
import { rdToWgs84 } from '../utils/rdToWgs84';

describe('rdToWgs84', () => {
  it('converts Amersfoort reference point (origin)', () => {
    const [lat, lon] = rdToWgs84(155000, 463000);
    expect(lat).toBeCloseTo(52.1552, 3);
    expect(lon).toBeCloseTo(5.3872, 3);
  });

  it('converts Amsterdam Centraal', () => {
    const [lat, lon] = rdToWgs84(121687, 487041);
    expect(lat).toBeCloseTo(52.370, 2);
    expect(lon).toBeCloseTo(4.900, 2);
  });

  it('converts Rotterdam', () => {
    const [lat, lon] = rdToWgs84(92560, 437402);
    expect(lat).toBeCloseTo(51.922, 2);
    expect(lon).toBeCloseTo(4.479, 2);
  });

  it('converts Den Haag', () => {
    const [lat, lon] = rdToWgs84(81253, 455271);
    expect(lat).toBeCloseTo(52.080, 2);
    expect(lon).toBeCloseTo(4.312, 2);
  });

  it('returns values within valid Netherlands bounding box', () => {
    const [lat, lon] = rdToWgs84(155000, 463000);
    expect(lat).toBeGreaterThan(50.7);
    expect(lat).toBeLessThan(53.7);
    expect(lon).toBeGreaterThan(3.3);
    expect(lon).toBeLessThan(7.3);
  });
});
