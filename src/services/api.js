// API configuration
const API_BASE_URL = 'http://localhost:8080'; // Update this to match your backend URL

// Utility function for making API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// API functions
export const courseApi = {
  // Fetch all courses
  getAllCourses: async () => {
    try {
      const courses = await apiRequest('/api/courses/get-all-courses');
      // Transform courses to ensure consistent format
      return courses.map(course => ({
        courseCode: course.courseCode,
        courseName: course.courseName,
        courseDescription: course.courseDescription || '',
        credits: course.credits || 0,
        prerequisiteLogic: course.prerequisiteLogic
      }));
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Return empty array on error to prevent app crash
      return [];
    }
  },

  // Check course eligibility
  checkEligibility: async (completedCourses) => {
    try {
      const eligibleCourses = await apiRequest('/api/courses/eligible', {
        method: 'POST',
        body: JSON.stringify({ completedCourses }),
      });
      
      // Transform eligible courses to ensure consistent format
      return eligibleCourses.map(course => ({
        courseCode: course.courseCode,
        courseName: course.courseName,
        courseDescription: course.courseDescription || '',
        credits: course.credits || 0,
        prerequisiteLogic: course.prerequisiteLogic
      }));
    } catch (error) {
      console.error('Error checking eligibility:', error);
      // Return empty array on error to prevent app crash
      return [];
    }
  },

  // Get a specific course by code
  getCourse: async (courseCode) => {
    try {
      return await apiRequest(`/api/courses/${courseCode}`);
    } catch (error) {
      console.error(`Error fetching course ${courseCode}:`, error);
      return null;
    }
  }
}; 