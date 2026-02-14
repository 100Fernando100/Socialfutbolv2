import { createContext, useContext, useState, ReactNode } from 'react';

export type League = 'default' | 'premierLeague' | 'laLiga' | 'ligaProfesional' | 'brasileirao';

export interface LeagueTheme {
  id: League;
  name: string;
  accentColor: string;
  accentColorRgb: string;
  gradient: string;
}

export const leagueThemes: Record<League, LeagueTheme> = {
  default: {
    id: 'default',
    name: 'Default',
    accentColor: '#00FF41',
    accentColorRgb: '0, 255, 65',
    gradient: 'from-emerald-600/20 via-green-600/20 to-emerald-700/20',
  },
  premierLeague: {
    id: 'premierLeague',
    name: 'Premier League',
    accentColor: '#3d195b',
    accentColorRgb: '61, 25, 91',
    gradient: 'from-purple-700/20 via-purple-600/20 to-purple-800/20',
  },
  laLiga: {
    id: 'laLiga',
    name: 'La Liga',
    accentColor: '#ee1d23',
    accentColorRgb: '238, 29, 35',
    gradient: 'from-red-600/20 via-red-500/20 to-red-700/20',
  },
  ligaProfesional: {
    id: 'ligaProfesional',
    name: 'Liga Profesional',
    accentColor: '#75aadb',
    accentColorRgb: '117, 170, 219',
    gradient: 'from-blue-400/20 via-sky-400/20 to-blue-500/20',
  },
  brasileirao: {
    id: 'brasileirao',
    name: 'Brasileirão',
    accentColor: '#009739',
    accentColorRgb: '0, 151, 57',
    gradient: 'from-green-600/20 via-green-500/20 to-green-700/20',
  },
};

interface ThemeContextType {
  league: League;
  setLeague: (league: League) => void;
  theme: LeagueTheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [league, setLeague] = useState<League>('default');

  const value = {
    league,
    setLeague,
    theme: leagueThemes[league],
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
