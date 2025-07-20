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

// Utility function to check if prerequisites are satisfied
const arePrerequisitesSatisfied = (prerequisiteNode, completedCourses) => {
  if (!prerequisiteNode) return true;
  
  // If it's a leaf node (Course), check if it's completed
  if (prerequisiteNode.courseCode) {
    return completedCourses.includes(prerequisiteNode.courseCode);
  }
  
  // If it's an operator node, check based on operator type
  if (prerequisiteNode.type && prerequisiteNode.children) {
    const childResults = prerequisiteNode.children.map(child => 
      arePrerequisitesSatisfied(child, completedCourses)
    );
    
    if (prerequisiteNode.type === 'AND') {
      return childResults.every(result => result);
    } else if (prerequisiteNode.type === 'OR') {
      return childResults.some(result => result);
    }
  }
  
  return true;
};

// Utility function to collect all prerequisite course codes from a prerequisite tree
const collectAllPrerequisites = (prerequisiteNode, prerequisites = new Set()) => {
  if (!prerequisiteNode) return prerequisites;
  
  // If it's a leaf node (Course), add to prerequisites
  if (prerequisiteNode.courseCode) {
    prerequisites.add(prerequisiteNode.courseCode);
    return prerequisites;
  }
  
  // If it's an operator node, recursively collect from children
  if (prerequisiteNode.children) {
    prerequisiteNode.children.forEach(child => {
      collectAllPrerequisites(child, prerequisites);
    });
  }
  
  return prerequisites;
};

// API functions
export const courseApi = {
  // Fetch all courses
  getAllCourses: async () => {
    try {
      const courses = await apiRequest('/courses');
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

  // Get a specific course by code
  getCourseByCode: async (courseCode) => {
    try {
      return await apiRequest(`/courses/code/${courseCode}`);
    } catch (error) {
      console.error(`Error fetching course ${courseCode}:`, error);
      return null;
    }
  },

  // Get prerequisites for a specific course
  getCoursePrerequisites: async (courseCode) => {
    try {
      return await apiRequest(`/courses/code/${courseCode}/prerequisites`);
    } catch (error) {
      console.error(`Error fetching prerequisites for ${courseCode}:`, error);
      return null;
    }
  },

  // Get prerequisite tree for a specific course
  getCoursePrerequisiteTree: async (courseCode) => {
    try {
      return await apiRequest(`/courses/code/${courseCode}/prerequisite-tree`);
    } catch (error) {
      console.error(`Error fetching prerequisite tree for ${courseCode}:`, error);
      return null;
    }
  },

  // Check course eligibility (client-side implementation)
  checkEligibility: async (completedCourses) => {
    try {
      const allCourses = await courseApi.getAllCourses();
      const eligibleCourses = [];
      
      // Get all prerequisites of completed courses (implied completed courses)
      const impliedCompletedCourses = new Set(completedCourses);
      
      // Collect prerequisites of completed courses - BUT ONLY for courses with exactly one prerequisite
      for (const courseCode of completedCourses) {
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
      
      // Check each course for eligibility
      for (const course of allCourses) {
        // Skip if course is already completed (explicitly or implicitly)
        if (impliedCompletedCourses.has(course.courseCode)) {
          continue;
        }
        
        // Check if prerequisites are satisfied
        try {
          // Try new prerequisite tree endpoint first
          const prereqTree = await courseApi.getCoursePrerequisiteTree(course.courseCode);
          
          if (!prereqTree || Object.keys(prereqTree).length === 0) {
            // No prerequisites, course is eligible
            eligibleCourses.push(course);
          } else {
            // Check if prerequisites are satisfied using the tree structure
            const satisfied = arePrerequisitesSatisfied(prereqTree, Array.from(impliedCompletedCourses));
            if (satisfied) {
              eligibleCourses.push(course);
            }
          }
        } catch (error) {
          console.warn(`Could not check prerequisites for ${course.courseCode}:`, error);
          // If we can't check prerequisites, assume it's eligible
          eligibleCourses.push(course);
        }
      }
      
      return eligibleCourses;
    } catch (error) {
      console.error('Error checking eligibility:', error);
      return [];
    }
  },

  // Get prerequisite relationships for graph visualization
  getPrerequisiteRelationships: async () => {
    try {
      const allCourses = await courseApi.getAllCourses();
      const relationships = {};
      
      // Get prerequisites for each course
      for (const course of allCourses) {
        try {
          const prereqData = await courseApi.getCoursePrerequisites(course.courseCode);
          const prerequisites = [];
          
          if (prereqData && prereqData.prerequisites) {
            prereqData.prerequisites.forEach(prereq => {
              prerequisites.push(prereq.courseCode);
            });
          }
          
          relationships[course.courseCode] = prerequisites;
        } catch (error) {
          console.warn(`Could not get prerequisites for ${course.courseCode}:`, error);
          relationships[course.courseCode] = [];
        }
      }
      
      return relationships;
    } catch (error) {
      console.error('Error fetching prerequisite relationships:', error);
      return {};
    }
  }
}; 