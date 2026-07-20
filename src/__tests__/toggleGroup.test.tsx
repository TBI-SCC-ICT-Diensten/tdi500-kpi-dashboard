import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToggleGroup, ToggleGroupItem } from '../components/ui/toggle-group';

/**
 * TDD-eerst voor de owned segmented control (D3, zero-deps). MUI-pariteit is
 * a11y-dragend: ToggleButtonGroup = role="group", elke ToggleButton = een
 * native <button> met aria-pressed; toetsenbord = gewone Tab-volgorde (MUI
 * heeft GEEN roving focus — er valt dus niets bij te bouwen). Exclusive-
 * gedrag: klik op de geselecteerde emit null (MUI-deselectie); de null-guard
 * ligt bij de call-site, precies als bij MUI.
 */

const renderGroup = (onValueChange = vi.fn(), value: string | null = 'a') => {
  render(
    <ToggleGroup value={value} onValueChange={onValueChange} aria-label="Testgroep">
      <ToggleGroupItem value="a" data-testid="item-a">Optie A</ToggleGroupItem>
      <ToggleGroupItem value="b" data-testid="item-b">Optie B</ToggleGroupItem>
    </ToggleGroup>
  );
  return onValueChange;
};

describe('ToggleGroup — owned segmented control (MUI-pariteit a11y)', () => {
  it('de groep is role="group" met de aria-label', () => {
    renderGroup();
    expect(screen.getByRole('group', { name: 'Testgroep' })).toBeInTheDocument();
  });

  it('items zijn native buttons (type=button) met aria-pressed naar selectie', () => {
    renderGroup();
    const a = screen.getByTestId('item-a');
    const b = screen.getByTestId('item-b');
    expect(a.tagName).toBe('BUTTON');
    expect(a).toHaveAttribute('type', 'button');
    expect(a).toHaveAttribute('aria-pressed', 'true');
    expect(b).toHaveAttribute('aria-pressed', 'false');
  });

  it('klik op een niet-geselecteerd item emit zijn value', () => {
    const spy = renderGroup();
    fireEvent.click(screen.getByTestId('item-b'));
    expect(spy).toHaveBeenCalledWith('b');
  });

  it('klik op het geselecteerde item emit null (MUI exclusive-deselectie)', () => {
    const spy = renderGroup();
    fireEvent.click(screen.getByTestId('item-a'));
    expect(spy).toHaveBeenCalledWith(null);
  });

  it('segmented (default): randen collapsen (-ml-px) en alleen de uiteinden ronden', () => {
    renderGroup();
    const cls = screen.getByTestId('item-b').className;
    expect(cls).toContain('-ml-px');
    expect(cls).toContain('first:rounded-l');
    expect(cls).toContain('last:rounded-r');
  });

  it('pills-variant: losse items (rounded-lg), geselecteerd = solide primary', () => {
    render(
      <ToggleGroup value="x" onValueChange={() => {}} variant="pills" aria-label="Pillen">
        <ToggleGroupItem value="x" data-testid="pill-x">X</ToggleGroupItem>
      </ToggleGroup>
    );
    const cls = screen.getByTestId('pill-x').className;
    expect(cls).toContain('rounded-lg');
    expect(cls).toContain('aria-pressed:bg-primary');
    expect(cls).not.toContain('-ml-px');
  });

  it('de scoped button-reset (appearance-none) zit op elk item (Preflight UIT)', () => {
    renderGroup();
    expect(screen.getByTestId('item-a').className).toContain('appearance-none');
  });

  it('item-aria-labels en testids komen door; className merget', () => {
    render(
      <ToggleGroup value={null} onValueChange={() => {}} aria-label="G">
        <ToggleGroupItem value="v" aria-label="Voorbeeld" className="px-5" data-testid="item">V</ToggleGroupItem>
      </ToggleGroup>
    );
    const item = screen.getByTestId('item');
    expect(item).toHaveAttribute('aria-label', 'Voorbeeld');
    expect(item.className).toContain('px-5');
  });
});
