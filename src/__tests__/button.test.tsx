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
