import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import DecisionFactorRow from '../components/dashboard/DecisionFactorRow';
import type { DecisionScore } from '../types/decision';

/**
 * DecisionFactorRow — #172-testpatroon: gedrag (naam/label/tekst) + data-hook
 * + dragende seam-classes (niet uitputtend). Landt DIVERGENTIE-1: de
 * factor-score-kleuren zijn nu canoniek (success/warning/danger), niet het
 * gedempte triadje (#3b6d11/#ba7517/#a32d2d). De 0.65rem-chip gebruikt de
 * text-safe -700-stap (zijn oorspronkelijke motivatie). jsdom bewijst
 * class-strings; pixels bewijst de (dark-)e2e.
 */

const makeDetail = (score: DecisionScore['score']): DecisionScore => ({
  factor: 'COP Efficientie',
  score,
  value: 3.1,
  unit: '',
  threshold: '> 2,5 = goed',
  explanation: 'De warmtepomp presteert binnen de norm.',
});

const renderRow = (detail: DecisionScore) => {
  const { container } = render(<DecisionFactorRow detail={detail} />);
  const row = container.querySelector('[data-testid="decision-factor"]');
  expect(row).not.toBeNull();
  return row as HTMLElement;
};

describe('DecisionFactorRow — factor-score → canonieke status (divergentie-1)', () => {
  it.each([
    { score: 'good' as const,       semantic: 'healthy', label: 'Goed',        safe: 'text-success-700', border: 'border-success-600', icon: 'text-success-600' },
    { score: 'acceptable' as const, semantic: 'warning', label: 'Acceptabel',  safe: 'text-warning-700', border: 'border-warning-600', icon: 'text-warning-600' },
    { score: 'poor' as const,       semantic: 'danger',  label: 'Onvoldoende', safe: 'text-danger-700',  border: 'border-danger-600',  icon: 'text-danger-600' },
  ])('$score → $semantic: chip text-safe -700 + accent-rand -600, icoon -600',
    ({ score, semantic, label, safe, border, icon }) => {
      const row = renderRow(makeDetail(score));
      expect(row).toHaveAttribute('data-semantic', semantic);

      // Omlijnde chip: text-safe -700 (de sub-AA-casus) + accent-rand -600.
      const chip = row.querySelector('.rounded-full');
      expect(chip).not.toBeNull();
      expect(chip as HTMLElement).toHaveTextContent(label);
      expect(chip as HTMLElement).toHaveClass(safe, border);

      // Icoon: inline SVG op currentColor, canonieke -600 (STATUS_ICON_CLASSES).
      const svg = row.querySelector('svg');
      expect(svg).not.toBeNull();
      expect(svg).toHaveAttribute('fill', 'currentColor');
      expect(svg as unknown as HTMLElement).toHaveClass(icon);

      // Geen gedempt triadje meer — divergentie-1 geland.
      expect(row.innerHTML).not.toContain('#3b6d11');
      expect(row.innerHTML).not.toContain('#ba7517');
      expect(row.innerHTML).not.toContain('#a32d2d');
    });

  it('rendert factornaam, waarde, drempel en uitleg', () => {
    const row = renderRow(makeDetail('good'));
    expect(row).toHaveTextContent('COP Efficientie');
    expect(row).toHaveTextContent('3.1');
    expect(row).toHaveTextContent('Drempel: > 2,5 = goed');
    expect(row).toHaveTextContent('De warmtepomp presteert binnen de norm.');
  });

  it('waarde met eenheid krijgt een spatie-gescheiden eenheid', () => {
    const row = renderRow({ ...makeDetail('acceptable'), value: 87, unit: '%' });
    expect(row).toHaveTextContent('87 %');
  });
});
