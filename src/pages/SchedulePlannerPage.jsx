import { useTheme } from '../contexts/ThemeContext';

const SchedulePlannerPage = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className="text-center py-16">
      <div className={`
        max-w-2xl mx-auto rounded-2xl shadow-lg border p-8 transition-all duration-300
        ${isDarkMode 
          ? 'bg-slate-800 border-slate-700' 
          : 'bg-white border-gray-200'
        }
      `}>
        <h3 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${
          isDarkMode ? 'text-white' : 'text-slate-900'
        }`}>
          Schedule Planner
        </h3>
        <p className={`mb-6 leading-relaxed transition-colors duration-300 ${
          isDarkMode ? 'text-slate-300' : 'text-slate-600'
        }`}>
          Coming soon! This feature will help you plan your course schedule across multiple semesters based on your completed courses and prerequisites.
        </p>
      </div>
    </div>
  );
};

export default SchedulePlannerPage; 