import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from '@/components/ui/card';

/**
 * shadcn Card — DE surface-primitive (vervangt MUI `<Paper variant="outlined">`),
 * PLAT ge-edit voor het TNO-thema. Class-smoke van de drie project-edits:
 * `rounded` (4px, NIET rounded-lg), `border border-border` (expliciete kleur —
 * kaal `border` = currentColor post-#178), GEEN shadow (plat). Pixels
 * (bg-card = slate-800 in dark) bewijst de e2e via getComputedStyle.
 */

describe('shadcn Card (TNO surface-primitive, flat-edited)', () => {
  it('rendert het platte omlijnde vlak: rounded + border border-border + bg-card, GEEN shadow/rounded-lg', () => {
    render(<Card data-testid="surface">inhoud</Card>);
    const card = screen.getByTestId('surface');
    expect(card).toHaveClass('rounded', 'border', 'border-border', 'bg-card');
    expect(card.className).not.toContain('shadow');
    expect(card.className).not.toMatch(/\brounded-lg\b/);
  });

  it('host children + className-merge (border-l-accent overleeft de cn-merge)', () => {
    render(
      <Card className="border-l-[3px] border-l-sky-500 p-4">
        <span>kind</span>
      </Card>
    );
    const card = screen.getByText('kind').parentElement as HTMLElement;
    expect(card).toHaveClass('border-l-sky-500', 'p-4');
  });
});
