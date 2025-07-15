import { useState, useEffect } from 'react';
import CourseGraph from './CourseGraph';

const EligibleCoursesGrid = ({ eligibleCourses, isLoading, hasChecked, courses, selectedCourses }) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'graph'
  
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

  // Generate edges for the graph view based on prerequisites
  const generateEdges = () => {
    // This is a simplified implementation - in a real app, you would get this data from the backend
    // For now, we'll create some placeholder edges
    
    // Simple prerequisite relationships (assuming the API doesn't provide them)
    const mockPrerequisites = {
      'CSC 1350': ['CSC 1300'],
      'CSC 2260': ['CSC 1300'],
      'CSC 2362': ['CSC 1350'],
      'CSC 3102': ['CSC 2362'],
      'CSC 3200': ['CSC 2260'],
      'CSC 4103': ['CSC 3200', 'CSC 2362'],
      'CSC 4330': ['CSC 3102'],
      'CSC 4444': ['CSC 3102'],
      'MATH 1553': ['MATH 1552'],
      'MATH 2090': ['MATH 1552'],
      'PHYS 2102': ['PHYS 2101'],
      'ECE 2160': ['ECE 2620'],
      'ECE 2161': ['ECE 2620'],
      'CSC 1700': ['CSC 1300'],
      'CSC 2053': ['CSC 1052'],
      'CSC 4170': ['CSC 2053'],
    };
    
    const edges = [];
    
    // Get all available course codes from our data
    const availableCourses = courses?.map(course => course.courseCode) || [];
    
    // For each course, add edges from its prerequisites only if both courses exist
    Object.entries(mockPrerequisites).forEach(([course, prereqs]) => {
      // Only add edges where both the source and target courses exist in our data
      if (availableCourses.includes(course)) {
        prereqs.forEach(prereq => {
          if (availableCourses.includes(prereq)) {
            edges.push({
              from: prereq,
              to: course
            });
          }
        });
      }
    });
    
    return edges;
  };

  if (!hasChecked) {
    return (
      <div className="card text-center">
        <div className="py-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
            <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">Ready to Check Eligibility</h3>
          <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
            Select your completed courses from the left panel and click "Check Course Eligibility" to discover which courses you can take next.
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
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
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border border-emerald-200">
                {eligibleCourses.length} available
              </span>
            </h2>
            <p className="card-subtitle">
              Courses you can enroll in based on your completed prerequisites
            </p>
          </div>
          
          {/* View mode toggle */}
          <div className="flex items-center space-x-2 bg-slate-100 rounded-lg p-1">
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
          </div>
        </div>
      </div>
      
      {viewMode === 'grid' ? (
        // Original grid view
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {eligibleCourses.map((course, index) => (
            <div
              key={course.courseCode}
              className="eligible-course-card group"
              style={{ 
                animationDelay: `${index * 0.1}s`,
                animation: 'fadeInUp 0.5s ease-out forwards'
              }}
            >
              {/* Card content */}
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center shadow-sm">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
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
              
              <div className="mt-4 pt-3 border-t border-emerald-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-emerald-700 font-medium">
                    ✓ Prerequisites Met
                  </span>
                  <button className="text-xs text-emerald-600 hover:text-emerald-800 font-medium transition-colors">
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Graph view
        <CourseGraph 
          courses={courses || []}
          edges={generateEdges()}
          completedCourses={selectedCourses || []}
          eligibleCourses={eligibleCourses.map(c => c.courseCode) || []}
        />
      )}
      
      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="flex items-center justify-center space-x-4 text-sm text-slate-500">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Real-time eligibility analysis</span>
          </div>
          <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Smart prerequisite tracking</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EligibleCoursesGrid; 