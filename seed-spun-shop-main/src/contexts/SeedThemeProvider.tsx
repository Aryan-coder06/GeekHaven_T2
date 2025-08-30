import React, { createContext, useContext, useEffect } from 'react';
import { applySeedTheme, ASSIGNMENT_SEED } from '@/utils/seed';

interface SeedThemeContextType {
  seed: string;
  appliedTheme: boolean;
}

const SeedThemeContext = createContext<SeedThemeContextType | undefined>(undefined);

interface SeedThemeProviderProps {
  children: React.ReactNode;
  seed?: string;
}

export function SeedThemeProvider({ children, seed = ASSIGNMENT_SEED }: SeedThemeProviderProps) {
  const [appliedTheme, setAppliedTheme] = React.useState(false);

  useEffect(() => {
    try {
      applySeedTheme(seed);
      setAppliedTheme(true);
    } catch (error) {
      console.warn('Failed to apply seed theme:', error);
      setAppliedTheme(false);
    }
  }, [seed]);

  return (
    <SeedThemeContext.Provider value={{ seed, appliedTheme }}>
      {children}
    </SeedThemeContext.Provider>
  );
}

export function useSeedTheme() {
  const context = useContext(SeedThemeContext);
  if (context === undefined) {
    throw new Error('useSeedTheme must be used within a SeedThemeProvider');
  }
  return context;
}