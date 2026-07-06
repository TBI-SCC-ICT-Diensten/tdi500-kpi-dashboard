import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusPill, { type PumpStatus } from '../components/common/StatusPill';

/**
 * StatusPill — patroonzetter-test van de MUI→Tailwind-migratie.
 *
 * Testpatroon voor gemigreerde componenten: (1) gedrag via gerenderde tekst,
 * (2) de semantische data-status-hook, (3) een PAAR dragende classes via
 * toHaveClass — geen uitputtende class-lijsten (broos).
 *
 * NB jsdom draait geen CSS-pijplijn: dit bewijst de class-STRINGS (het
 * contract met tailwind.config.js), geen pixels. Licht-modus-pixels bewijst
 * de Playwright e2e; de dark:-varianten renderen pas na de dark-unificatie.
 */

const CASES: Array<{
  status: PumpStatus;
  label: string;
  classes: string[];
}> = [
  { status: 'active',  label: 'Gezond',       classes: ['bg-success-100', 'text-success-800', 'dark:bg-success-600/15', 'dark:text-success-300'] },
  { status: 'warning', label: 'Waarschuwing', classes: ['bg-warning-100', 'text-warning-800', 'dark:text-warning-300'] },
  { status: 'error',   label: 'Storing',      classes: ['bg-danger-100', 'text-danger-800', 'dark:text-danger-300'] },
  { status: 'offline', label: 'Offline',      classes: ['bg-slate-100', 'text-slate-600', 'dark:bg-overlay-10', 'dark:text-slate-400'] },
  { status: 'unknown', label: 'Onbekend',     classes: ['bg-slate-100', 'text-slate-600'] },
];

describe('StatusPill — status → label + tint-paar-classes', () => {
  it.each(CASES)('$status → "$label" met de juiste tint-classes', ({ status, label, classes }) => {
    render(<StatusPill status={status} />);
    const pill = screen.getByText(label);
    expect(pill).toHaveAttribute('data-status', status);
    expect(pill).toHaveClass(...classes);
  });

  it('draagt de gedeelde pil-vorm (rounded-full, 2xs, icoon+label — J2)', () => {
    render(<StatusPill status="active" />);
    const pill = screen.getByText('Gezond');
    expect(pill).toHaveClass('rounded-full', 'text-2xs', 'inline-flex');
    // Icoon altijd gepaard met het label (inline SVG op currentColor, geen MUI).
    const icon = pill.querySelector('svg');
    expect(icon).not.toBeNull();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).toHaveAttribute('fill', 'currentColor');
  });

  it('unknown deelt de offline-styling maar houdt een eigen label', () => {
    render(<StatusPill status="unknown" />);
    const pill = screen.getByText('Onbekend');
    expect(pill).toHaveAttribute('data-status', 'unknown');
    expect(pill).toHaveClass('bg-slate-100');
  });
});
