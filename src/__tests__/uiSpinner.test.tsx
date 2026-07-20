import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from '../components/ui/spinner';

/**
 * TDD-eerst voor het owned Spinner-primitief (D5): lucide LoaderCircle +
 * animate-spin. role="progressbar" is MUI-pariteit (CircularProgress draagt
 * die rol) — bestaande render-tests en e2e die op de rol steunen blijven
 * werken. currentColor-inheritance: geen eigen kleurclass, de host kleurt
 * (het in-Button-gebruik erft text-primary-foreground, #178-grens).
 */

describe('Spinner — owned primitief (LoaderCircle + animate-spin)', () => {
  it('rendert een SVG met role="progressbar" (MUI-pariteit)', () => {
    render(<Spinner data-testid="spinner" />);
    const el = screen.getByTestId('spinner');
    expect(el.tagName.toLowerCase()).toBe('svg');
    expect(el).toHaveAttribute('role', 'progressbar');
  });

  it('draait via animate-spin', () => {
    render(<Spinner data-testid="spinner" />);
    expect(screen.getByTestId('spinner').getAttribute('class')).toContain('animate-spin');
  });

  it('size-prop stuurt width/height (MUI size-pariteit)', () => {
    render(<Spinner size={16} data-testid="spinner" />);
    const el = screen.getByTestId('spinner');
    expect(el).toHaveAttribute('width', '16');
    expect(el).toHaveAttribute('height', '16');
  });

  it('geen eigen kleurclass — currentColor erft van de host', () => {
    render(<Spinner data-testid="spinner" />);
    const cls = screen.getByTestId('spinner').getAttribute('class') ?? '';
    expect(cls).not.toMatch(/text-(primary|success|warning|danger|slate)/);
  });

  it('className merget op de svg', () => {
    render(<Spinner className="text-primary" data-testid="spinner" />);
    expect(screen.getByTestId('spinner').getAttribute('class')).toContain('text-primary');
  });
});
