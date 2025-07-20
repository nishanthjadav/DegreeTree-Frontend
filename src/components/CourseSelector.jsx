import { useState, useMemo } from 'react';

const CourseSelector = ({ 
  courses, 
  selectedCourses, 
  onCourseSelectionChange,
  onCheckEligibility,
  isLoading 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const filteredCourses = useMemo(() => {
    if (!searchTerm) return courses;
    return courses.filter(course =>
      course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.courseName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [courses, searchTerm]);

  const handleCourseToggle = (courseCode) => {
    const newSelection = selectedCourses.includes(courseCode)
      ? selectedCourses.filter(code => code !== courseCode)
      : [...selectedCourses, courseCode];
    onCourseSelectionChange(newSelection);
  };

  const handleRemoveCourse = (courseCode) => {
    onCourseSelectionChange(selectedCourses.filter(code => code !== courseCode));
  };

  const clearAll = () => {
    onCourseSelectionChange([]);
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="card-title">Select Completed Courses</h2>
            <p className="card-subtitle">
              Choose all courses you have successfully completed
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
              title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
            >
              {viewMode === 'grid' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Selected courses section */}
      {selectedCourses.length > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800">
              Selected Courses ({selectedCourses.length})
            </h3>
            <button
              onClick={clearAll}
              className="text-sm text-slate-600 hover:text-slate-800 transition-colors"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedCourses.map(courseCode => {
              const course = courses.find(c => c.courseCode === courseCode);
              return (
                <span
                  key={courseCode}
                  className="course-tag"
                >
                  <span className="font-medium">{courseCode}</span>
                  <button
                    onClick={() => handleRemoveCourse(courseCode)}
                    className="course-tag-remove"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Search section */}
      <div className="mb-6">
        <div className="search-container">
          <svg className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search courses by code or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Course list/grid */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-600">
            {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} available
          </p>
        </div>
        
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
            {filteredCourses.map(course => (
              <div
                key={course.courseCode}
                onClick={() => handleCourseToggle(course.courseCode)}
                className={`course-card ${selectedCourses.includes(course.courseCode) ? 'selected' : ''}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                      selectedCourses.includes(course.courseCode) 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'border-slate-300'
                    }`}>
                      {selectedCourses.includes(course.courseCode) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 text-sm">{course.courseCode}</h4>
                    <p className="text-slate-600 text-xs mt-1 line-clamp-2">{course.courseName}</p>
                    {course.credits && (
                      <span className="inline-block mt-2 px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
                        {course.credits} credits
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredCourses.map(course => (
              <div
                key={course.courseCode}
                onClick={() => handleCourseToggle(course.courseCode)}
                className={`flex items-center p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedCourses.includes(course.courseCode)
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center mr-3 transition-colors ${
                  selectedCourses.includes(course.courseCode) 
                    ? 'bg-blue-500 border-blue-500' 
                    : 'border-slate-300'
                }`}>
                  {selectedCourses.includes(course.courseCode) && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900">{course.courseCode}</h4>
                      <p className="text-slate-600 text-sm">{course.courseName}</p>
                    </div>
                    {course.credits && (
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
                        {course.credits} credits
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Check Eligibility Button */}
      <div className="pt-4 border-t border-slate-200">
        <button
          onClick={onCheckEligibility}
          disabled={selectedCourses.length === 0 || isLoading}
          className={`w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
            selectedCourses.length === 0 || isLoading
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Checking Eligibility...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                {selectedCourses.length === 0 
                  ? "Select courses to check eligibility" 
                  : `Check Course Eligibility`}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CourseSelector; 