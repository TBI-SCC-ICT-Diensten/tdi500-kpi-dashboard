import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import WeatherWidget from '../components/bag/WeatherWidget';
import type { WeatherObservation } from '../services/weatherService';

/**
 * CHARACTERIZATION for WeatherWidget's weather→COP advisory (was 0% covered).
 * Pins the CURRENT branch behaviour so PR-10 can move `copContext` into a hook
 * and prove nothing changed. fetchWeather is mocked; estimateExpectedCop runs real.
 */
vi.mock('../services/weatherService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/weatherService')>();
  return { ...actual, fetchWeather: vi.fn() };
});
import { fetchWeather } from '../services/weatherService';

const theme = createTheme();

const obs = (temperatureCelsius: number): WeatherObservation => ({
  temperatureCelsius,
  feelsLikeCelsius: temperatureCelsius - 2,
  windSpeedMs: 3,
  windDirectionDeg: 180,
  precipitationMm: 0,
  relativeHumidity: 80,
  weatherCode: 3,
  weatherDescription: 'Bewolkt',
  observationTime: '2026-01-01T10:00:00Z',
  isValid: true,
});

const renderWidget = () =>
  render(
    <ThemeProvider theme={theme}>
      <WeatherWidget rdCoordinates={[85000, 446000]} supplyTemperatureClass="2" />
    </ThemeProvider>
  );

describe('WeatherWidget — weather→COP advisory (characterization)', () => {
  beforeEach(() => vi.mocked(fetchWeather).mockReset());

  it('cold day (< 0°C) → "Koude dag" advisory', async () => {
    vi.mocked(fetchWeather).mockResolvedValue(obs(-5));
    renderWidget();
    expect(await screen.findByText(/Koude dag/)).toBeInTheDocument();
  });

  it('mild day (> 10°C) → "Mild weer" advisory', async () => {
    vi.mocked(fetchWeather).mockResolvedValue(obs(15));
    renderWidget();
    expect(await screen.findByText(/Mild weer/)).toBeInTheDocument();
  });

  it('normal range (0–10°C) → "Normale stookomstandigheden"', async () => {
    vi.mocked(fetchWeather).mockResolvedValue(obs(5));
    renderWidget();
    expect(await screen.findByText(/Normale stookomstandigheden/)).toBeInTheDocument();
  });

  it('renders the expected-COP block for a valid observation', async () => {
    vi.mocked(fetchWeather).mockResolvedValue(obs(5));
    renderWidget();
    expect(await screen.findByText(/COP-verwachting bij/)).toBeInTheDocument();
  });

  it('shows a fallback message when the observation is unavailable', async () => {
    vi.mocked(fetchWeather).mockResolvedValue(null);
    renderWidget();
    expect(await screen.findByText(/Weerdata tijdelijk niet beschikbaar/)).toBeInTheDocument();
  });
});
