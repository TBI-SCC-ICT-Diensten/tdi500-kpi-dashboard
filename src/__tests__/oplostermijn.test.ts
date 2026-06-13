import { describe, it, expect } from 'vitest';
import { bepaalOplostermijn, OPLOSTERMIJN_DAGEN } from '../utils/oplostermijn';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Format a date the same way the util does, for deterministic label assertions. */
const datumNl = (d: Date) =>
  d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });

describe('bepaalOplostermijn', () => {
  it('critical → termijn 0, status direct, label "Direct"', () => {
    const result = bepaalOplostermijn('critical', '2026-06-01T00:00:00.000Z');
    expect(result.termijnDagen).toBe(0);
    expect(result.status).toBe('direct');
    expect(result.resolveBy).toBeNull();
    expect(result.label).toContain('Direct');
  });

  it("treats 'error' severity as direct (gelijk aan critical)", () => {
    const result = bepaalOplostermijn('error', '2026-06-01T00:00:00.000Z');
    expect(OPLOSTERMIJN_DAGEN.error).toBe(0);
    expect(result.status).toBe('direct');
    expect(result.label).toContain('Direct');
  });

  it('high with detectedAt → resolveBy = detectedAt + 7 dagen, status open', () => {
    const detectedAt = '2026-06-01T00:00:00.000Z';
    const now = new Date('2026-06-02T00:00:00.000Z');
    const result = bepaalOplostermijn('high', detectedAt, now);

    const expected = new Date(new Date(detectedAt).getTime() + 7 * MS_PER_DAY);
    expect(result.termijnDagen).toBe(7);
    expect(result.status).toBe('open');
    expect(result.resolveBy?.getTime()).toBe(expected.getTime());
    expect(result.label).toContain(datumNl(expected));
    expect(result.label).toContain('Te verhelpen vóór');
  });

  it('warning with detectedAt → resolveBy = detectedAt + 30 dagen, status open', () => {
    const detectedAt = '2026-06-01T00:00:00.000Z';
    const now = new Date('2026-06-05T00:00:00.000Z');
    const result = bepaalOplostermijn('warning', detectedAt, now);

    const expected = new Date(new Date(detectedAt).getTime() + 30 * MS_PER_DAY);
    expect(result.termijnDagen).toBe(30);
    expect(result.status).toBe('open');
    expect(result.resolveBy?.getTime()).toBe(expected.getTime());
  });

  it('high whose resolveBy is in the past → status overschreden', () => {
    const detectedAt = '2026-01-01T00:00:00.000Z'; // resolveBy 2026-01-08
    const now = new Date('2026-06-01T00:00:00.000Z');
    const result = bepaalOplostermijn('high', detectedAt, now);

    expect(result.status).toBe('overschreden');
    expect(result.label).toContain('overschreden');
  });

  it('missing detectedAt → resolveBy null, fallback label "Binnen N dagen"', () => {
    const result = bepaalOplostermijn('high');
    expect(result.resolveBy).toBeNull();
    expect(result.status).toBe('open');
    expect(result.label).toBe('Binnen 7 dagen');
  });

  it('boundary: resolveBy exactly == now is not yet overschreden', () => {
    const detectedAt = '2026-06-01T00:00:00.000Z';
    const now = new Date(new Date(detectedAt).getTime() + 7 * MS_PER_DAY); // == resolveBy
    const result = bepaalOplostermijn('high', detectedAt, now);

    expect(result.resolveBy?.getTime()).toBe(now.getTime());
    expect(result.status).toBe('open');
  });

  it('low / unknown severity → geen vaste termijn', () => {
    const low = bepaalOplostermijn('low', '2026-06-01T00:00:00.000Z');
    expect(low.termijnDagen).toBeNull();
    expect(low.status).toBe('open');
    expect(low.label).toBe('Geen vaste oplostermijn');

    const unknown = bepaalOplostermijn('iets-onbekends', '2026-06-01T00:00:00.000Z');
    expect(unknown.termijnDagen).toBeNull();
    expect(unknown.label).toBe('Geen vaste oplostermijn');
  });
});
