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
