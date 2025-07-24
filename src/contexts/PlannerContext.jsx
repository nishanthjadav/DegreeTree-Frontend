import { createContext, useContext, useReducer, useEffect } from 'react';
import { courseApi } from '../services/api';

const PlannerContext = createContext();

// Action types
const ACTIONS = {
  SET_COURSES: 'SET_COURSES',
  SET_SEMESTERS: 'SET_SEMESTERS',
  SET_SETUP_DATES: 'SET_SETUP_DATES',
  ADD_SEMESTER: 'ADD_SEMESTER',
  REMOVE_SEMESTER: 'REMOVE_SEMESTER',
  ADD_COURSE_TO_SEMESTER: 'ADD_COURSE_TO_SEMESTER',
  REMOVE_COURSE_FROM_SEMESTER: 'REMOVE_COURSE_FROM_SEMESTER',
  MOVE_COURSE: 'MOVE_COURSE',
  SET_FILTER: 'SET_FILTER',
  SET_SEARCH: 'SET_SEARCH',
  SAVE_HISTORY: 'SAVE_HISTORY',
  UNDO: 'UNDO',
  REDO: 'REDO',
  LOAD_FROM_STORAGE: 'LOAD_FROM_STORAGE'
};

// Generate semester ID
const generateSemesterId = (season, year) => `${season.toLowerCase()}-${year}`;

// Generate semesters based on start and graduation dates
const generateSemestersFromDates = (startDate, gradDate) => {
  const semesters = [];
  
  let currentYear = startDate.year;
  let currentSeason = startDate.season;
  
  // Skip summer if starting in summer (move to Fall)
  if (currentSeason === 'Summer') {
    currentSeason = 'Fall';
  }
  
  // Generate semesters until we reach graduation date
  while (currentYear < gradDate.year || 
         (currentYear === gradDate.year && currentSeason !== gradDate.season)) {
    
    // Add current semester
    semesters.push({
      id: generateSemesterId(currentSeason, currentYear),
      season: currentSeason,
      year: currentYear,
      courses: [],
      maxCredits: 18,
      minCredits: 12
    });
    
    // Move to next semester (skip summer unless it's graduation)
    if (currentSeason === 'Spring') {
      currentSeason = 'Fall';
    } else if (currentSeason === 'Fall') {
      currentSeason = 'Spring';
      currentYear++;
    }
  }
  
  // Add the final graduation semester
  semesters.push({
    id: generateSemesterId(gradDate.season, gradDate.year),
    season: gradDate.season,
    year: gradDate.year,
    courses: [],
    maxCredits: 18,
    minCredits: 12
  });
  
  return semesters;
};

// Generate default semesters (fallback)
const generateDefaultSemesters = () => {
  const currentYear = new Date().getFullYear();
  const startDate = { year: currentYear, season: 'Fall', month: 8 };
  const gradDate = { year: currentYear + 4, season: 'Spring', month: 5 };
  return generateSemestersFromDates(startDate, gradDate);
};

// Initial state
const initialState = {
  courses: [],
  semesters: [],
  setupDates: null,
  isSetupComplete: false,
  filter: {
    department: '',
    search: '',
    creditHours: ''
  },
  history: [],
  historyIndex: -1,
  prerequisites: new Map() // Cache for prerequisite data
};

// Reducer
const plannerReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_COURSES:
      return {
        ...state,
        courses: action.payload
      };
      
    case ACTIONS.SET_SEMESTERS:
      return {
        ...state,
        semesters: action.payload
      };
      
    case ACTIONS.SET_SETUP_DATES:
      const { startDate, gradDate } = action.payload;
      return {
        ...state,
        setupDates: { startDate, gradDate },
        isSetupComplete: true,
        semesters: generateSemestersFromDates(startDate, gradDate)
      };
      
    case ACTIONS.ADD_SEMESTER:
      const lastSemester = state.semesters[state.semesters.length - 1];
      const seasons = ['Spring', 'Summer', 'Fall'];
      const currentSeasonIndex = seasons.indexOf(lastSemester.season);
      const nextSeasonIndex = (currentSeasonIndex + 1) % seasons.length;
      const nextYear = nextSeasonIndex === 0 ? lastSemester.year + 1 : lastSemester.year;
      
      const newSemester = {
        id: generateSemesterId(seasons[nextSeasonIndex], nextYear),
        season: seasons[nextSeasonIndex],
        year: nextYear,
        courses: [],
        maxCredits: 18,
        minCredits: 12
      };
      
      return {
        ...state,
        semesters: [...state.semesters, newSemester]
      };
      
    case ACTIONS.REMOVE_SEMESTER:
      return {
        ...state,
        semesters: state.semesters.filter(sem => sem.id !== action.payload)
      };
      
    case ACTIONS.ADD_COURSE_TO_SEMESTER:
      return {
        ...state,
        semesters: state.semesters.map(semester => 
          semester.id === action.payload.semesterId
            ? {
                ...semester,
                courses: [...semester.courses, {
                  ...action.payload.course,
                  id: `${action.payload.course.courseCode}-${Date.now()}`
                }]
              }
            : semester
        )
      };
      
    case ACTIONS.REMOVE_COURSE_FROM_SEMESTER:
      return {
        ...state,
        semesters: state.semesters.map(semester => 
          semester.id === action.payload.semesterId
            ? {
                ...semester,
                courses: semester.courses.filter(course => course.id !== action.payload.courseId)
              }
            : semester
        )
      };
      
    case ACTIONS.MOVE_COURSE:
      const { sourceSemesterId, destSemesterId, courseId, newIndex } = action.payload;
      
      // Remove from source
      let courseToMove = null;
      const semestersAfterRemoval = state.semesters.map(semester => {
        if (semester.id === sourceSemesterId) {
          const courseIndex = semester.courses.findIndex(c => c.id === courseId);
          if (courseIndex !== -1) {
            courseToMove = semester.courses[courseIndex];
            return {
              ...semester,
              courses: semester.courses.filter(c => c.id !== courseId)
            };
          }
        }
        return semester;
      });
      
      // Add to destination
      const finalSemesters = semestersAfterRemoval.map(semester => {
        if (semester.id === destSemesterId && courseToMove) {
          const newCourses = [...semester.courses];
          newCourses.splice(newIndex, 0, courseToMove);
          return {
            ...semester,
            courses: newCourses
          };
        }
        return semester;
      });
      
      return {
        ...state,
        semesters: finalSemesters
      };
      
    case ACTIONS.SET_FILTER:
      return {
        ...state,
        filter: {
          ...state.filter,
          ...action.payload
        }
      };
      
    case ACTIONS.SET_SEARCH:
      return {
        ...state,
        filter: {
          ...state.filter,
          search: action.payload
        }
      };
      
    case ACTIONS.SAVE_HISTORY:
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push({
        semesters: JSON.parse(JSON.stringify(state.semesters)),
        timestamp: Date.now()
      });
      
      // Keep only last 50 history entries
      if (newHistory.length > 50) {
        newHistory.shift();
      }
      
      return {
        ...state,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
      
    case ACTIONS.UNDO:
      if (state.historyIndex > 0) {
        return {
          ...state,
          semesters: JSON.parse(JSON.stringify(state.history[state.historyIndex - 1].semesters)),
          historyIndex: state.historyIndex - 1
        };
      }
      return state;
      
    case ACTIONS.REDO:
      if (state.historyIndex < state.history.length - 1) {
        return {
          ...state,
          semesters: JSON.parse(JSON.stringify(state.history[state.historyIndex + 1].semesters)),
          historyIndex: state.historyIndex + 1
        };
      }
      return state;
      
    case ACTIONS.LOAD_FROM_STORAGE:
      const loadedData = action.payload;
      return {
        ...state,
        ...loadedData,
        // If no setup dates exist, mark as incomplete
        isSetupComplete: !!loadedData.setupDates,
        // Use default semesters if none exist
        semesters: loadedData.semesters || []
      };
      
    default:
      return state;
  }
};

// Context Provider
export const PlannerProvider = ({ children }) => {
  const [state, dispatch] = useReducer(plannerReducer, initialState);
  
  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('coursePlanner');
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        dispatch({ type: ACTIONS.LOAD_FROM_STORAGE, payload: parsedData });
      } catch (error) {
        console.error('Failed to load planner data:', error);
      }
    }
  }, []);
  
  // Save to localStorage whenever semesters change
  useEffect(() => {
    const dataToSave = {
      semesters: state.semesters,
      filter: state.filter,
      setupDates: state.setupDates,
      isSetupComplete: state.isSetupComplete
    };
    localStorage.setItem('coursePlanner', JSON.stringify(dataToSave));
  }, [state.semesters, state.filter, state.setupDates, state.isSetupComplete]);
  
  // Load courses from API
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const courses = await courseApi.getAllCourses();
        dispatch({ type: ACTIONS.SET_COURSES, payload: courses });
      } catch (error) {
        console.error('Failed to load courses:', error);
      }
    };
    
    loadCourses();
  }, []);
  
  // Helper functions
  const addCourseToSemester = (course, semesterId) => {
    dispatch({ type: ACTIONS.SAVE_HISTORY });
    dispatch({ 
      type: ACTIONS.ADD_COURSE_TO_SEMESTER, 
      payload: { course, semesterId } 
    });
  };
  
  const removeCourseFromSemester = (courseId, semesterId) => {
    dispatch({ type: ACTIONS.SAVE_HISTORY });
    dispatch({ 
      type: ACTIONS.REMOVE_COURSE_FROM_SEMESTER, 
      payload: { courseId, semesterId } 
    });
  };
  
  const moveCourse = (sourceSemesterId, destSemesterId, courseId, newIndex) => {
    dispatch({ type: ACTIONS.SAVE_HISTORY });
    dispatch({ 
      type: ACTIONS.MOVE_COURSE, 
      payload: { sourceSemesterId, destSemesterId, courseId, newIndex } 
    });
  };
  
  const addSemester = () => {
    dispatch({ type: ACTIONS.ADD_SEMESTER });
  };
  
  const removeSemester = (semesterId) => {
    dispatch({ type: ACTIONS.REMOVE_SEMESTER, payload: semesterId });
  };
  
  const setFilter = (filterUpdates) => {
    dispatch({ type: ACTIONS.SET_FILTER, payload: filterUpdates });
  };
  
  const setSearch = (searchTerm) => {
    dispatch({ type: ACTIONS.SET_SEARCH, payload: searchTerm });
  };
  
  const undo = () => {
    dispatch({ type: ACTIONS.UNDO });
  };
  
  const redo = () => {
    dispatch({ type: ACTIONS.REDO });
  };
  
  const setSetupDates = (dates) => {
    dispatch({ type: ACTIONS.SET_SETUP_DATES, payload: dates });
  };
  
  // Get filtered courses
  const getFilteredCourses = () => {
    return state.courses.filter(course => {
      const matchesSearch = !state.filter.search || 
        course.courseCode.toLowerCase().includes(state.filter.search.toLowerCase()) ||
        course.courseName.toLowerCase().includes(state.filter.search.toLowerCase());
      
      const matchesDepartment = !state.filter.department || 
        course.courseCode.startsWith(state.filter.department);
      
      return matchesSearch && matchesDepartment;
    }).sort((a, b) => {
      // Extract department and course number for sorting
      const getDeptAndNumber = (courseCode) => {
        const match = courseCode.match(/^([A-Z]+)\s*(\d+)/);
        return {
          dept: match ? match[1] : courseCode,
          number: match ? parseInt(match[2]) : 0
        };
      };
      
      const aInfo = getDeptAndNumber(a.courseCode);
      const bInfo = getDeptAndNumber(b.courseCode);
      
      // First sort by department
      if (aInfo.dept !== bInfo.dept) {
        return aInfo.dept.localeCompare(bInfo.dept);
      }
      
      // Then sort by course number (smallest to largest)
      return aInfo.number - bInfo.number;
    });
  };
  
  // Get courses already placed in semesters
  const getPlacedCourses = () => {
    const placed = new Set();
    state.semesters.forEach(semester => {
      semester.courses.forEach(course => {
        placed.add(course.courseCode);
      });
    });
    return placed;
  };
  
  // Calculate total credits for a semester
  const getSemesterCredits = (semesterId) => {
    const semester = state.semesters.find(s => s.id === semesterId);
    if (!semester) return 0;
    
    return semester.courses.reduce((total, course) => {
      return total + (course.creditHours || 3); // Default to 3 if not specified
    }, 0);
  };
  
  // Get prerequisite validation for a course in a specific semester
  const validatePrerequisites = async (courseCode, semesterId) => {
    try {
      const prereqData = await courseApi.getCoursePrerequisites(courseCode);
      if (!prereqData?.prerequisites?.length) return { isValid: true, missing: [] };
      
      // Get all courses taken before this semester
      const semesterIndex = state.semesters.findIndex(s => s.id === semesterId);
      const previousSemesters = state.semesters.slice(0, semesterIndex);
      
      const completedCourses = new Set();
      previousSemesters.forEach(semester => {
        semester.courses.forEach(course => {
          completedCourses.add(course.courseCode);
        });
      });
      
      const missing = [];
      prereqData.prerequisites.forEach(prereq => {
        if (!completedCourses.has(prereq.courseCode)) {
          missing.push(prereq.courseCode);
        }
      });
      
      return {
        isValid: missing.length === 0,
        missing: missing
      };
    } catch (error) {
      console.error('Error validating prerequisites:', error);
      return { isValid: true, missing: [] };
    }
  };
  
  const value = {
    // State
    courses: state.courses,
    semesters: state.semesters,
    filter: state.filter,
    setupDates: state.setupDates,
    isSetupComplete: state.isSetupComplete,
    canUndo: state.historyIndex > 0,
    canRedo: state.historyIndex < state.history.length - 1,
    
    // Actions
    addCourseToSemester,
    removeCourseFromSemester,
    moveCourse,
    addSemester,
    removeSemester,
    setFilter,
    setSearch,
    undo,
    redo,
    setSetupDates,
    
    // Helpers
    getFilteredCourses,
    getPlacedCourses,
    getSemesterCredits,
    validatePrerequisites
  };
  
  return (
    <PlannerContext.Provider value={value}>
      {children}
    </PlannerContext.Provider>
  );
};

export const usePlanner = () => {
  const context = useContext(PlannerContext);
  if (!context) {
    throw new Error('usePlanner must be used within a PlannerProvider');
  }
  return context;
}; 