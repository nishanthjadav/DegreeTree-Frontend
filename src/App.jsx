import { useState, useEffect } from 'react';
import Header from './components/Header';
import CourseSelector from './components/CourseSelector';
import EligibleCoursesGrid from './components/EligibleCoursesGrid';
import LoadingSpinner from './components/LoadingSpinner';
import { courseApi } from './services/api';

function App() {
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [eligibleCourses, setEligibleCourses] = useState([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const [hasCheckedEligibility, setHasCheckedEligibility] = useState(false);
  const [error, setError] = useState(null);

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
      <div className="min-h-screen">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
                <svg className="animate-spin w-8 h-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Loading Course Data</h3>
              <p className="text-slate-600">Connecting to Neo4j database...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error && courses.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="card max-w-2xl text-center">
              <div className="py-8">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl flex items-center justify-center">
                  <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Backend Connection Error</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">{error}</p>
                
                <div className="bg-slate-50 rounded-xl p-6 mb-6 text-left">
                  <h4 className="font-semibold text-slate-900 mb-3">Setup Checklist:</h4>
                  <div className="space-y-3 text-sm text-slate-600">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-xs">1</span>
                      </div>
                      <span>Spring Boot backend running on port 8080</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-xs">2</span>
                      </div>
                      <div className="flex-1">
                        <p><strong>Neo4j connection:</strong></p>
                        <p>- Neo4j Browser: <span className="text-green-600">http://localhost:7474/</span></p>
                        <p>- Java connection URL: <span className="text-blue-600">bolt://localhost:7687</span></p>
                        <p className="text-xs mt-1">The backend uses the bolt:// URL, not the HTTP interface</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-xs">3</span>
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
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ maxWidth: "1600px" }}>
        {/* Course Stats Header */}
        <div className="mb-8 text-center">
          <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-slate-500">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-semibold">{courses.length}</span>
              </div>
              <span>Available Courses</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <span className="text-emerald-600 font-semibold">{selectedCourses.length}</span>
              </div>
              <span>Completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                isCheckingEligibility ? 'bg-blue-100' : 'bg-purple-100'
              }`}>
                {isCheckingEligibility ? (
                  <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <span className="text-purple-600 font-semibold">{eligibleCourses.length}</span>
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
            />
          </div>
        </div>

                 {/* Error Message */}
         {error && courses.length > 0 && (
           <div className="mt-8">
             <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-lg">
               <div className="flex items-start space-x-3">
                 <div className="flex-shrink-0">
                   <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                     <svg className="w-5 h-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                       <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                     </svg>
                   </div>
                 </div>
                 <div className="flex-1">
                   <h4 className="font-semibold text-red-900 mb-1">Operation Failed</h4>
                   <p className="text-red-800 text-sm">{error}</p>
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
