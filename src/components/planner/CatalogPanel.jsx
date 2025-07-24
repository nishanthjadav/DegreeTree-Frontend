import { useState, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { usePlanner } from '../../contexts/PlannerContext';
import CourseCard from './CourseCard';

const CatalogPanel = () => {
  const { isDarkMode } = useTheme();
  const { 
    courses, 
    filter, 
    setFilter, 
    setSearch, 
    getFilteredCourses, 
    getPlacedCourses 
  } = usePlanner();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const filteredCourses = getFilteredCourses();
  const placedCourses = getPlacedCourses();
  
  // Get unique departments
  const departments = useMemo(() => {
    const depts = new Set();
    courses.forEach(course => {
      const dept = course.courseCode.match(/^[A-Z]+/)?.[0];
      if (dept) depts.add(dept);
    });
    return Array.from(depts).sort();
  }, [courses]);

  // Get course statistics
  const stats = useMemo(() => {
    const total = courses.length;
    const placed = placedCourses.size;
    const available = filteredCourses.length;
    
    return { total, placed, available };
  }, [courses.length, placedCourses.size, filteredCourses.length]);

  const handleDepartmentFilter = (dept) => {
    setFilter({ department: dept === filter.department ? '' : dept });
  };

  return (
    <div className={`
      ${isCollapsed ? 'w-16' : 'w-80'} 
      flex-shrink-0 transition-all duration-300
    `}>
      <div className={`
        h-full rounded-2xl shadow-lg border flex flex-col
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
          <div className="flex items-center justify-between">
            <div className={isCollapsed ? 'hidden' : ''}>
              <h2 className={`text-xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Course Catalog
              </h2>
              <p className={`text-sm mt-1 ${
                isDarkMode ? 'text-slate-400' : 'text-gray-500'
              }`}>
                Drag courses to semesters
              </p>
            </div>
            
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`
                p-2 rounded-lg transition-colors duration-200
                ${isDarkMode 
                  ? 'hover:bg-slate-700 text-slate-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }
              `}
            >
              <svg 
                className={`w-5 h-5 transition-transform duration-300 ${
                  isCollapsed ? 'rotate-180' : ''
                }`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Stats */}
          {!isCollapsed && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className={`
                text-center p-3 rounded-lg
                ${isDarkMode ? 'bg-slate-700' : 'bg-gray-50'}
              `}>
                <div className={`text-lg font-bold ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  {stats.total}
                </div>
                <div className={`text-xs ${
                  isDarkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  Total
                </div>
              </div>
              
              <div className={`
                text-center p-3 rounded-lg
                ${isDarkMode ? 'bg-slate-700' : 'bg-gray-50'}
              `}>
                <div className={`text-lg font-bold ${
                  isDarkMode ? 'text-green-400' : 'text-green-600'
                }`}>
                  {stats.placed}
                </div>
                <div className={`text-xs ${
                  isDarkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  Placed
                </div>
              </div>
              
              <div className={`
                text-center p-3 rounded-lg
                ${isDarkMode ? 'bg-slate-700' : 'bg-gray-50'}
              `}>
                <div className={`text-lg font-bold ${
                  isDarkMode ? 'text-purple-400' : 'text-purple-600'
                }`}>
                  {stats.available}
                </div>
                <div className={`text-xs ${
                  isDarkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  Available
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        {!isCollapsed && (
          <div className={`
            p-4 border-b space-y-4
            ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}
          `}>
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses..."
                value={filter.search}
                onChange={(e) => setSearch(e.target.value)}
                className={`
                  w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  ${isDarkMode 
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }
                `}
              />
              <svg 
                className={`absolute left-3 top-2.5 w-4 h-4 ${
                  isDarkMode ? 'text-slate-400' : 'text-gray-400'
                }`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Department filters */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-slate-300' : 'text-gray-700'
              }`}>
                Department
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter({ department: '' })}
                  className={`
                    px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200
                    ${!filter.department
                      ? (isDarkMode 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-blue-500 text-white')
                      : (isDarkMode 
                          ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                    }
                  `}
                >
                  All
                </button>
                {departments.map(dept => (
                  <button
                    key={dept}
                    onClick={() => handleDepartmentFilter(dept)}
                    className={`
                      px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200
                      ${filter.department === dept
                        ? (isDarkMode 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-blue-500 text-white')
                        : (isDarkMode 
                            ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                      }
                    `}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Course List */}
        <div className="flex-1 overflow-hidden">
          {isCollapsed ? (
            <div className="p-4 text-center">
              <div className={`
                text-xs font-medium mb-2
                ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}
              `}>
                Courses
              </div>
              <div className={`
                text-2xl font-bold
                ${isDarkMode ? 'text-white' : 'text-gray-900'}
              `}>
                {stats.available}
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto scrollbar-thin p-4">
              {filteredCourses.length === 0 ? (
                <div className="text-center py-8">
                  <svg className={`w-12 h-12 mx-auto mb-4 ${
                    isDarkMode ? 'text-slate-600' : 'text-gray-400'
                  }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-500'
                  }`}>
                    No courses found
                  </p>
                  <p className={`text-xs mt-1 ${
                    isDarkMode ? 'text-slate-500' : 'text-gray-400'
                  }`}>
                    Try adjusting your filters
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {filteredCourses.map((course) => (
                    <CourseCard
                      key={course.courseCode}
                      course={course}
                      isInCatalog={true}
                      isPlaced={placedCourses.has(course.courseCode)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Clear filters */}
        {!isCollapsed && (filter.search || filter.department) && (
          <div className={`
            p-4 border-t
            ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}
          `}>
            <button
              onClick={() => setFilter({ search: '', department: '' })}
              className={`
                w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                ${isDarkMode 
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogPanel; 