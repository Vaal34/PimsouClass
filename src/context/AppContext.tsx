import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types pour l'état global
interface AppState {
  consigne: string;
  isConsigneVisible: boolean;
  theme: 'light' | 'dark';
}

interface AppContextType {
  state: AppState;
  setConsigne: (consigne: string) => void;
  toggleConsigneVisibility: () => void;
  resetConsigne: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

// État initial
const initialState: AppState = {
  consigne: '',
  isConsigneVisible: false,
  theme: 'light'
};

// Création du contexte
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider du contexte
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(initialState);

  const setConsigne = (consigne: string) => {
    setState(prev => ({
      ...prev,
      consigne,
      isConsigneVisible: consigne.length > 0
    }));
  };

  const toggleConsigneVisibility = () => {
    setState(prev => ({
      ...prev,
      isConsigneVisible: !prev.isConsigneVisible
    }));
  };

  const resetConsigne = () => {
    setState(prev => ({
      ...prev,
      consigne: '',
      isConsigneVisible: false
    }));
  };

  const setTheme = (theme: 'light' | 'dark') => {
    setState(prev => ({
      ...prev,
      theme
    }));
  };

  const contextValue: AppContextType = {
    state,
    setConsigne,
    toggleConsigneVisibility,
    resetConsigne,
    setTheme
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp doit être utilisé dans un AppProvider');
  }
  return context;
}; 