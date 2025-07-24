import { useTheme } from '../contexts/ThemeContext';

const AboutPage = () => {
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
          About Degree Tree
        </h3>
        <p className={`mb-6 leading-relaxed transition-colors duration-300 ${
          isDarkMode ? 'text-slate-300' : 'text-slate-600'
        }`}>
          Degree Tree is a course planning application that helps students navigate their academic journey by tracking completed courses and identifying eligible next courses based on prerequisites.
        </p>
      </div>
    </div>
  );
};

export default AboutPage; 