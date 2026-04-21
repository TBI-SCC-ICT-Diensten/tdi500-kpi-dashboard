import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchWeather, estimateExpectedCop } from '../services/weatherService';

const mockResponse = {
  current: {
    time:                 '2024-01-15T14:00',
    temperature_2m:       8.4,
    apparent_temperature: 5.9,
    relative_humidity_2m: 78,
    precipitation:        0.0,
    weather_code:         2,
    wind_speed_10m:       4.2,
    wind_direction_10m:   225,
  },
};

describe('fetchWeather', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);
  });

  it('returns valid observation for Rotterdam', async () => {
    const result = await fetchWeather(51.92, 4.48);
    expect(result?.isValid).toBe(true);
    expect(result?.temperatureCelsius).toBe(8.4);
    expect(result?.feelsLikeCelsius).toBe(5.9);
    expect(result?.windSpeedMs).toBe(4.2);
    expect(result?.windDirectionDeg).toBe(225);
    expect(result?.precipitationMm).toBe(0.0);
  });

  it('maps WMO code 2 to Dutch description', async () => {
    const result = await fetchWeather(51.92, 4.48);
    expect(result?.weatherDescription).toBe('Gedeeltelijk bewolkt');
  });

  it('returns null on API failure', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      { ok: false, status: 503 } as Response
    );
    expect(await fetchWeather(51.92, 4.48)).toBeNull();
  });

  it('returns null on network error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    expect(await fetchWeather(51.92, 4.48)).toBeNull();
  });

  it('includes lat/lon and wind_speed_unit=ms in request URL', async () => {
    await fetchWeather(52.3731, 4.8922);
    const url = ((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] ?? '') as string;
    expect(url).toContain('latitude=52.373100');
    expect(url).toContain('longitude=4.892200');
    expect(url).toContain('wind_speed_unit=ms');
  });

  it('marks observation invalid when temperature is null', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        current: { ...mockResponse.current, temperature_2m: null },
      }),
    } as unknown as Response);
    const result = await fetchWeather(52.0, 5.0);
    expect(result?.isValid).toBe(false);
  });
});

describe('estimateExpectedCop', () => {
  it('returns higher COP for supply class 1 than class 3', () => {
    expect(estimateExpectedCop(7, '1')).toBeGreaterThan(
      estimateExpectedCop(7, '3')
    );
  });

  it('returns lower COP at -5°C than at +7°C', () => {
    expect(estimateExpectedCop(-5, '2')).toBeLessThan(
      estimateExpectedCop(7, '2')
    );
  });

  it('returns higher COP at +15°C than at +7°C', () => {
    expect(estimateExpectedCop(15, '2')).toBeGreaterThan(
      estimateExpectedCop(7, '2')
    );
  });

  it('never returns COP below 1.0', () => {
    expect(estimateExpectedCop(-40, '3')).toBeGreaterThanOrEqual(1.0);
  });

  it('defaults to supply class 2 baseline when no class given', () => {
    expect(estimateExpectedCop(7)).toBe(3.5);
  });
});
