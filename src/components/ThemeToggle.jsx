import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative p-2 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${isDarkMode 
          ? 'bg-slate-700/50 hover:bg-slate-600/60 focus:ring-offset-slate-800 backdrop-blur-sm border border-slate-600/30' 
          : 'bg-white/80 hover:bg-white shadow-md hover:shadow-lg border border-slate-200/50 backdrop-blur-sm'
        }
      `}
      aria-label="Toggle theme"
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-6 h-6">
        {/* Sun Icon - visible in dark mode */}
        <svg 
          className={`
            absolute inset-0 w-6 h-6 transition-all duration-500 ease-out
            ${isDarkMode 
              ? 'opacity-100 rotate-0 scale-100 text-yellow-400' 
              : 'opacity-0 -rotate-90 scale-75 text-slate-400'
            }
          `} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="12" cy="12" r="5"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
        
        {/* Moon Icon - visible in light mode */}
        <svg 
          className={`
            absolute inset-0 w-6 h-6 transition-all duration-500 ease-out
            ${!isDarkMode 
              ? 'opacity-100 rotate-0 scale-100 text-slate-700' 
              : 'opacity-0 rotate-90 scale-75 text-slate-400'
            }
          `} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
        </svg>
      </div>
    </button>
  );
};

export default ThemeToggle; 