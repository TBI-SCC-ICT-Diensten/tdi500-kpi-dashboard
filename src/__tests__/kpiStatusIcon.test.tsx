import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import KpiStatusIcon from '../components/dashboard/KpiStatusIcon';
import type { KpiStatus } from '../types/heatpump';

/**
 * KpiStatusIcon — #172-testpatroon: gedrag (icoon rendert per status) +
 * data-hook + dragende seam-classes (niet uitputtend). De status-familie-CLOSER:
 * de KPI-statuslevels (good/warning/critical) bucketen via kpiStatusToSemantic
 * (gesloten drietal, géén offline — als decisionScore) naar de canonieke
 * semantiek. De tint-chip is de SURFACE-voor-een-graphic representatie
 * (STATUS_TINT_BG_CLASSES, achtergrond-only, bg-*-100) — niet het tekst-tintpaar;
 * het icoon draagt de levendige -600 (STATUS_ICON_CLASSES, modus-invariant).
 * jsdom bewijst class-strings; pixels bewijst de (dark-)e2e.
 */

const renderIcon = (status: KpiStatus) => {
  const { container } = render(<KpiStatusIcon status={status} />);
  const chip = container.querySelector('[data-semantic]');
  expect(chip).not.toBeNull();
  return chip as HTMLElement;
};

describe('KpiStatusIcon — KPI-status → canonieke semantiek (status-familie closer)', () => {
  it.each([
    { status: 'good' as const,     semantic: 'healthy', bg: 'bg-success-100', icon: 'text-success-600' },
    { status: 'warning' as const,  semantic: 'warning', bg: 'bg-warning-100', icon: 'text-warning-600' },
    { status: 'critical' as const, semantic: 'danger',  bg: 'bg-danger-100',  icon: 'text-danger-600' },
  ])('$status → $semantic: tint-surface -100 + icoon -600',
    ({ status, semantic, bg, icon }) => {
      const chip = renderIcon(status);
      expect(chip).toHaveAttribute('data-semantic', semantic);

      // Tint-SURFACE (achtergrond-only, geen tekst-tint): bg-*-100.
      expect(chip).toHaveClass(bg);

      // Icoon rendert per status: inline SVG op currentColor, canonieke -600.
      const svg = chip.querySelector('svg');
      expect(svg).not.toBeNull();
      expect(svg).toHaveAttribute('fill', 'currentColor');
      expect(svg as unknown as HTMLElement).toHaveClass(icon);
    });
});
