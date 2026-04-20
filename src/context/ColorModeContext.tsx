import { createContext, useContext, useState, useMemo } from 'react';
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
