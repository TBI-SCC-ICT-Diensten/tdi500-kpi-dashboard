import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Info } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

/**
 * shadcn Alert — TNO-getokend severity-primitief (vervangt MUI Alert).
 * Class-smoke van de project-edits: severity-varianten via het seam-tintpaar
 * (STATUS_PILL_CLASSES) + solid-chip (filled), info = sky (alert-lokaal
 * literal, GEEN seam-entry), toon-op-toon rand MET border-solid (#198 — zonder
 * expliciete border-style renderen Tailwind-randen 0-breed zonder Preflight),
 * rounded (4px, NIET rounded-lg), flex-rij met auto-severity-icoon (de stock
 * [&>svg~*]-selector breekt op raw-text children) + icon-override à la MUI.
 */

describe('shadcn Alert (TNO severity-primitief, seam-getokend)', () => {
  it('rendert role="alert" met children + data-testid-passthrough', () => {
    render(<Alert severity="info" data-testid="mijn-alert">boodschap</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('boodschap');
    expect(screen.getByTestId('mijn-alert')).toBe(alert);
  });

  it('tint-variant: success/warning/danger hergebruiken het seam-tintpaar (bg-*-100 + text-*-800)', () => {
    const { rerender } = render(<Alert severity="success">ok</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('bg-success-100', 'text-success-800');
    rerender(<Alert severity="warning">let op</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('bg-warning-100', 'text-warning-800');
    rerender(<Alert severity="danger">fout</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('bg-danger-100', 'text-danger-800');
  });

  it('tint-variant info = sky (alert-lokaal literal, geen status-seam-entry)', () => {
    render(<Alert severity="info">ter info</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('bg-sky-100', 'text-sky-800', 'border-sky-300');
  });

  it('de rand RENDERT: border-solid (#198) + toon-op-toon severity-rand; rounded, NIET rounded-lg', () => {
    render(<Alert severity="success">ok</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('border', 'border-solid', 'border-success-300', 'rounded');
    expect(alert.className).not.toMatch(/\brounded-lg\b/);
  });

  it('filled-variant = solid-chip-representatie: bg-*-600 + witte tekst + border-transparent', () => {
    render(<Alert severity="danger" variant="filled">kritiek</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-danger-600', 'text-white', 'border-transparent');
    expect(alert.className).not.toContain('bg-danger-100');
  });

  it('filled-info = sky-600 (contrast-fix — sky-500 + wit is sub-AA)', () => {
    render(<Alert severity="info" variant="filled">oordeel</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-sky-600', 'text-white');
    expect(alert.className).not.toMatch(/\bbg-sky-500\b/);
  });

  it('auto-icoon per severity (MUI-pariteit); icon={false} onderdrukt; custom icon rendert', () => {
    const { rerender } = render(<Alert severity="warning">let op</Alert>);
    expect(screen.getByRole('alert').querySelector('svg')).not.toBeNull();

    rerender(<Alert severity="warning" icon={false}>kaal</Alert>);
    expect(screen.getByRole('alert').querySelector('svg')).toBeNull();

    rerender(
      <Alert severity="info" icon={<Info size="1em" data-testid="eigen-icoon" />}>
        eigen
      </Alert>
    );
    expect(screen.getByTestId('eigen-icoon')).toBeInTheDocument();
  });

  it('AlertTitle + AlertDescription renderen binnen de alert', () => {
    render(
      <Alert severity="info">
        <AlertTitle>Titel</AlertTitle>
        <AlertDescription>Omschrijving</AlertDescription>
      </Alert>
    );
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Titel');
    expect(alert).toHaveTextContent('Omschrijving');
  });

  it('className-merge: site-overrides (py/mb) winnen van de basis via twMerge', () => {
    render(<Alert severity="info" className="mb-2 py-0.5 text-xs">compact</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('mb-2', 'py-0.5', 'text-xs');
    expect(alert.className).not.toMatch(/\bpy-3\b/);
  });
});
