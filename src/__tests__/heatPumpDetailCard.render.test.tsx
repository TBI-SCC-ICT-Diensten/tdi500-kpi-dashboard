import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import HeatPumpDetailCard from '../components/detail/HeatPumpDetailCard';
import type { HeatPumpSystem } from '../types/heatpump';

/**
 * CHARACTERIZATION for HeatPumpDetailCard's in-render COP-delta scoring (was 0%
 * covered) + the oplostermijn rendering. Pins CURRENT behaviour so PR-10 can move
 * these into useHeatPumpDetail and prove nothing changed.
 *
 * expectedCop = estimateExpectedCop(7, '2') = 3.5 (real). So:
 *   copDelta = actualCop - 3.5;  good >= -0.3, warning >= -0.8, else critical.
 */
const theme = createTheme();

const pumpWithCop = (cop: number): HeatPumpSystem => ({
  id: 'hp-cop',
  uri: 'u',
  status: 'active',
  measurements: [{ property: 'cop', value: cop, unit: '', rawUnit: '' }],
  errorCodes: [],
});

const renderCard = (cop: number) =>
  render(
    <ThemeProvider theme={theme}>
      <HeatPumpDetailCard
        heatPump={pumpWithCop(cop)}
        outdoorTempCelsius={7}
        supplyTemperatureClass="2"
      />
    </ThemeProvider>
  );

describe('HeatPumpDetailCard — COP-delta scoring (characterization)', () => {
  it('within 0.3 of expected → good (no "onder verwachting" line)', () => {
    renderCard(3.5); // delta 0
    expect(screen.getByText(/verwacht 3\.5/)).toBeInTheDocument();
    expect(screen.queryByText(/onder verwachting/)).not.toBeInTheDocument();
  });

  it('0.3–0.8 below expected → warning "Licht onder verwachting"', () => {
    renderCard(3.0); // delta -0.5
    expect(screen.getByText(/Licht onder verwachting bij 7\.0°C/)).toBeInTheDocument();
  });

  it('more than 0.8 below expected → critical "… onder verwachting … — controleren"', () => {
    renderCard(2.0); // delta -1.5
    expect(screen.getByText(/1\.5 onder verwachting bij 7\.0°C — controleren/)).toBeInTheDocument();
  });

  it('no outdoor-temp context → COP renders plainly (no expected / no advisory)', () => {
    render(
      <ThemeProvider theme={theme}>
        <HeatPumpDetailCard heatPump={pumpWithCop(3.0)} />
      </ThemeProvider>
    );
    expect(screen.queryByText(/verwacht/)).not.toBeInTheDocument();
    expect(screen.queryByText(/onder verwachting/)).not.toBeInTheDocument();
  });

  it('renders an oplostermijn chip for an error code', () => {
    const pump: HeatPumpSystem = {
      id: 'hp-err',
      uri: 'u',
      status: 'error',
      measurements: [],
      errorCodes: [{ code: 'E01', message: 'Storing', severity: 'high' }],
    };
    render(
      <ThemeProvider theme={theme}>
        <HeatPumpDetailCard heatPump={pump} />
      </ThemeProvider>
    );
    expect(screen.getByTestId('pump-oplostermijn')).toBeInTheDocument();
  });
});
