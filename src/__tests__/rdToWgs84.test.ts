import { describe, it, expect } from 'vitest';
import { rdToWgs84, haversineKm } from '../utils/rdToWgs84';

describe('rdToWgs84', () => {
  it('converts Amersfoort reference point correctly', () => {
    const [lat, lon] = rdToWgs84(155000, 463000);
    expect(lat).toBeCloseTo(52.1552, 3);
    expect(lon).toBeCloseTo(5.3872, 3);
  });

  it('converts Amsterdam correctly', () => {
    // RD New center of Amsterdam; lon comes out ~4.898 for these coordinates
    const [lat, lon] = rdToWgs84(121687, 487041);
    expect(lat).toBeCloseTo(52.373, 2);
    expect(lon).toBeCloseTo(4.898, 2);
  });

  it('converts Rotterdam correctly', () => {
    const [lat, lon] = rdToWgs84(92560, 437402);
    expect(lat).toBeCloseTo(51.9225, 2);
    expect(lon).toBeCloseTo(4.4792, 2);
  });
});

describe('haversineKm', () => {
  it('returns 0 for same point', () => {
    expect(haversineKm(52.0, 5.0, 52.0, 5.0)).toBe(0);
  });

  it('calculates Amsterdam-Rotterdam distance correctly', () => {
    const dist = haversineKm(52.3731, 4.8922, 51.9225, 4.4792);
    expect(dist).toBeGreaterThan(55);
    expect(dist).toBeLessThan(65);
  });
});
