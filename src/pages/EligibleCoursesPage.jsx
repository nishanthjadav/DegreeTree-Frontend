import { useState, useEffect } from 'react';
import CourseSelector from '../components/CourseSelector';
import EligibleCoursesGrid from '../components/EligibleCoursesGrid';
import { courseApi } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

const EligibleCoursesPage = ({ courses, setCourses, error, setError }) => {
  const { isDarkMode } = useTheme();
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [eligibleCourses, setEligibleCourses] = useState([]);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const [hasCheckedEligibility, setHasCheckedEligibility] = useState(false);

  // Calculate all completed courses including auto-completed prerequisites
  const [allCompletedCourses, setAllCompletedCourses] = useState([]);

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

  return (
    <>
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
    </>
  );
};

export default EligibleCoursesPage; 