import { useState, useEffect } from 'react';
import Header from './components/Header';
import CourseSelector from './components/CourseSelector';
import EligibleCoursesGrid from './components/EligibleCoursesGrid';
import LoadingSpinner from './components/LoadingSpinner';
import { courseApi } from './services/api';
import { useTheme } from './contexts/ThemeContext';

function App() {
  const { isDarkMode } = useTheme();
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [eligibleCourses, setEligibleCourses] = useState([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const [hasCheckedEligibility, setHasCheckedEligibility] = useState(false);
  const [error, setError] = useState(null);

  // Calculate all completed courses including auto-completed prerequisites
  const [allCompletedCourses, setAllCompletedCourses] = useState([]);

  // Fetch all courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoadingCourses(true);
        setError(null);
        
        const fetchedCourses = await courseApi.getAllCourses();
        if (fetchedCourses.length === 0) {
          setError('No courses found. Please ensure the backend is running and the database is populated.');
        } else {
          setCourses(fetchedCourses);
        }
      } catch (error) {
        setError('Failed to connect to the backend. Please ensure the Spring Boot server is running on http://localhost:8080');
        console.error('Error fetching courses:', error);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  const handleCourseSelectionChange = (newSelection) => {
    setSelectedCourses(newSelection);
    // Reset eligibility state when courses change
    if (hasCheckedEligibility) {
      setHasCheckedEligibility(false);
      setEligibleCourses([]);
    }
  };

  // Calculate auto-completed prerequisites
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

  // Filter eligible courses to match display logic (only CSC and MAT courses, plus ECE and MAT 2600 if completed)
  const getDisplayedEligibleCourses = () => {
    return eligibleCourses.filter(course => {
      // Show all CSC courses
      if (course.courseCode.startsWith('CSC')) {
        return true;
      }
      
      // Show MAT courses, but exclude MAT 2600 unless it's been completed
      if (course.courseCode.startsWith('MAT')) {
        if (course.courseCode === 'MAT 2600') {
          return allCompletedCourses.includes('MAT 2600');
        }
        return true;
      }
      
      // Show ECE courses only if the user has completed any ECE courses
      if (course.courseCode.startsWith('ECE')) {
        return allCompletedCourses.some(completedCourse => completedCourse.startsWith('ECE'));
      }
      
      // Show all other courses (non-CSC, non-MAT, non-ECE)
      return !course.courseCode.startsWith('CSC') && !course.courseCode.startsWith('MAT') && !course.courseCode.startsWith('ECE');
    });
  };

  // Manual function to check course eligibility (only runs when button is clicked)
  const checkEligibility = async () => {
    if (courses.length === 0) return; // Wait for courses to load
    
    try {
      setIsCheckingEligibility(true);
      setError(null);
      
      const eligible = await courseApi.checkEligibility(selectedCourses);
      
      // Filter out courses that the user has already completed
      const filteredEligibleCourses = eligible.filter(course => 
        !selectedCourses.includes(course.courseCode)
      );
      
      setEligibleCourses(filteredEligibleCourses);
      setHasCheckedEligibility(true);
    } catch (error) {
      setError('Failed to check eligibility. Please ensure the backend is running and try again.');
      console.error('Error checking eligibility:', error);
    } finally {
      setIsCheckingEligibility(false);
    }
  };

  if (isLoadingCourses) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-slate-900 to-slate-800' 
          : 'bg-gradient-to-br from-slate-50 to-blue-50'
      }`}>
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className={`
                w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-colors duration-300
                ${isDarkMode 
                  ? 'bg-gradient-to-br from-slate-700 to-slate-600' 
                  : 'bg-gradient-to-br from-blue-100 to-indigo-100'
                }
              `}>
                <svg 
                  className={`animate-spin w-8 h-8 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`} 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h3 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Loading Course Data
              </h3>
              <p className={`transition-colors duration-300 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Connecting to Neo4j database...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error && courses.length === 0) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-slate-900 to-slate-800' 
          : 'bg-gradient-to-br from-slate-50 to-blue-50'
      }`}>
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className={`
              max-w-2xl text-center rounded-2xl shadow-lg border p-8 transition-all duration-300
              ${isDarkMode 
                ? 'bg-slate-800 border-slate-700 hover:shadow-xl' 
                : 'bg-white border-gray-200 hover:shadow-xl'
              }
            `}>
              <div className="py-8">
                <div className={`
                  w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-colors duration-300
                  ${isDarkMode 
                    ? 'bg-gradient-to-br from-red-800 to-red-700' 
                    : 'bg-gradient-to-br from-red-100 to-pink-100'
                  }
                `}>
                  <svg 
                    className={`w-10 h-10 ${
                      isDarkMode ? 'text-red-400' : 'text-red-600'
                    }`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Backend Connection Error
                </h3>
                <p className={`mb-6 leading-relaxed transition-colors duration-300 ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {error}
                </p>
                
                <div className={`
                  rounded-xl p-6 mb-6 text-left transition-colors duration-300
                  ${isDarkMode 
                    ? 'bg-slate-700/50 backdrop-blur-sm' 
                    : 'bg-slate-50'
                  }
                `}>
                  <h4 className={`font-semibold mb-3 transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    Setup Checklist:
                  </h4>
                  <div className={`space-y-3 text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className={`
                        w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-300
                        ${isDarkMode 
                          ? 'bg-blue-800 text-blue-300' 
                          : 'bg-blue-100 text-blue-600'
                        }
                      `}>
                        <span className="text-xs">1</span>
                      </div>
                      <span>Spring Boot backend running on port 8080</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`
                        w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-300
                        ${isDarkMode 
                          ? 'bg-blue-800 text-blue-300' 
                          : 'bg-blue-100 text-blue-600'
                        }
                      `}>
                        <span className="text-xs">2</span>
                      </div>
                      <div className="flex-1">
                        <p><strong>Neo4j connection:</strong></p>
                        <p>- Neo4j Browser: <span className={
                          isDarkMode ? 'text-green-400' : 'text-green-600'
                        }>http://localhost:7474/</span></p>
                        <p>- Java connection URL: <span className={
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }>bolt://localhost:7687</span></p>
                        <p className="text-xs mt-1">The backend uses the bolt:// URL, not the HTTP interface</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`
                        w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-300
                        ${isDarkMode 
                          ? 'bg-blue-800 text-blue-300' 
                          : 'bg-blue-100 text-blue-600'
                        }
                      `}>
                        <span className="text-xs">3</span>
                      </div>
                      <span>Database populated with course and prerequisite data</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-4 justify-center">
                  <button 
                    onClick={() => window.location.reload()} 
                    className="btn-primary"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Try Again
                  </button>
                  
                  <a 
                    href="http://localhost:7474/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-secondary flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open Neo4j Browser
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 to-slate-800' 
        : 'bg-gradient-to-br from-slate-50 to-blue-50'
    }`}>
      <Header />
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ maxWidth: "1600px" }}>
        {/* Course Stats Header */}
        <div className="mb-8 text-center">
          <div className={`
            mt-4 flex items-center justify-center space-x-6 text-sm transition-colors duration-300
            ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}
          `}>
            <div className="flex items-center space-x-2">
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300
                ${isDarkMode 
                  ? 'bg-blue-800/50 backdrop-blur-sm' 
                  : 'bg-blue-100'
                }
              `}>
                <span className={`font-semibold transition-colors duration-300 ${
                  isDarkMode ? 'text-blue-300' : 'text-blue-600'
                }`}>
                  {courses.length}
                </span>
              </div>
              <span>Available Courses</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300
                ${isDarkMode 
                  ? 'bg-emerald-800/50 backdrop-blur-sm' 
                  : 'bg-emerald-100'
                }
              `}>
                <span className={`font-semibold transition-colors duration-300 ${
                  isDarkMode ? 'text-emerald-300' : 'text-emerald-600'
                }`}>
                  {selectedCourses.length}
                </span>
              </div>
              <span>Completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300
                ${isCheckingEligibility 
                  ? (isDarkMode ? 'bg-blue-800/50' : 'bg-blue-100')
                  : (isDarkMode ? 'bg-purple-800/50' : 'bg-purple-100')
                }
              `}>
                {isCheckingEligibility ? (
                  <svg 
                    className={`animate-spin h-4 w-4 ${
                      isDarkMode ? 'text-blue-300' : 'text-blue-600'
                    }`} 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <span className={`font-semibold transition-colors duration-300 ${
                    isDarkMode ? 'text-purple-300' : 'text-purple-600'
                  }`}>
                    {getDisplayedEligibleCourses().length}
                  </span>
                )}
              </div>
              <span>{isCheckingEligibility ? 'Checking...' : (hasCheckedEligibility ? 'Eligible Next' : 'Click to Check')}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-8 gap-8">
          {/* Course Selector Section - Wider to fit 3 courses per row */}
          <div className="xl:col-span-3">
            <CourseSelector
              courses={courses}
              selectedCourses={selectedCourses}
              onCourseSelectionChange={handleCourseSelectionChange}
              onCheckEligibility={checkEligibility}
              isLoading={isCheckingEligibility}
            />
          </div>

          {/* Eligible Courses Section - Wider to fit 4 courses per row */}
          <div className="xl:col-span-5">
            <EligibleCoursesGrid
              eligibleCourses={eligibleCourses}
              isLoading={isCheckingEligibility}
              hasChecked={hasCheckedEligibility}
              courses={courses}
              selectedCourses={selectedCourses}
              allCompletedCourses={allCompletedCourses}
            />
          </div>
        </div>

                 {/* Error Message */}
         {error && courses.length > 0 && (
           <div className="mt-8">
             <div className={`
               rounded-2xl p-6 shadow-lg border transition-colors duration-300
               ${isDarkMode 
                 ? 'bg-red-900/20 border-red-800/50 backdrop-blur-sm' 
                 : 'bg-red-50 border-red-200'
               }
             `}>
               <div className="flex items-start space-x-3">
                 <div className="flex-shrink-0">
                   <div className={`
                     w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300
                     ${isDarkMode 
                       ? 'bg-red-800/50 backdrop-blur-sm' 
                       : 'bg-red-100'
                     }
                   `}>
                     <svg 
                       className={`w-5 h-5 ${
                         isDarkMode ? 'text-red-400' : 'text-red-600'
                       }`} 
                       viewBox="0 0 20 20" 
                       fill="currentColor"
                     >
                       <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                     </svg>
                   </div>
                 </div>
                 <div className="flex-1">
                   <h4 className={`font-semibold mb-1 transition-colors duration-300 ${
                     isDarkMode ? 'text-red-300' : 'text-red-900'
                   }`}>
                     Operation Failed
                   </h4>
                   <p className={`text-sm transition-colors duration-300 ${
                     isDarkMode ? 'text-red-400' : 'text-red-800'
                   }`}>
                     {error}
                   </p>
                 </div>
               </div>
             </div>
           </div>
         )}
      </main>
    </div>
  );
}

export default App;
