import { useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { usePlanner } from '../../contexts/PlannerContext';

const ProgressTracker = () => {
  const { isDarkMode } = useTheme();
  const { semesters } = usePlanner();

  // Calculate progress based on placed courses
  const progress = useMemo(() => {
    const allPlacedCourses = [];
    semesters.forEach(semester => {
      semester.courses.forEach(course => {
        allPlacedCourses.push(course.courseCode);
      });
    });

    // Calculate CS major requirements
    const cscCourses = allPlacedCourses.filter(code => code.startsWith('CSC'));
    const mat1500Completed = allPlacedCourses.includes('MAT 1500');
    const mat2400Completed = allPlacedCourses.includes('MAT 2400');
    const totalCredits = semesters.reduce((total, semester) => {
      return total + semester.courses.reduce((semTotal, course) => {
        return semTotal + (course.creditHours || 3);
      }, 0);
    }, 0);

    // Core CS requirements: All CSC courses + MAT 1500 + MAT 2400
    const coreCoursesCompleted = cscCourses.length + (mat1500Completed ? 1 : 0) + (mat2400Completed ? 1 : 0);
    const coreCoursesRequired = 17; // 15 CSC courses + MAT 1500 + MAT 2400

    // Calculate overall progress (core courses and credits)
    const coreProgress = Math.min(coreCoursesCompleted / coreCoursesRequired, 1);
    const creditProgress = Math.min(totalCredits / 120, 1);
    const totalProgress = (coreProgress + creditProgress) / 2;

    return { 
      coreCoursesCompleted,
      coreCoursesRequired,
      coreProgress,
      totalCredits,
      creditProgress,
      totalProgress,
      allPlacedCourses,
      cscCourses: cscCourses.length,
      mat1500Completed,
      mat2400Completed
    };
  }, [semesters]);

  const getProgressColor = (percentage) => {
    if (percentage >= 1) return 'bg-green-500';
    if (percentage >= 0.7) return 'bg-blue-500';
    if (percentage >= 0.4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressTextColor = (percentage) => {
    if (percentage >= 1) return 'text-green-600';
    if (percentage >= 0.7) return 'text-blue-600';
    if (percentage >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`
      w-72 flex-shrink-0 rounded-2xl shadow-lg border
      ${isDarkMode 
        ? 'bg-slate-800 border-slate-700' 
        : 'bg-white border-gray-200'
      }
    `}>
      {/* Header */}
      <div className={`
        p-6 border-b
        ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}
      `}>
        <div className="flex items-center space-x-3">
          <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center
            bg-gradient-to-br from-purple-500 to-blue-600
          `}>
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className={`text-lg font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Degree Progress
            </h3>
            <p className={`text-sm ${
              isDarkMode ? 'text-slate-400' : 'text-gray-500'
            }`}>
              Track your requirements
            </p>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${
              isDarkMode ? 'text-slate-300' : 'text-gray-700'
            }`}>
              CS Degree Progress
            </span>
            <span className={`text-sm font-bold ${
              getProgressTextColor(progress.totalProgress)
            }`}>
              {Math.round(progress.totalProgress * 100)}%
            </span>
          </div>
          <div className={`
            h-4 rounded-full overflow-hidden
            ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}
          `}>
            <div
              className={`h-full transition-all duration-500 ${
                getProgressColor(progress.totalProgress)
              }`}
              style={{ width: `${Math.min(progress.totalProgress * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Requirements Summary */}
      <div className="p-6 space-y-4">
        {/* Core Courses Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className={`text-sm font-medium ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Core CS Requirements
            </h4>
            <span className={`text-sm font-bold ${
              progress.coreProgress >= 1 ? 'text-green-600' : (isDarkMode ? 'text-slate-300' : 'text-gray-700')
            }`}>
              {progress.coreCoursesCompleted}/{progress.coreCoursesRequired}
            </span>
          </div>
          <div className={`
            h-2 rounded-full overflow-hidden
            ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}
          `}>
            <div
              className={`h-full transition-all duration-500 ${
                getProgressColor(progress.coreProgress)
              }`}
              style={{ width: `${Math.min(progress.coreProgress * 100, 100)}%` }}
            />
          </div>
 
        </div>

        {/* Credits Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className={`text-sm font-medium ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Total Credits
            </h4>
            <span className={`text-sm font-bold ${
              progress.creditProgress >= 1 ? 'text-green-600' : (isDarkMode ? 'text-slate-300' : 'text-gray-700')
            }`}>
              {progress.totalCredits}/120
            </span>
          </div>
          <div className={`
            h-2 rounded-full overflow-hidden
            ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}
          `}>
            <div
              className={`h-full transition-all duration-500 ${
                getProgressColor(progress.creditProgress)
              }`}
              style={{ width: `${Math.min(progress.creditProgress * 100, 100)}%` }}
            />
          </div>
          <p className={`text-xs ${
            isDarkMode ? 'text-slate-400' : 'text-gray-500'
          }`}>
            {Math.max(0, 120 - progress.totalCredits)} credits remaining
          </p>
        </div>
      </div>

     
    </div>
  );
};

export default ProgressTracker; 