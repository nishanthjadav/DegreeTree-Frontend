import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Initialize with dark mode as default
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first, default to dark mode if nothing is stored
    const stored = localStorage.getItem('theme-preference');
    if (stored !== null) {
      return stored === 'dark';
    }
    return true; // Default to dark mode
  });

  // Update localStorage and document class when theme changes
  useEffect(() => {
    localStorage.setItem('theme-preference', isDarkMode ? 'dark' : 'light');
    
    // Update document class for Tailwind dark: modifier
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Set initial theme class on mount
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const value = {
    isDarkMode,
    toggleTheme,
    theme: isDarkMode ? 'dark' : 'light'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 