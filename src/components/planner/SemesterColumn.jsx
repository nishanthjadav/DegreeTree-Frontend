import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useTheme } from '../../contexts/ThemeContext';
import { usePlanner } from '../../contexts/PlannerContext';
import CourseCard from './CourseCard';

const SemesterColumn = ({ semester, onRemoveSemester }) => {
  const { isDarkMode } = useTheme();
  const { getSemesterCredits, removeCourseFromSemester } = usePlanner();
  
  const { setNodeRef, isOver } = useDroppable({
    id: semester.id,
    data: {
      type: 'semester',
      semester: semester
    }
  });

  const totalCredits = getSemesterCredits(semester.id);
  const isUnderloaded = totalCredits < semester.minCredits;
  const isOverloaded = totalCredits > semester.maxCredits;

  // Get season color
  const getSeasonColor = (season) => {
    const colors = {
      'Spring': isDarkMode ? 'from-green-600 to-emerald-700' : 'from-green-400 to-emerald-500',
      'Summer': isDarkMode ? 'from-yellow-600 to-orange-700' : 'from-yellow-400 to-orange-500',
      'Fall': isDarkMode ? 'from-red-600 to-orange-700' : 'from-red-400 to-orange-500',
    };
    return colors[season] || (isDarkMode ? 'from-gray-600 to-gray-700' : 'from-gray-400 to-gray-500');
  };

  // Get credit hours styling
  const getCreditStyle = () => {
    if (isOverloaded) return 'text-red-500 font-bold';
    if (isUnderloaded && totalCredits > 0) return 'text-yellow-500 font-bold';
    return isDarkMode ? 'text-slate-300' : 'text-gray-600';
  };

  const handleRemoveCourse = (courseId) => {
    removeCourseFromSemester(courseId, semester.id);
  };

  return (
    <div className="w-full">
      <div className={`
        rounded-2xl shadow-lg border-2 transition-all duration-300 h-full min-h-[600px]
        ${isDarkMode 
          ? 'bg-slate-800 border-slate-700' 
          : 'bg-white border-gray-200'
        }
        ${isOver 
          ? (isDarkMode ? 'border-blue-500 bg-slate-700' : 'border-blue-400 bg-blue-50')
          : ''
        }
      `}>
        {/* Header */}
        <div className={`
          relative rounded-t-2xl p-6 bg-gradient-to-br ${getSeasonColor(semester.season)}
          text-white
        `}>
          {/* Remove semester button */}
          <button
            onClick={() => onRemoveSemester(semester.id)}
            className={`
              absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center
              bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200
              opacity-0 group-hover:opacity-100
            `}
            title="Remove semester"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="text-center">
            <h3 className="text-xl font-bold mb-1">
              {semester.season} {semester.year}
            </h3>
            <div className="flex items-center justify-center space-x-4 text-sm opacity-90">
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>{semester.courses.length} courses</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className={getCreditStyle()}>
                  {totalCredits} credits
                </span>
              </div>
            </div>
          </div>

          {/* Credit warnings */}
          <div className="mt-3 text-center">
            {isOverloaded && (
              <div className="inline-flex items-center space-x-1 px-3 py-1 bg-red-500 bg-opacity-20 rounded-full text-xs">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>Overloaded ({totalCredits - semester.maxCredits} over)</span>
              </div>
            )}
            {isUnderloaded && totalCredits > 0 && (
              <div className="inline-flex items-center space-x-1 px-3 py-1 bg-yellow-500 bg-opacity-20 rounded-full text-xs">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>Underloaded ({semester.minCredits - totalCredits} short)</span>
              </div>
            )}
          </div>
        </div>

        {/* Drop zone */}
        <div
          ref={setNodeRef}
          className={`
            p-3 flex-1 min-h-[450px] transition-all duration-200 overflow-y-auto scrollbar-thin
            ${isOver ? 'bg-opacity-50' : ''}
          `}
        >
          {semester.courses.length === 0 ? (
            <div className={`
              h-full flex flex-col items-center justify-center text-center p-8 rounded-xl border-2 border-dashed
              ${isDarkMode 
                ? 'border-slate-600 text-slate-400' 
                : 'border-gray-300 text-gray-500'
              }
              ${isOver 
                ? (isDarkMode ? 'border-blue-400 text-blue-400' : 'border-blue-400 text-blue-600')
                : ''
              }
            `}>
              <svg className="w-12 h-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <p className="text-sm font-medium mb-2">
                {isOver ? 'Drop course here' : 'No courses yet'}
              </p>
              <p className="text-xs opacity-75">
                Drag courses from the catalog or other semesters
              </p>
            </div>
          ) : (
            <SortableContext
              items={semester.courses.map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {semester.courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    semesterId={semester.id}
                    onRemove={() => handleRemoveCourse(course.id)}
                  />
                ))}
              </div>
            </SortableContext>
          )}
        </div>

        {/* Compact Footer with semester stats */}
        <div className={`
          px-3 py-2 border-t
          ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}
        `}>
          <div className="flex items-center justify-between text-xs">
            <span className={`${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              {semester.minCredits}-{semester.maxCredits} target
            </span>
            <div className={`font-medium ${getCreditStyle()}`}>
              {totalCredits} cr
            </div>
          </div>
          
          {/* Compact Progress bar */}
          <div className={`
            mt-1 h-1.5 rounded-full overflow-hidden
            ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}
          `}>
            <div
              className={`
                h-full transition-all duration-300
                ${isOverloaded 
                  ? 'bg-red-500' 
                  : isUnderloaded && totalCredits > 0
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }
              `}
              style={{
                width: `${Math.min((totalCredits / semester.maxCredits) * 100, 100)}%`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SemesterColumn; 