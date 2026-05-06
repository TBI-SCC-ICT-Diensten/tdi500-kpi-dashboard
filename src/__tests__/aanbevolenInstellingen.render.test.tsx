import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AanbevolenInstellingen from '../components/bag/AanbevolenInstellingen';

const theme = createTheme();
const renderFor = (code: 'A1' | 'B2' | 'C3') =>
  render(
    <ThemeProvider theme={theme}>
      <AanbevolenInstellingen kruisProfielCode={code} />
    </ThemeProvider>
  );

describe('AanbevolenInstellingen', () => {
  it('renders all 4 fabrikant tabs', () => {
    renderFor('B2');
    expect(screen.getByRole('tab', { name: 'Intergas' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Bosch' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Remeha' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Alklima' })).toBeInTheDocument();
  });

  it('shows all 11 parameter labels', () => {
    renderFor('B2');
    expect(screen.getByText('Warmtepomp type')).toBeInTheDocument();
    expect(screen.getByText('Afgiftesysteem')).toBeInTheDocument();
    expect(screen.getByText('Max. aanvoertemperatuur')).toBeInTheDocument();
    expect(screen.getByText('Minimale COP')).toBeInTheDocument();
    expect(screen.getByText('Stooklijn')).toBeInTheDocument();
    expect(screen.getByText('Ruimte-invloed')).toBeInTheDocument();
    expect(screen.getByText('Vrijgave bijverwarming')).toBeInTheDocument();
    expect(screen.getByText('Wachttijd back-up (min)')).toBeInTheDocument();
    expect(screen.getByText('Hybride modus')).toBeInTheDocument();
    expect(screen.getByText('Delta T')).toBeInTheDocument();
    expect(screen.getByText('T bivalent punt')).toBeInTheDocument();
  });

  it('switches fabrikant panel when clicking a tab', () => {
    renderFor('B2');
    // Default = first available. Tab to Bosch and verify a
    // Bosch-specific value shows up.
    fireEvent.click(screen.getByRole('tab', { name: 'Bosch' }));
    // Bosch B2 stooklijn is "20/22, -10/45"
    expect(screen.getByText('20/22, -10/45')).toBeInTheDocument();
  });

  it('renders null catalogus values as "Niet opgegeven"', () => {
    renderFor('B2');
    // Switch to Intergas for B2 — many fields are null
    fireEvent.click(screen.getByRole('tab', { name: 'Intergas' }));
    const muted = screen.getAllByText('Niet opgegeven');
    expect(muted.length).toBeGreaterThan(0);
  });

  it('renders the disabled Toepassen button with tooltip wrapper', () => {
    renderFor('B2');
    const button = screen.getByRole('button', { name: /toepassen op warmtepomp/i });
    expect(button).toBeDisabled();
  });
});
