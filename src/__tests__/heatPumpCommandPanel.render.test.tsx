/**
 * Component render tests for HeatPumpCommandPanel.
 *
 * Complements the validation-only heatPumpCommandPanel.test.ts
 * by actually mounting the component with @testing-library/react.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import HeatPumpCommandPanel from '../components/dashboard/HeatPumpCommandPanel';
import { setDataSource } from '../services/hupieApi';
import { setTemperatureSetpoint } from '../services/heatPumpCommandService';
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

describe('HeatPumpCommandPanel — confirmation step (live mode)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setDataSource('live');
  });
  afterEach(() => setDataSource('live'));

  const expand = () => fireEvent.click(screen.getByText(/inregelinstellingen/i));
  const submitSetpoint = () => {
    const btn = screen.getAllByRole('button', { name: /instellen/i })[0];
    if (!btn) throw new Error('Instellen button not found');
    fireEvent.click(btn);
  };

  it('asks for confirmation naming the pump and value, and does not send until confirmed', () => {
    renderPanel(); // test-pump-01, setpoint prefilled at 21
    expand();
    submitSetpoint();

    // Confirmation surfaced, naming pump id + value + unit
    expect(screen.getByText(/weet je het zeker/i)).toBeInTheDocument();
    expect(screen.getByText(/test-pump-01/)).toBeInTheDocument();
    expect(screen.getByText(/21\s*°C/)).toBeInTheDocument();

    // Nothing sent yet
    expect(setTemperatureSetpoint).not.toHaveBeenCalled();

    // Confirm → the write is sent for the named pump + value
    fireEvent.click(screen.getByRole('button', { name: /bevestigen/i }));
    expect(setTemperatureSetpoint).toHaveBeenCalledWith({
      heatPumpId: 'test-pump-01',
      value: 21,
    });
  });

  it('cancelling the confirmation sends nothing', () => {
    renderPanel();
    expand();
    submitSetpoint();
    fireEvent.click(screen.getByRole('button', { name: /annuleren/i }));
    expect(setTemperatureSetpoint).not.toHaveBeenCalled();
  });
});

describe('HeatPumpCommandPanel — mock-mode signal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setDataSource('mock');
  });
  afterEach(() => setDataSource('live'));

  it('sends without a confirmation dialog and surfaces a "geen echte schrijfactie" signal', async () => {
    renderPanel();
    fireEvent.click(screen.getByText(/inregelinstellingen/i));
    const submitBtn = screen.getAllByRole('button', { name: /instellen/i })[0];
    if (!submitBtn) throw new Error('Instellen button not found');
    fireEvent.click(submitBtn);

    // No confirmation gate in mock mode
    expect(screen.queryByText(/weet je het zeker/i)).not.toBeInTheDocument();
    // Panel still drives the service (the executor simulates the write)
    expect(setTemperatureSetpoint).toHaveBeenCalledWith({
      heatPumpId: 'test-pump-01',
      value: 21,
    });
    // Unmistakable mock signal
    expect(await screen.findByText(/geen echte schrijfactie/i)).toBeInTheDocument();
  });
});
