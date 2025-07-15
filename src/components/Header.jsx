const Header = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 rounded-xl">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Course Planner
              </h1>
              <p className="text-blue-100 text-sm">
                Smart prerequisite tracking & course planning
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 