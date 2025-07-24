import { useState, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useTheme } from '../../contexts/ThemeContext';
import { usePlanner } from '../../contexts/PlannerContext';
import { courseApi } from '../../services/api';

const CourseCard = ({ 
  course, 
  semesterId = null, 
  isInCatalog = false, 
  isPlaced = false,
  onRemove = null 
}) => {
  const { isDarkMode } = useTheme();
  const { validatePrerequisites } = usePlanner();
  const [validation, setValidation] = useState({ isValid: true, missing: [] });
  const [showTooltip, setShowTooltip] = useState(false);
  const [prerequisiteText, setPrerequisiteText] = useState('');
  
  // Set up draggable
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: course.id || course.courseCode,
    data: {
      course,
      semesterId,
      isFromCatalog: isInCatalog
    }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  // Function to convert prerequisite tree to readable logical statement
  const convertPrerequisiteTreeToString = (prerequisiteTree, isRoot = true) => {
    if (!prerequisiteTree) return 'No prerequisites';
    
    // If it's a leaf node (course)
    if (prerequisiteTree.courseCode) {
      return prerequisiteTree.courseCode;
    }
    
    // If it has children (AND/OR node)
    if (prerequisiteTree.children && prerequisiteTree.children.length > 0) {
      const childStrings = prerequisiteTree.children.map(child => 
        convertPrerequisiteTreeToString(child, false)
      );
      
      if (prerequisiteTree.type === 'AND') {
        // Join with 'and' and wrap in parentheses only if not root and more than one child
        return childStrings.length > 1 
          ? (isRoot ? childStrings.join(' and ') : `(${childStrings.join(' and ')})`)
          : childStrings[0];
      } else if (prerequisiteTree.type === 'OR') {
        // Join with 'or' and wrap in parentheses only if not root and more than one child
        return childStrings.length > 1 
          ? (isRoot ? childStrings.join(' or ') : `(${childStrings.join(' or ')})`)
          : childStrings[0];
      }
    }
    
    return 'No prerequisites';
  };

  // Validate prerequisites when course is placed in a semester
  useEffect(() => {
    if (!isInCatalog && semesterId) {
      const validate = async () => {
        const result = await validatePrerequisites(course.courseCode, semesterId);
        setValidation(result);
        
        // If validation failed, fetch the prerequisite tree for tooltip
        if (!result.isValid) {
          try {
            const prereqTree = await courseApi.getCoursePrerequisiteTree(course.courseCode);
            const formattedPrereqs = convertPrerequisiteTreeToString(prereqTree);
            setPrerequisiteText(formattedPrereqs);
          } catch (error) {
            console.warn(`Could not get prerequisite tree for ${course.courseCode}:`, error);
            setPrerequisiteText('Prerequisites not available');
          }
        }
      };
      validate();
    }
  }, [course.courseCode, semesterId, isInCatalog, validatePrerequisites]);

  // Get department from course code
  const getDepartment = (courseCode) => {
    return courseCode.match(/^[A-Z]+/)?.[0] || '';
  };

  // Get course number
  const getCourseNumber = (courseCode) => {
    return courseCode.match(/\d+/)?.[0] || '';
  };

  // Get color based on department
  const getDepartmentColor = (dept) => {
    const colors = {
      'CSC': isDarkMode ? 'from-blue-600 to-blue-800' : 'from-blue-400 to-blue-600',
      'MAT': isDarkMode ? 'from-green-600 to-green-800' : 'from-green-400 to-green-600',
      'ECE': isDarkMode ? 'from-purple-600 to-purple-800' : 'from-purple-400 to-purple-600',
      'ENG': isDarkMode ? 'from-red-600 to-red-800' : 'from-red-400 to-red-600',
      'PHY': isDarkMode ? 'from-yellow-600 to-yellow-800' : 'from-yellow-400 to-yellow-600',
    };
    return colors[dept] || (isDarkMode ? 'from-gray-600 to-gray-800' : 'from-gray-400 to-gray-600');
  };

  // Get validation styling
  const getValidationStyle = () => {
    if (isInCatalog) return '';
    
    if (!validation.isValid) {
      return 'ring-2 ring-red-400 ring-opacity-75';
    }
    return 'ring-2 ring-green-400 ring-opacity-50';
  };

  const department = getDepartment(course.courseCode);
  const courseNumber = getCourseNumber(course.courseCode);
  const credits = course.creditHours || 3;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        relative group cursor-grab active:cursor-grabbing
        ${isDragging ? 'opacity-50 z-50' : 'opacity-100'}
        ${isPlaced && isInCatalog ? 'opacity-60' : ''}
      `}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className={`
        rounded-xl shadow-lg border transition-all duration-200 hover:shadow-xl
        ${isDarkMode 
          ? 'bg-slate-800 border-slate-700 hover:border-slate-600' 
          : 'bg-white border-gray-200 hover:border-gray-300'
        }
        ${getValidationStyle()}
        ${isDragging ? 'rotate-3 scale-105' : ''}
        ${isPlaced && isInCatalog ? 'grayscale' : ''}
      `}>


        {/* Remove button (only for placed courses) */}
        {!isInCatalog && onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className={`
              absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center
              ${isDarkMode 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
              }
              opacity-0 group-hover:opacity-100 transition-opacity duration-200
              shadow-lg z-10
            `}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Course content */}
        <div className="p-3">
          {/* Course code and credits */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-1">
              <span className={`text-xs font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {department}
              </span>
              <span className={`text-sm font-bold ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>
                {courseNumber}
              </span>
            </div>
            <div className={`
              px-1.5 py-0.5 rounded text-xs font-medium
              ${isDarkMode 
                ? 'bg-slate-700 text-slate-300' 
                : 'bg-gray-100 text-gray-600'
              }
            `}>
              {credits}
            </div>
          </div>

          {/* Course name */}
          <h3 className={`text-xs font-medium leading-tight mb-2 line-clamp-2 ${
            isDarkMode ? 'text-slate-200' : 'text-gray-700'
          }`}>
            {course.courseName}
          </h3>

          {/* Validation status */}
          {!isInCatalog && (
            <div className="flex items-center justify-center">
              {validation.isValid ? (
                <div className="flex items-center space-x-1 text-green-600">
     
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-red-600">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-xs">Missing</span>
                </div>
              )}
            </div>
          )}

          {/* Placed indicator for catalog items */}
          {isInCatalog && isPlaced && (
            <div className="flex items-center justify-center space-x-1 text-gray-500 mt-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-xs">Placed</span>
            </div>
          )}
        </div>

        {/* Tooltip */}
        {showTooltip && validation.missing.length > 0 && (
          <div className={`
            absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 rounded-lg shadow-lg z-50
            ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}
            border text-xs max-w-xs text-center
          `}>
            Prerequisites: {prerequisiteText || 'Loading...'}
            <div className={`
              absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0
              border-l-4 border-r-4 border-b-4 border-transparent
              ${isDarkMode ? 'border-b-gray-900' : 'border-b-white'}
            `} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard; 