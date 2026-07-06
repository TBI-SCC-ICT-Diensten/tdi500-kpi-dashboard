import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ColorModeProvider, useColorMode } from '../context/ColorModeContext';

/**
 * Dark-unificatie: de ene mode-state stuurt naast MUI's theme óók de
 * `dark`-class op <html> (Tailwind darkMode:'class'). Dit test ECHT gedrag
 * (jsdom classList), geen class-string-assertie: mount, toggle, terug-toggle
 * en de dark-persisted eerste mount.
 */

const Toggler = () => {
  const { mode, toggleColorMode } = useColorMode();
  return (
    <button onClick={toggleColorMode}>modus: {mode}</button>
  );
};

const renderProvider = () =>
  render(
    <ColorModeProvider>
      <Toggler />
    </ColorModeProvider>
  );

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('dark');
});

describe('ColorModeProvider — html-class synchroon met de modus', () => {
  it('licht (default): geen dark-class op <html>', () => {
    renderProvider();
    expect(screen.getByText('modus: light')).toBeInTheDocument();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('toggle → dark-class erbij; terug-toggle → weer weg', () => {
    renderProvider();
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('modus: dark')).toBeInTheDocument();
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('modus: light')).toBeInTheDocument();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('dark-persisted localStorage → class direct aanwezig bij mount', () => {
    localStorage.setItem('tdi500-color-mode', 'dark');
    renderProvider();
    expect(screen.getByText('modus: dark')).toBeInTheDocument();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggle schrijft de modus naar localStorage (bestaand gedrag intact)', () => {
    renderProvider();
    fireEvent.click(screen.getByRole('button'));
    expect(localStorage.getItem('tdi500-color-mode')).toBe('dark');
  });
});
