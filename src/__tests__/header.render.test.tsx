import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ColorModeProvider } from '../context/ColorModeContext';
import { RoleProvider } from '../context/RoleContext';
import Header from '../components/layout/Header';

/**
 * TDD-eerst voor cluster C1 (Header-shell): AppBar/Toolbar → flat <header>,
 * menu-IconButton → ghost-icon-Button (md:hidden — eerste consument van de
 * C0-breakpoints), datasource-Chip → interactieve owned Chip (echte button),
 * rol-ToggleButtonGroup → owned ToggleGroup (variant a), Tooltip → native
 * title, thema-IconButton → ghost-icon-Button. BEHOUD-CONTRACTEN:
 * datasource-chip / theme-toggle / role-installateur / role-beheerder
 * testids, aria-labels menu / Rolselectie / Thema wisselen, role=group.
 * Typography/Box blijven MUI (Tier 2).
 */

const renderHeader = (onMenuClick?: () => void) =>
  render(
    <ColorModeProvider>
      <RoleProvider>
        <Header onMenuClick={onMenuClick} />
      </RoleProvider>
    </ColorModeProvider>
  );

describe('Header — cluster C1 (flat header + owned primitieven)', () => {
  it('de shell is een semantische <header> met de flat-rand (geen MUI AppBar)', () => {
    const { container } = renderHeader();
    const header = container.querySelector('header');
    expect(header).not.toBeNull();
    expect(header!.className).toContain('border-b');
    expect(header!.className).toContain('border-border');
    expect(header!.className).toContain('bg-card');
    expect(container.querySelector('.MuiAppBar-root')).toBeNull();
    expect(container.querySelector('.MuiToolbar-root')).toBeNull();
  });

  it('de datasource-chip is een ECHTE button (owned Chip) met behoud van testid en klikgedrag', () => {
    renderHeader();
    const chip = screen.getByTestId('datasource-chip');
    expect(chip.tagName).toBe('BUTTON');
    const before = chip.textContent;
    fireEvent.click(chip);
    expect(chip.textContent).not.toBe(before);
  });

  it('de rolselectie is een role=group met aria-pressed-buttons (testids behouden)', () => {
    renderHeader();
    expect(screen.getByRole('group', { name: 'Rolselectie' })).toBeInTheDocument();
    const installateur = screen.getByTestId('role-installateur');
    const beheerder = screen.getByTestId('role-beheerder');
    expect(installateur.tagName).toBe('BUTTON');
    expect(installateur).toHaveAttribute('aria-pressed', 'true');
    expect(beheerder).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(beheerder);
    expect(beheerder).toHaveAttribute('aria-pressed', 'true');
    expect(installateur).toHaveAttribute('aria-pressed', 'false');
  });

  it('MUI-deselectie-guard: klik op de al-geselecteerde rol laat de selectie staan', () => {
    renderHeader();
    const installateur = screen.getByTestId('role-installateur');
    fireEvent.click(installateur);
    expect(installateur).toHaveAttribute('aria-pressed', 'true');
  });

  it('theme-toggle: testid + aria-label behouden, Tooltip → native title', () => {
    renderHeader();
    const btn = screen.getByTestId('theme-toggle');
    expect(btn.tagName).toBe('BUTTON');
    expect(btn).toHaveAttribute('aria-label', 'Thema wisselen');
    expect(btn).toHaveAttribute('title', 'Donker thema');
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('title', 'Licht thema');
  });

  it('de menuknop draagt aria-label menu, vuurt onMenuClick en is md:hidden (C0-afhankelijk)', () => {
    let clicks = 0;
    renderHeader(() => { clicks += 1; });
    const menuBtn = screen.getByLabelText('menu');
    expect(menuBtn.className).toContain('md:hidden');
    fireEvent.click(menuBtn);
    expect(clicks).toBe(1);
  });

  it('de icoonknoppen erven de padding-reset van de primitive (geen call-site-p-0 meer)', () => {
    renderHeader(() => {});
    // De p-0 zat als workaround op beide call-sites; hij hoort bij de
    // size=icon-variant zelf. Blijft hij hier zichtbaar, dan levert de
    // primitive hem — de knoppen renderen ongewijzigd (40px resp. 30px rond).
    [screen.getByLabelText('menu'), screen.getByTestId('theme-toggle')].forEach((btn) =>
      expect(btn).toHaveClass('p-0')
    );
  });

  it('nul MUI-interactieprimitieven over; Typography/Box blijven (Tier 2)', () => {
    const { container } = renderHeader();
    ['.MuiChip-root', '.MuiIconButton-root', '.MuiToggleButton-root', '.MuiToggleButtonGroup-root', '.MuiTooltip-popper'].forEach(
      (sel) => expect(container.querySelector(sel)).toBeNull()
    );
    expect(container.querySelector('.MuiTypography-root')).not.toBeNull();
  });
});
