import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Chip } from '../components/ui/chip';

/**
 * TDD-eerst voor het owned Chip-primitief (D1, cluster-run Tier-1).
 * Polymorf: <button> zodra onClick aanwezig is (met de scoped reset,
 * Button-precedent #178), anders <span>. Solid-status leest het seam
 * (STATUS_SOLID_CHIP_CLASSES); solid-primary en outlined zijn
 * component-lokaal (info=sky-precedent #201). Pilvorm + text-2xs
 * (de vastgelegde chipmaat). Class-smoke: dragende classes, geen
 * uitputtende lijsten (playbook §5).
 */

describe('Chip — owned primitief (polymorf, seam-solid, pilvorm)', () => {
  it('rendert als SPAN zonder onClick, met de labeltekst', () => {
    render(<Chip color="primary" data-testid="chip">Profiel A1</Chip>);
    const chip = screen.getByTestId('chip');
    expect(chip.tagName).toBe('SPAN');
    expect(chip).toHaveTextContent('Profiel A1');
  });

  it('rendert als BUTTON type=button mét onClick, en het klikken werkt', () => {
    const onClick = vi.fn();
    render(<Chip color="healthy" onClick={onClick} data-testid="chip">Live</Chip>);
    const chip = screen.getByTestId('chip');
    expect(chip.tagName).toBe('BUTTON');
    expect(chip).toHaveAttribute('type', 'button');
    fireEvent.click(chip);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('de button-variant draagt de scoped reset (appearance-none, Button-precedent)', () => {
    render(<Chip color="healthy" onClick={() => {}} data-testid="chip">Live</Chip>);
    expect(screen.getByTestId('chip').className).toContain('appearance-none');
  });

  it('pilvorm + chipmaat: rounded-full en text-2xs op elke chip', () => {
    render(<Chip color="primary" data-testid="chip">x</Chip>);
    const cls = screen.getByTestId('chip').className;
    expect(cls).toContain('rounded-full');
    expect(cls).toContain('text-2xs');
  });

  it('solid-status leest het seam: healthy → bg-success-600 + witte tekst', () => {
    render(<Chip color="healthy" data-testid="chip">Gezond</Chip>);
    const cls = screen.getByTestId('chip').className;
    expect(cls).toContain('bg-success-600');
    expect(cls).toContain('text-white');
    expect(cls).toContain('border-transparent');
  });

  it('solid-status warning → bg-warning-600 (seam, modus-invariant)', () => {
    render(<Chip color="warning" data-testid="chip">Mock</Chip>);
    expect(screen.getByTestId('chip').className).toContain('bg-warning-600');
  });

  it('solid-primary is component-lokaal merk (shadcn-tokens), geen seam-kleur', () => {
    render(<Chip color="primary" data-testid="chip">Profiel B2</Chip>);
    const cls = screen.getByTestId('chip').className;
    expect(cls).toContain('bg-primary');
    expect(cls).toContain('text-primary-foreground');
  });

  it('outlined: transparante bg, -600-rand + -700 text-safe tekst (licht)', () => {
    render(<Chip color="warning" variant="outlined" data-testid="chip">Betrouwbaarheid: middel</Chip>);
    const cls = screen.getByTestId('chip').className;
    expect(cls).toContain('bg-transparent');
    expect(cls).toContain('border-warning-600');
    expect(cls).toContain('text-warning-700');
    expect(cls).not.toContain('bg-warning-600');
  });

  it('outlined offline is de neutrale slate-tier', () => {
    render(<Chip color="offline" variant="outlined" data-testid="chip">Betrouwbaarheid: laag</Chip>);
    const cls = screen.getByTestId('chip').className;
    expect(cls).toContain('border-slate-300');
    expect(cls).toContain('text-slate-600');
  });

  it('icoonslot rendert vóór het label', () => {
    render(
      <Chip color="healthy" icon={<svg data-testid="chip-icon" />} data-testid="chip">
        Live
      </Chip>
    );
    const chip = screen.getByTestId('chip');
    expect(screen.getByTestId('chip-icon')).toBeInTheDocument();
    expect(chip.firstElementChild?.contains(screen.getByTestId('chip-icon'))).toBe(true);
  });

  it('className merget (twMerge) en testid/aria komen door', () => {
    render(
      <Chip color="primary" className="font-bold" aria-label="profiel" data-testid="chip">x</Chip>
    );
    const chip = screen.getByTestId('chip');
    expect(chip.className).toContain('font-bold');
    expect(chip).toHaveAttribute('aria-label', 'profiel');
  });
});
