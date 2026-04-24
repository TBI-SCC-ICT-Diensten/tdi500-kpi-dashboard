/**
 * Component render tests for HeatPumpCommandPanel.
 *
 * Complements the validation-only heatPumpCommandPanel.test.ts
 * by actually mounting the component with @testing-library/react.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import HeatPumpCommandPanel from '../components/dashboard/HeatPumpCommandPanel';
import { makeHeatPump } from '../test/fixtures';

// Mock the command service so no real API calls happen
vi.mock('../services/heatPumpCommandService', () => ({
  setTemperatureSetpoint: vi.fn().mockResolvedValue(undefined),
  setHeatingCurve:        vi.fn().mockResolvedValue(undefined),
}));

const theme = createTheme();
const renderPanel = (pump = makeHeatPump()) =>
  render(
    <ThemeProvider theme={theme}>
      <HeatPumpCommandPanel heatPump={pump} />
    </ThemeProvider>
  );

describe('HeatPumpCommandPanel', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders expand trigger when collapsed', () => {
    renderPanel();
    expect(screen.getByText(/inregelinstellingen/i)).toBeInTheDocument();
  });

  it('shows offline warning for offline pumps and disables submit buttons', () => {
    const offlinePump = makeHeatPump({
      status: 'offline',
      internetConnection: 'disconnected',
    });
    renderPanel(offlinePump);
    fireEvent.click(screen.getByText(/inregelinstellingen/i));

    // Offline banner is rendered
    expect(
      screen.getByText(/warmtepomp offline.*commando/i)
    ).toBeInTheDocument();

    // All "Instellen" buttons should be disabled
    const buttons = screen.getAllByRole('button', { name: /instellen/i });
    buttons.forEach((btn) => expect(btn).toBeDisabled());
  });

  it('expands to show setpoint and stooklijn forms on click', () => {
    renderPanel();
    fireEvent.click(screen.getByText(/inregelinstellingen/i));
    expect(screen.getByText(/temperatuur setpoint/i)).toBeInTheDocument();
    expect(screen.getByText(/^stooklijn$/i)).toBeInTheDocument();
  });

  it('disables setpoint submit when value is cleared', () => {
    renderPanel();
    fireEvent.click(screen.getByText(/inregelinstellingen/i));

    // Clear the setpoint input (pre-filled from the measurement)
    const setpointInput = screen.getByLabelText(/setpoint.*°c/i);
    fireEvent.change(setpointInput, { target: { value: '' } });

    // First "Instellen" button is the setpoint submit
    const buttons = screen.getAllByRole('button', { name: /instellen/i });
    expect(buttons[0]).toBeDisabled();
  });
});
