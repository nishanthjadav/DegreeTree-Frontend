import { useState, useEffect } from 'react';
import CourseGraph from './CourseGraph';
import { courseApi } from '../services/api';

const EligibleCoursesGrid = ({ eligibleCourses, isLoading, hasChecked, courses, selectedCourses }) => {
  const [viewMode, setViewMode] = useState('graph'); // Changed from 'grid' to 'graph'
  const [prerequisiteRelationships, setPrerequisiteRelationships] = useState({});
  const [isLoadingRelationships, setIsLoadingRelationships] = useState(false);
  const [allCompletedCourses, setAllCompletedCourses] = useState([]);
  const [selectedCourseForDetails, setSelectedCourseForDetails] = useState(null);
  
  useEffect(() => {
    // Debugging log to see what data we're working with
    console.log("EligibleCoursesGrid data:", {
      eligibleCourses,
      courses,
      selectedCourses,
      hasChecked,
      viewMode
    });
  }, [eligibleCourses, courses, selectedCourses, hasChecked, viewMode]);

  // Calculate auto-completed prerequisites (for courses with exactly one prerequisite)
  useEffect(() => {
    const calculateAllCompletedCourses = async () => {
      if (!selectedCourses || selectedCourses.length === 0) {
        setAllCompletedCourses([]);
        return;
      }

      const impliedCompletedCourses = new Set(selectedCourses);
      
      // Check each selected course for auto-completion eligibility
      for (const courseCode of selectedCourses) {
        try {
          const prereqData = await courseApi.getCoursePrerequisites(courseCode);
          if (prereqData && prereqData.prerequisites) {
            // Only auto-complete prerequisites if this course has exactly ONE prerequisite
            if (prereqData.prerequisites.length === 1) {
              const singlePrereq = prereqData.prerequisites[0];
              impliedCompletedCourses.add(singlePrereq.courseCode);
              console.log(`Auto-completed ${singlePrereq.courseCode} because ${courseCode} has exactly one prerequisite`);
            }
          }
        } catch (error) {
          console.warn(`Could not get prerequisites for ${courseCode}:`, error);
        }
      }
      
      setAllCompletedCourses(Array.from(impliedCompletedCourses));
    };

    calculateAllCompletedCourses();
  }, [selectedCourses]);

  // Close modal with Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && selectedCourseForDetails) {
        setSelectedCourseForDetails(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [selectedCourseForDetails]);

  // Fetch prerequisite relationships from API
  useEffect(() => {
    const fetchPrerequisiteRelationships = async () => {
      try {
        setIsLoadingRelationships(true);
        const relationships = await courseApi.getPrerequisiteRelationships();
        setPrerequisiteRelationships(relationships);
      } catch (error) {
        console.error('Error fetching prerequisite relationships:', error);
        setPrerequisiteRelationships({});
      } finally {
        setIsLoadingRelationships(false);
      }
    };

    if (courses && courses.length > 0) {
      fetchPrerequisiteRelationships();
    }
  }, [courses]);

  // Filter courses for graph display - show ECE courses only if completed
  const getFilteredCoursesForGraph = () => {
    if (!courses) return [];
    
    return courses.filter(course => {
      // Show all CSC courses
      if (course.courseCode.startsWith('CSC')) {
        return true;
      }
      
      // Show ECE courses only if they are completed (selected or auto-completed)
      if (course.courseCode.startsWith('ECE')) {
        return allCompletedCourses.includes(course.courseCode);
      }
      
      // Show all other courses (non-CSC, non-ECE)
      return true;
    });
  };

  // Generate edges for the graph view based on prerequisites from API
  const generateEdges = () => {
    const edges = [];
    
    // Get filtered course codes for the graph
    const filteredCourses = getFilteredCoursesForGraph();
    const availableCourses = filteredCourses.map(course => course.courseCode);
    
    // Generate edges from API prerequisite relationships, but only for available courses
    Object.entries(prerequisiteRelationships).forEach(([courseCode, prerequisites]) => {
      if (availableCourses.includes(courseCode)) {
        prerequisites.forEach(prerequisite => {
          if (availableCourses.includes(prerequisite)) {
            edges.push({
              from: prerequisite,
              to: courseCode
            });
          }
        });
      }
    });
    
    return edges;
  };

  if (!hasChecked && selectedCourses.length === 0) {
    return (
      <div className="card text-center">
        <div className="py-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
            <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">Live Course Planner</h3>
          <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
            Select your completed courses from the left panel and see eligible courses update instantly! No button clicking required.
          </p>
          <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-slate-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Powered by Neo4j Graph Database</span>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-6 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-slate-200 rounded w-32 animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm text-slate-600">Analyzing...</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="bg-white/60 border border-slate-200 rounded-xl p-5 animate-pulse">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-3 h-3 bg-emerald-300 rounded-full"></div>
                <div className="h-4 bg-slate-200 rounded w-20"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-200 rounded w-full"></div>
                <div className="h-3 bg-slate-200 rounded w-3/4"></div>
              </div>
              <div className="mt-3 h-6 bg-slate-100 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (eligibleCourses.length === 0) {
    return (
      <div className="card text-center">
        <div className="py-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center">
            <svg className="w-10 h-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">No Eligible Courses Found</h3>
          <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
            Based on your completed courses, there are no additional courses you're currently eligible to take. This could mean:
          </p>
          <div className="mt-6 text-left max-w-sm mx-auto space-y-2 text-sm text-slate-600">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
              <span>You've completed all available courses</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
              <span>Prerequisites for remaining courses aren't met</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
              <span>Database needs more course data</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="card-title flex items-center space-x-3">
              <span>Eligible Courses</span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border transition-all duration-300 ${
                isLoading 
                  ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200' 
                  : 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border-emerald-200'
              }`}>
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    updating...
                  </>
                ) : (
                  `${eligibleCourses.length} available`
                )}
              </span>
            </h2>
            <p className="card-subtitle">
              {isLoading ? 'Updating eligibility in real-time...' : 'Courses you can enroll in based on your completed prerequisites'}
            </p>
          </div>
          
          {/* View mode toggle - Reordered so Graph is first/left */}
          <div className="flex items-center space-x-2 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('graph')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors ${
                viewMode === 'graph' 
                  ? 'bg-white text-slate-800 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              Graph
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-slate-800 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Grid
            </button>
          </div>
        </div>
      </div>
      
      {viewMode === 'grid' ? (
        // Grid view
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {eligibleCourses.filter(course => {
            // Show all CSC courses
            if (course.courseCode.startsWith('CSC')) {
              return true;
            }
            
            // Show ECE courses only if the user has completed any ECE courses
            if (course.courseCode.startsWith('ECE')) {
              return allCompletedCourses.some(completedCourse => completedCourse.startsWith('ECE'));
            }
            
            // Show all other courses (non-CSC, non-ECE)
            return true;
          }).map(course => (
            <div 
              key={course.courseCode} 
              onClick={() => setSelectedCourseForDetails(course)}
              className="group bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border-2 border-emerald-200 hover:border-emerald-300 rounded-2xl p-5 transition-all duration-300 cursor-pointer transform hover:scale-105"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {course.courseCode}
                    </h3>
                    {course.credits && (
                      <span className="px-2 py-1 bg-white/80 text-emerald-700 text-xs font-medium rounded-md border border-emerald-200">
                        {course.credits} cr
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 group-hover:text-slate-700 transition-colors">
                    {course.courseName}
                  </p>
                  {course.courseDescription && (
                    <p className="text-slate-500 text-xs mt-2 line-clamp-2">
                      {course.courseDescription}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mt-4 pt-2 border-t border-emerald-100 h-6 flex items-center justify-center">
                <span className="text-xs text-emerald-600 font-medium group-hover:text-emerald-800 transition-colors">
                  View Details →
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Graph view
        <div className="relative">
          {isLoadingRelationships && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="flex items-center space-x-2 text-slate-600">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm">Loading prerequisite relationships...</span>
              </div>
            </div>
          )}
          <CourseGraph 
            courses={getFilteredCoursesForGraph()}
            edges={generateEdges()}
            completedCourses={allCompletedCourses || []}
            eligibleCourses={eligibleCourses.map(c => c.courseCode) || []}
            onCourseClick={(courseCode) => {
              // Find the course object from the full courses list or eligible courses
              const clickedCourse = courses?.find(c => c.courseCode === courseCode) || 
                                  eligibleCourses?.find(c => c.courseCode === courseCode);
              if (clickedCourse) {
                setSelectedCourseForDetails(clickedCourse);
              }
            }}
          />
        </div>
      )}

      {/* Course Details Popup */}
      {selectedCourseForDetails && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCourseForDetails(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[50vh] overflow-hidden border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white relative">
              <div className="absolute top-3 right-3">
                <button
                  onClick={() => setSelectedCourseForDetails(null)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  {selectedCourseForDetails.courseCode}
                </h2>
                <p className="text-emerald-100 text-base">
                  {selectedCourseForDetails.courseName}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Course Description */}
                <div className="lg:col-span-3">
                  {selectedCourseForDetails.courseDescription && (
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 mb-2">Description</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {selectedCourseForDetails.courseDescription}
                      </p>
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="lg:col-span-1">
                  <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                    {/* Credits */}
                    {selectedCourseForDetails.credits && (
                      <div className="text-center">
                        <div className="text-xs font-bold text-slate-500">Credits</div>
                        <div className="text-xl font-semibold text-emerald-600">{selectedCourseForDetails.credits}</div>
                      </div>
                    )}
                    
                    {/* Department */}
                    <div className="text-center pt-2 border-t border-slate-200">
                      <div className="text-xs font-bold text-slate-500">Department</div>
                      <div className="text-sm font-medium text-purple-600">
                        {selectedCourseForDetails.courseCode.split(' ')[0]}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EligibleCoursesGrid; 