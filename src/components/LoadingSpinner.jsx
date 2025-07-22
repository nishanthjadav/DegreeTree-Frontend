import { useTheme } from '../contexts/ThemeContext';

const LoadingSpinner = ({ text = "Loading..." }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center space-x-3">
        <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
          isDarkMode ? 'border-blue-400' : 'border-blue-600'
        }`}></div>
        <span className={`font-medium transition-colors duration-300 ${
          isDarkMode ? 'text-slate-300' : 'text-gray-600'
        }`}>
          {text}
        </span>
      </div>
    </div>
  );
};

export default LoadingSpinner; 