import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

const Header = ({ activeTab, onTabChange }) => {
  const { isDarkMode } = useTheme();

  const tabs = [
    { id: 'eligible', label: 'Eligible Courses' },
    { id: 'planner', label: 'Schedule Planner' },
    { id: 'about', label: 'About' }
  ];

  return (
    <header className={`shadow-xl transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-r from-slate-800 to-slate-900' 
        : 'bg-gradient-to-r from-[#003366] to-blue-800'
    }`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left side - Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className={`
                flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300
                ${isDarkMode 
                  ? 'bg-white/10 backdrop-blur-sm' 
                  : 'bg-white/20'
                }
              `}>
                <svg 
                  className="w-7 h-7 text-white" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                  />
                </svg>
              </div>
            </div>
            <div>
              <h1 
                className={`
                  text-2xl font-bold cursor-pointer transition-all duration-300
                  ${isDarkMode 
                    ? 'text-white hover:text-blue-300' 
                    : 'text-white hover:text-blue-200'
                  }
                `}
                onClick={() => window.location.reload()}
                title="Click to refresh page"
              >
                Degree Tree
              </h1>
            </div>
          </div>

          {/* Right side - Navigation and Theme Toggle */}
          <div className="flex items-center space-x-6">
            {/* Navigation Tabs */}
            <div className="flex items-center space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`
                    px-6 py-2.5 rounded-lg font-medium transition-all duration-300 text-sm
                    ${activeTab === tab.id
                      ? (isDarkMode 
                          ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm' 
                          : 'bg-white/25 text-white shadow-lg backdrop-blur-sm')
                      : (isDarkMode 
                          ? 'text-slate-300 hover:text-white hover:bg-white/10' 
                          : 'text-blue-100 hover:text-white hover:bg-white/15')
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 