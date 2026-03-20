import React, { createContext, useContext, useState, useEffect } from 'react';

type AccentColor = 'rose' | 'indigo' | 'emerald' | 'amber' | 'blue';
type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  accent: AccentColor;
  setAccent: (accent: AccentColor) => void;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accent, setAccent] = useState<AccentColor>(() => {
    const saved = localStorage.getItem('theme_accent');
    return (saved as AccentColor) || 'rose';
  });

  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('theme_mode');
    return (saved as ThemeMode) || 'dark';
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('theme_accent', accent);
    // Update CSS variable for accent color - Video Streaming/OTT palette
    const colors = {
      rose: '#E11D48',      // Primary red for streaming
      indigo: '#4338CA',    // Secondary purple
      emerald: '#22C55E',   // Success/positive
      amber: '#CA8A04',     // Gold/highlight
      blue: '#3B82F6'       // Info/links
    };
    document.documentElement.style.setProperty('--accent-primary', colors[accent]);
  }, [accent]);

  useEffect(() => {
    localStorage.setItem('theme_mode', mode);
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', isSidebarCollapsed.toString());
  }, [isSidebarCollapsed]);

  return (
    <ThemeContext.Provider value={{ accent, setAccent, mode, setMode, isSidebarCollapsed, setIsSidebarCollapsed }}>
      <div className={`theme-${accent} ${mode}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
