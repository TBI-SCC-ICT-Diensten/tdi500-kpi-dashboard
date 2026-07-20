/**
 * Component render tests for BagLookupPage.
 *
 * BagLookupPage is the page closest to the installer's real workflow.
 * Covering it with render tests protects the most important page
 * before Path A redesign.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import BagLookupPage from '../pages/BagLookupPage';
import { RoleProvider } from '../context/RoleContext';
import type { BagResult } from '../services/bagService';

// Mock bagService — keep the non-fetch helpers intact so the page can
// still call mapBouwjaarToInsulation / mapEnergielabelToInsulation /
// mapAfgifteToClass / deriveKruisProfielCode.
vi.mock('../services/bagService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/bagService')>();
  return {
    ...actual,
    fetchBagData: vi.fn().mockResolvedValue({
      weergavenaam:          'Bilderdijkstraat 100, 3027SN Rotterdam',
      straatnaam:            'Bilderdijkstraat',
      huisnummer:            '100',
      postcode:              '3027SN',
      woonplaatsnaam:        'Rotterdam',
      bouwjaar:              1921,
      oppervlakte:           70,
      gebruiksdoel:          'woonfunctie',
      gebruiksdoelen:        ['woonfunctie'],
      pandStatus:            null,
      energielabel:          'B',
      energielabelGeldigTot: '2028-08-27',
      rdCoordinates:         [92294.3, 436830.56],
    } as BagResult),
  };
});

// Mock WeatherWidget to avoid network + rdToWgs84 logic in the page test
vi.mock('../components/bag/WeatherWidget', () => ({
  __esModule: true,
  default: () => <div data-testid="weather-widget-stub" />,
}));

const theme = createTheme();
const renderPage = () =>
  render(
    <RoleProvider>
      <MemoryRouter>
        <ThemeProvider theme={theme}>
          <BagLookupPage />
        </ThemeProvider>
      </MemoryRouter>
    </RoleProvider>
  );

describe('BagLookupPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders step 1 address input form', () => {
    renderPage();
    expect(screen.getByLabelText(/postcode/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/huisnummer/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ophalen/i })).toBeInTheDocument();
  });

  it('shows BAG result after successful lookup', async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/postcode/i),  { target: { value: '3027SN' } });
    fireEvent.change(screen.getByLabelText(/huisnummer/i), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: /ophalen/i }));

    await waitFor(() => {
      expect(screen.getByText(/bilderdijkstraat 100/i)).toBeInTheDocument();
    });
    // bouwjaar and oppervlakte rendered in the result grid
    expect(screen.getByText(/1921/)).toBeInTheDocument();
    expect(screen.getByText(/70 m²/)).toBeInTheDocument();
  });

  it('derives insulation from the energielabel (wins over bouwjaar)', async () => {
    // mock returns energielabel 'B' (→ class A) AND bouwjaar 1921 (→ class C):
    // the energielabel must win. CHARACTERIZATION of the precedence.
    renderPage();
    fireEvent.change(screen.getByLabelText(/postcode/i),  { target: { value: '3027SN' } });
    fireEvent.change(screen.getByLabelText(/huisnummer/i), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: /ophalen/i }));
    expect(await screen.findByText(/Energielabel B → isolatieklasse A/)).toBeInTheDocument();
  });

  it('shows all three afgiftesysteem options after BAG result loads', async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/postcode/i),  { target: { value: '3027SN' } });
    fireEvent.change(screen.getByLabelText(/huisnummer/i), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: /ophalen/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /vloerverwarming/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /radiator/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /hete lucht/i })).toBeInTheDocument();
  });
});

/**
 * Cluster C3 (Tier-1-run): de twee insulation-chips → owned Chip (solid-status
 * + outlined) en de afgifte-ToggleButtonGroup → owned ToggleGroup variant
 * 'pills'. TDD-eerst; class-smoke, geen uitputtendheid (playbook §5).
 */
describe('BagLookupPage — C3-migratie (owned Chip + pills-ToggleGroup)', () => {
  const lookup = async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/postcode/i), { target: { value: '3027SN' } });
    fireEvent.change(screen.getByLabelText(/huisnummer/i), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: /ophalen/i }));
    await waitFor(() => {
      expect(screen.getByText(/^Klasse [ABC]$/)).toBeInTheDocument();
    });
  };

  it('de Klasse-chip is de owned solid-status-chip (span, pil, seam-solid)', async () => {
    await lookup();
    const chip = screen.getByText(/^Klasse [ABC]$/);
    expect(chip.tagName).toBe('SPAN');
    expect(chip.className).toContain('rounded-full');
    expect(chip.className).toContain('text-2xs');
    expect(chip.className).toMatch(/bg-success-600|bg-warning-600|bg-danger-600/);
    expect(document.querySelector('.MuiChip-root')).toBeNull();
  });

  it('de Betrouwbaarheid-chip is outlined: transparant met -600-rand en -700 tekst', async () => {
    await lookup();
    const chip = screen.getByText(/^Betrouwbaarheid:/);
    expect(chip.tagName).toBe('SPAN');
    expect(chip.className).toContain('bg-transparent');
    expect(chip.className).toMatch(/border-(success|warning)-600|border-slate-300/);
  });

  it('de afgifte-keuze is een pills-ToggleGroup: role=group, aria-pressed, rounded-lg', async () => {
    await lookup();
    const group = screen.getByRole('group', { name: /afgiftesysteem/i });
    expect(group).toBeInTheDocument();
    const vloer = screen.getByRole('button', { name: /vloerverwarming/i });
    expect(vloer).toHaveAttribute('aria-pressed', 'false');
    expect(vloer.className).toContain('rounded-lg');
    expect(document.querySelector('.MuiToggleButton-root')).toBeNull();
    fireEvent.click(vloer);
    expect(vloer).toHaveAttribute('aria-pressed', 'true');
  });
});
