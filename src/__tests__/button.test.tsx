import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

/**
 * shadcn Button (TNO-getokend) — de pilot-primitive van de shadcn-adoptie.
 * Bewijst: (1) default = TNO-merkklassen (bg-primary → #123EB7 via de var),
 * (2) de component-scoped native-<button> reset (Preflight blijft UIT),
 * (3) accent→slate hover (J2: accent-groen nooit interactie), (4) gedrag
 * (onClick/disabled) + start-icoon als kind. Pixels (TNO-blauw licht/donker)
 * bewijst de e2e via getComputedStyle.
 */

describe('shadcn Button (TNO-getokend, pilot)', () => {
  it('default: TNO-primary klassen + de scoped native-button reset', () => {
    render(<Button>Opslaan</Button>);
    const btn = screen.getByRole('button', { name: 'Opslaan' });
    expect(btn).toHaveClass('bg-primary', 'text-primary-foreground');
    // Preflight UIT → component-lokale reset (geen globale button{}-reset).
    expect(btn).toHaveClass('appearance-none', 'font-sans');
  });

  it('ghost hovert slate, NIET het TNO-accent-groen (J2)', () => {
    render(<Button variant="ghost">Annuleren</Button>);
    const btn = screen.getByRole('button', { name: 'Annuleren' });
    expect(btn).toHaveClass('hover:bg-slate-100');
    expect(btn.className).not.toContain('bg-accent');
  });

  it('roept onClick aan en respecteert disabled', () => {
    const onClick = vi.fn();
    const { rerender } = render(<Button onClick={onClick}>Ga</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Ga' }));
    expect(onClick).toHaveBeenCalledOnce();

    rerender(
      <Button onClick={onClick} disabled>
        Ga
      </Button>
    );
    expect(screen.getByRole('button', { name: 'Ga' })).toBeDisabled();
  });

  it('size=icon reset de UA-padding op de primitive (p-0 in de variant)', () => {
    render(<Button size="icon" aria-label="Sluiten" />);
    const btn = screen.getByRole('button', { name: 'Sluiten' });
    // Preflight staat UIT en de #178-reset dekte appearance/rand/font, niet de
    // padding: een kale native <button> lekt de UA-'1px 6px'. De icon-maat is
    // vierkant (h-10 w-10) en heeft dus nul padding nodig — de primitive levert
    // hem, zodat call-sites geen p-0-override meer hoeven te herhalen.
    expect(btn).toHaveClass('p-0', 'h-10', 'w-10');
  });

  it('de p-0-reset is GESCOPED op size=icon — andere maten houden hun padding', () => {
    const { rerender } = render(<Button>Standaard</Button>);
    const std = screen.getByRole('button', { name: 'Standaard' });
    expect(std).toHaveClass('px-4', 'py-2');
    expect(std.className).not.toContain('p-0');

    rerender(<Button size="sm">Klein</Button>);
    const sm = screen.getByRole('button', { name: 'Klein' });
    expect(sm).toHaveClass('px-3');
    expect(sm.className).not.toContain('p-0');

    rerender(<Button size="lg">Groot</Button>);
    const lg = screen.getByRole('button', { name: 'Groot' });
    expect(lg).toHaveClass('px-8');
    expect(lg.className).not.toContain('p-0');
  });

  it('rendert een start-icoon (kind) naast het label', () => {
    render(
      <Button>
        <svg data-testid="start-icon" /> Zoeken
      </Button>
    );
    const btn = screen.getByRole('button', { name: /zoeken/i });
    expect(btn.querySelector('[data-testid="start-icon"]')).not.toBeNull();
  });
});
