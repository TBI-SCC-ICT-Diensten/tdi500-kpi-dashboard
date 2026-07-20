import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Collapsible } from '../components/ui/collapsible';

/**
 * TDD-eerst voor het owned Collapsible-primitief (D4): CSS
 * grid-template-rows 0fr→1fr, ~300ms, zero deps, geen meet-JS. Kinderen
 * blijven MOUNTED in dichte stand (MUI Collapse-pariteit — geen unmount);
 * de hoogte-collapse is CSS (jsdom rekent geen grid, dus de tests toetsen
 * de dragende classes, niet de pixels — die bewijst de e2e van de eerste
 * consument, playbook §5).
 */

describe('Collapsible — owned primitief (grid-rows-transitie)', () => {
  it('open: grid-rows-[1fr]', () => {
    render(
      <Collapsible open data-testid="c"><p>inhoud</p></Collapsible>
    );
    expect(screen.getByTestId('c').className).toContain('grid-rows-[1fr]');
  });

  it('dicht: grid-rows-[0fr], en de kinderen blijven gemount (MUI-pariteit)', () => {
    render(
      <Collapsible open={false} data-testid="c"><p>inhoud</p></Collapsible>
    );
    expect(screen.getByTestId('c').className).toContain('grid-rows-[0fr]');
    expect(screen.getByText('inhoud')).toBeInTheDocument();
  });

  it('de transitie staat op grid-template-rows (~300ms, MUI easeInOut)', () => {
    render(<Collapsible open data-testid="c">x</Collapsible>);
    const cls = screen.getByTestId('c').className;
    expect(cls).toContain('transition-[grid-template-rows]');
    expect(cls).toContain('duration-300');
    expect(cls).toContain('ease-in-out');
  });

  it('het binnenvlak klemt de hoogte: min-h-0 + overflow-hidden', () => {
    render(<Collapsible open={false} data-testid="c"><p>x</p></Collapsible>);
    const inner = screen.getByTestId('c').firstElementChild as HTMLElement;
    expect(inner.className).toContain('min-h-0');
    expect(inner.className).toContain('overflow-hidden');
  });

  it('className merget op de wrapper', () => {
    render(<Collapsible open className="mt-2" data-testid="c">x</Collapsible>);
    expect(screen.getByTestId('c').className).toContain('mt-2');
  });
});
