import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { AppData } from '../types';
import { fetchAllData, isDemoMode } from '../services/api';

interface AppContextValue {
  data: AppData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currentUserId: string;
  setCurrentUserId: (id: string) => void;
  isDemoMode: boolean;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const emptyData: AppData = {
  team: [], subjects: [], projects: [], tasks: [], milestones: [],
  resources: [], notes: [], calendar: [], subjectNotes: [], subjectTopics: [], subjectResources: [],
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('teamspace_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [currentUserId, setCurrentUserIdState] = useState<string>(
    () => localStorage.getItem('teamspace_user') || 'mem-1',
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('teamspace_theme', theme);
  }, [theme]);

  const setCurrentUserId = useCallback((id: string) => {
    setCurrentUserIdState(id);
    localStorage.setItem('teamspace_user', id);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAllData();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setData((prev) => prev ?? emptyData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <AppContext.Provider
      value={{ data, loading, error, refresh, theme, toggleTheme, currentUserId, setCurrentUserId, isDemoMode }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
