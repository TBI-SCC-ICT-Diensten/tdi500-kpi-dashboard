import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import KpiOverviewPanel from '../components/dashboard/KpiOverviewPanel';
import type { KeyPerformanceIndicator, KpiStatus } from '../types/heatpump';

/**
 * KpiOverviewPanel — shell-closure (#177-leaf + deze shell = de kaart dicht).
 * Eerste GESTRUCTUREERDE shell op de flat Card-primitive: 1:1-spiegel van de
 * MUI-subcomponenten (Card + CardContent, GEEN CardHeader — het MUI-origineel
 * had er ook geen; CardHeader blijft gereserveerd voor echte in-kaart-headers).
 * Class-smoke per #172-patroon: shell-classes + padding-fideliteit (p-4 pb-3,
 * níet shadcn's p-6 pt-0-default) + de links-ONLY accent-rand uit het nieuwe
 * STATUS_CARD_ACCENT_CLASSES-seam-record + de :78-Divider → Separator.
 * jsdom bewijst class-strings; pixels bewijst de (dark-)e2e.
 */

const makeKpi = (id: string, status: KpiStatus): KeyPerformanceIndicator => ({
  id,
  name: 'COP',
  value: 4.2,
  unit: '',
  category: 'efficiency',
  status,
});

describe('KpiOverviewPanel — Card-shell (flat shadcn Card + Separator)', () => {
  it('rendert de KPI-kaart als flat shadcn Card: testid + shell-classes + p-4 pb-3 CardContent', () => {
    render(<KpiOverviewPanel kpis={[makeKpi('cop', 'good')]} />);
    const card = screen.getByTestId('kpi-card-cop');

    // Flat surface-primitive (#180-edits) + de shell-layout van de MUI-kaart.
    expect(card).toHaveClass(
      'rounded', 'border', 'border-border', 'bg-card', 'h-full', 'min-h-[120px]'
    );
    expect(card.className).not.toContain('shadow');

    // Padding-fideliteit: MUI CardContent = 16px + pb 12px (het sx-!important
    // dat MUI's last-child-24px killde) — NIET shadcn's p-6 pt-0-default.
    const content = card.firstElementChild as HTMLElement;
    expect(content).toHaveClass('p-4', 'pb-3');
    expect(content.className).not.toMatch(/\bp-6\b|\bpt-0\b/);

    // De :78-Divider → Separator (Radix, horizontaal, bg-border, my-1.5 = 6px).
    const separator = content.querySelector('[data-orientation="horizontal"]');
    expect(separator).not.toBeNull();
    expect(separator).toHaveClass('bg-border', 'my-1.5');

    // e2e-contract: de status-chip ([data-semantic], de #177-leaf) genest in de kaart.
    expect(card.querySelector('[data-semantic]')).not.toBeNull();
  });

  it.each([
    { status: 'good' as const,     accent: 'border-l-success-600' },
    { status: 'warning' as const,  accent: 'border-l-warning-600' },
    { status: 'critical' as const, accent: 'border-l-danger-600' },
  ])('$status → linker accent-rand $accent (links-only record, border-l-4)',
    ({ status, accent }) => {
      render(<KpiOverviewPanel kpis={[makeKpi(`x-${status}`, status)]} />);
      const card = screen.getByTestId(`kpi-card-x-${status}`);
      expect(card).toHaveClass('border-l-4', accent);
      // Links-ONLY: de all-side -600-kleur zou het hele 1px border-border-kader
      // meekleuren — die mag hier dus NIET voorkomen.
      expect(card.className).not.toMatch(/\bborder-(success|warning|danger)-600\b/);
    });

  it('rendert niets bij lege kpis (bestaand gedrag)', () => {
    const { container } = render(<KpiOverviewPanel kpis={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
