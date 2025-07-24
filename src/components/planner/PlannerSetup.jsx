import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const PlannerSetup = ({ onComplete }) => {
  const { isDarkMode } = useTheme();
  const [startMonth, setStartMonth] = useState('8'); // Default to August (Fall)
  const [startYear, setStartYear] = useState(new Date().getFullYear().toString());
  const [gradMonth, setGradMonth] = useState('5'); // Default to May (Spring graduation)
  const [gradYear, setGradYear] = useState((new Date().getFullYear() + 4).toString());

  const months = [
    { value: '1', label: 'January', season: 'Spring' },
    { value: '5', label: 'May', season: 'Spring' },
    { value: '6', label: 'June', season: 'Summer' },
    { value: '7', label: 'July', season: 'Summer' },
    { value: '8', label: 'August', season: 'Fall' },
    { value: '12', label: 'December', season: 'Fall' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => currentYear + i - 2);

  // Auto-calculate graduation date when start date changes (7 semesters later)
  useEffect(() => {
    const calculateGraduationDate = (startMonth, startYear) => {
      const startSeason = getSeasonFromMonth(startMonth);
      const startYearNum = parseInt(startYear);
      
      let currentSeason = startSeason;
      let currentYear = startYearNum;
      
      // Move forward 7 semesters (skipping summers)
      for (let i = 0; i < 7; i++) {
        if (currentSeason === 'Spring') {
          currentSeason = 'Fall';
        } else if (currentSeason === 'Fall') {
          currentSeason = 'Spring';
          currentYear++;
        }
      }
      
      // Convert back to month
      const gradMonth = currentSeason === 'Spring' ? '5' : '8';
      return { month: gradMonth, year: currentYear.toString() };
    };

    const graduationDate = calculateGraduationDate(startMonth, startYear);
    setGradMonth(graduationDate.month);
    setGradYear(graduationDate.year);
  }, [startMonth, startYear]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const startDate = {
      month: parseInt(startMonth),
      year: parseInt(startYear),
      season: months.find(m => m.value === startMonth)?.season || 'Fall'
    };
    
    const gradDate = {
      month: parseInt(gradMonth),
      year: parseInt(gradYear),
      season: months.find(m => m.value === gradMonth)?.season || 'Spring'
    };

    onComplete({ startDate, gradDate });
  };

  const getSeasonFromMonth = (month) => {
    const monthNum = parseInt(month);
    if (monthNum >= 1 && monthNum <= 5) return 'Spring';
    if (monthNum >= 6 && monthNum <= 7) return 'Summer';
    return 'Fall';
  };

  return (
    <div className={`
      min-h-screen flex items-center justify-center p-6
      ${isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 to-slate-800' 
        : 'bg-gradient-to-br from-slate-50 to-blue-50'
      }
    `}>
      <div className={`
        max-w-2xl w-full rounded-2xl shadow-2xl border p-8
        ${isDarkMode 
          ? 'bg-slate-800 border-slate-700' 
          : 'bg-white border-gray-200'
        }
      `}>
        <div className="text-center mb-8">
          <div className={`
            w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center
            bg-gradient-to-br from-blue-500 to-indigo-600
          `}>
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            CS Degree Planner Setup
          </h1>
          <p className={`text-lg ${
            isDarkMode ? 'text-slate-400' : 'text-gray-600'
          }`}>
            Let's plan your Computer Science degree timeline
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* College Start Date */}
          <div>
            <label className={`block text-lg font-semibold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              When did/will you start college?
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Month
                </label>
                <select
                  value={startMonth}
                  onChange={(e) => setStartMonth(e.target.value)}
                  className={`
                    w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    ${isDarkMode 
                      ? 'bg-slate-700 border-slate-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                    }
                  `}
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label} ({month.season})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Year
                </label>
                <select
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                  className={`
                    w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    ${isDarkMode 
                      ? 'bg-slate-700 border-slate-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                    }
                  `}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className={`mt-2 text-sm ${
              isDarkMode ? 'text-slate-400' : 'text-gray-500'
            }`}>
              Starting in {getSeasonFromMonth(startMonth)} {startYear}
            </p>
          </div>

          {/* Expected Graduation Date */}
          <div>
            <label className={`block text-lg font-semibold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Expected graduation date
            </label>
            <p className={`text-sm mb-4 ${
              isDarkMode ? 'text-slate-400' : 'text-gray-600'
            }`}>
              Auto-calculated for 4-year degree (7 semesters after start). You can adjust if needed.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Month
                </label>
                <select
                  value={gradMonth}
                  onChange={(e) => setGradMonth(e.target.value)}
                  className={`
                    w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    ${isDarkMode 
                      ? 'bg-slate-700 border-slate-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                    }
                  `}
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label} ({month.season})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Year
                </label>
                <select
                  value={gradYear}
                  onChange={(e) => setGradYear(e.target.value)}
                  className={`
                    w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    ${isDarkMode 
                      ? 'bg-slate-700 border-slate-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                    }
                  `}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className={`mt-2 text-sm ${
              isDarkMode ? 'text-slate-400' : 'text-gray-500'
            }`}>
              Graduating in {getSeasonFromMonth(gradMonth)} {gradYear}
            </p>
          </div>

          
          {/* Submit Button */}
          <div className="pt-4">
                          <button
                type="submit"
                className={`
                  w-full px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200
                  ${isDarkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }
                  shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                `}
              >
                Create My 4-Year Degree Plan
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlannerSetup; 