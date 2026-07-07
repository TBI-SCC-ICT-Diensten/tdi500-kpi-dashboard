import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import StatusDot from '../components/common/StatusDot';
import type { HeatPumpStatus } from '../types/heatpump';

/**
 * StatusDot — #172-testpatroon: data-status-hook + dragende solide classes.
 * NB jsdom bewijst class-strings; pixels bewijst de (dark-)e2e. Semantische
 * stippen zijn modus-invariant (geen dark:); alleen offline heeft er één.
 */

const renderDot = (status: HeatPumpStatus) => {
  const { container } = render(<StatusDot status={status} />);
  const dot = container.querySelector('[data-status]');
  expect(dot).not.toBeNull();
  return dot as HTMLElement;
};

describe('StatusDot — status → solide dot-kleur', () => {
  it.each([
    { status: 'active' as const,  cls: 'bg-success-600' },
    { status: 'warning' as const, cls: 'bg-warning-600' },
    { status: 'error' as const,   cls: 'bg-danger-600' },
  ])('$status → $cls (modus-invariant: geen dark:-variant)', ({ status, cls }) => {
    const dot = renderDot(status);
    expect(dot).toHaveAttribute('data-status', status);
    expect(dot).toHaveClass('rounded-full', 'w-2', 'h-2', cls);
    expect(dot.className).not.toContain('dark:');
  });

  it('offline → canoniek slate-500, lichter (slate-400) in dark (divergentie-2)', () => {
    const dot = renderDot('offline');
    expect(dot).toHaveClass('bg-slate-500', 'dark:bg-slate-400');
  });

  it('unknown → zelfde neutrale stip als offline (seam-default-tak)', () => {
    const dot = renderDot('unknown');
    expect(dot).toHaveAttribute('data-status', 'unknown');
    expect(dot).toHaveClass('bg-slate-500', 'dark:bg-slate-400');
  });

  it('onbekende runtime-waarde valt in de neutrale default (oud ??-fallbackgedrag)', () => {
    const dot = renderDot('vreemd' as HeatPumpStatus);
    expect(dot).toHaveClass('bg-slate-500');
  });
});
