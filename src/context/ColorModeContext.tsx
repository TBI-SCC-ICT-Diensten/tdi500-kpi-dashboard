import { createContext, useContext, useState, useMemo, useLayoutEffect } from 'react';
import type { ReactNode } from 'react';

export type ColorMode = 'light' | 'dark';

interface ColorModeContextType {
  mode: ColorMode;
  toggleColorMode: () => void;
}

const ColorModeContext = createContext<ColorModeContextType>({
  mode: 'light',
  toggleColorMode: () => {},
});

export const useColorMode = () => useContext(ColorModeContext);

const getInitialMode = (): ColorMode => {
  try {
    const stored = localStorage.getItem('tdi500-color-mode');
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {
    // localStorage not available
  }
  return 'light';
};

export const ColorModeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ColorMode>(getInitialMode);

  // Dark-unificatie: dezelfde mode-state stuurt óók Tailwind's class-based
  // dark mode (tailwind.config.js darkMode:'class'). MUI leest zijn modus
  // uitsluitend uit de ThemeProvider — de <html>-class is inert voor MUI en
  // activeert alleen de dark:-varianten van gemigreerde componenten.
  // useLayoutEffect (niet useEffect): de class staat er vóór de paint, dus
  // een dark-persisted sessie rendert Tailwind-dark vanaf het eerste frame.
  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }, [mode]);

  const value = useMemo(() => ({
    mode,
    toggleColorMode: () => {
      setMode(prev => {
        const next: ColorMode = prev === 'light' ? 'dark' : 'light';
        try { localStorage.setItem('tdi500-color-mode', next); } catch { /* ignore */ }
        return next;
      });
    },
  }), [mode]);

  return (
    <ColorModeContext.Provider value={value}>
      {children}
    </ColorModeContext.Provider>
  );
};
