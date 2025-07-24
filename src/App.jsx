import { useState, useEffect } from 'react';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';
import { EligibleCoursesPage, SchedulePlannerPage, AboutPage } from './pages';
import { courseApi } from './services/api';
import { useTheme } from './contexts/ThemeContext';

function App() {
  const { isDarkMode } = useTheme();
  const [courses, setCourses] = useState([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('eligible');

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

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  // Render current tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'eligible':
        return <EligibleCoursesPage courses={courses} setCourses={setCourses} error={error} setError={setError} />;
      case 'planner':
        return <SchedulePlannerPage />;
      case 'about':
        return <AboutPage />;
      default:
        return <EligibleCoursesPage courses={courses} setCourses={setCourses} error={error} setError={setError} />;
    }
  };

  if (isLoadingCourses) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-slate-900 to-slate-800' 
          : 'bg-gradient-to-br from-slate-50 to-blue-50'
      }`}>
        <Header activeTab={activeTab} onTabChange={handleTabChange} />
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
        <Header activeTab={activeTab} onTabChange={handleTabChange} />
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
      <Header activeTab={activeTab} onTabChange={handleTabChange} />
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ maxWidth: "1600px" }}>
        {renderTabContent()}
      </main>
    </div>
  );
}

export default App;
