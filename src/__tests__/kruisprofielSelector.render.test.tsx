import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { RoleProvider } from '../context/RoleContext';
import DashboardPage from '../pages/DashboardPage';

/* De data-hook gemockt (jsdom heeft geen netwerk): één contingent is genoeg
 * om de kruisprofiel-sectie te laten renderen; selectedContingent null houdt
 * de datazware secties uit beeld. */
vi.mock('../hooks/useDashboardData', () => ({
  default: () => ({
    contingents: [{ id: 'c1', name: 'Testcontingent' }],
    selectedContingent: null,
    kpis: [],
    minCop: 0,
    isLoading: false,
    error: null,
  }),
}));

/**
 * TDD-eerst voor cluster C2 (DashboardPage-helft): de twee kruisprofiel-
 * ToggleButtonGroups → owned ToggleGroup (variant a, stock-MUI-look met
 * uppercase) en de Profiel-chip → owned Chip color=primary (merk, geen
 * status). BEHOUD: de zes kruisprofiel-*-testids. Alle overige MUI
 * (Typography/Box/Grid/kaarten) blijft — class-smoke, geen uitputtendheid.
 */

const renderPage = () =>
  render(
    <ThemeProvider theme={createTheme()}>
      <MemoryRouter>
        <RoleProvider>
          <DashboardPage />
        </RoleProvider>
      </MemoryRouter>
    </ThemeProvider>
  );

describe('DashboardPage — kruisprofiel-cluster (C2)', () => {
  it('de zes kruisprofiel-testids bestaan als aria-pressed-buttons (geen MUI ToggleButton)', async () => {
    const { container } = renderPage();
    const ids = [
      'kruisprofiel-isolatie-a', 'kruisprofiel-isolatie-b', 'kruisprofiel-isolatie-c',
      'kruisprofiel-afgifte-vloer', 'kruisprofiel-afgifte-radiator', 'kruisprofiel-afgifte-hetelucht',
    ];
    for (const id of ids) {
      const el = await screen.findByTestId(id);
      expect(el.tagName).toBe('BUTTON');
      expect(el).toHaveAttribute('aria-pressed');
    }
    expect(container.querySelector('.MuiToggleButton-root')).toBeNull();
    expect(container.querySelector('.MuiToggleButtonGroup-root')).toBeNull();
  });

  it('precies één isolatie- en één afgifte-item is geselecteerd (het actieve kruisprofiel)', async () => {
    renderPage();
    await screen.findByTestId('kruisprofiel-isolatie-a');
    const pressed = document.querySelectorAll('[data-testid^="kruisprofiel-"][aria-pressed="true"]');
    expect(pressed.length).toBe(2);
  });

  it('de Profiel-chip is de owned merk-chip (bg-primary, pilvorm), geen MUI Chip', async () => {
    const { container } = renderPage();
    await screen.findByTestId('kruisprofiel-isolatie-a');
    const chip = screen.getByText(/^Profiel [ABC][123]$/);
    expect(chip.className).toContain('bg-primary');
    expect(chip.className).toContain('rounded-full');
    expect(chip.tagName).toBe('SPAN');
    expect(container.querySelector('.MuiChip-root')).toBeNull();
  });

  it('de stock-MUI-look blijft: uppercase + de gemeten metriek-overrides op de items', async () => {
    renderPage();
    const item = await screen.findByTestId('kruisprofiel-isolatie-a');
    expect(item.className).toContain('uppercase');
    expect(item.className).toContain('leading-[1.75]');
    expect(item.className).toContain('px-[7px]');
  });
});
