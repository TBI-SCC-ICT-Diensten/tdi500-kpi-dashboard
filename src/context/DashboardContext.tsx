import { createContext, useContext, useState, type ReactNode } from 'react';

interface DashboardState {
  selectedContingentId: string | null;
}

interface DashboardContextValue {
  state: DashboardState;
  setSelectedContingentId: (id: string | null) => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export const useDashboardContext = (): DashboardContextValue => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }
  return context;
};

interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider = ({ children }: DashboardProviderProps) => {
  const [state, setState] = useState<DashboardState>({
    selectedContingentId: null,
  });

  const setSelectedContingentId = (id: string | null) => {
    setState((prev) => ({ ...prev, selectedContingentId: id }));
  };

  return (
    <DashboardContext.Provider value={{ state, setSelectedContingentId }}>
      {children}
    </DashboardContext.Provider>
  );
};
