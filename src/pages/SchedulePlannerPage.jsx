import React from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';

import { useTheme } from '../contexts/ThemeContext';
import { PlannerProvider, usePlanner } from '../contexts/PlannerContext';
import PlannerSetup from '../components/planner/PlannerSetup';
import CatalogPanel from '../components/planner/CatalogPanel';
import SemesterColumn from '../components/planner/SemesterColumn';
import ProgressTracker from '../components/planner/ProgressTracker';
import CourseCard from '../components/planner/CourseCard';

const PlannerContent = () => {
  const { isDarkMode } = useTheme();
  const { 
    semesters, 
    isSetupComplete,
    setSetupDates,
    addCourseToSemester, 
    removeCourseFromSemester,
    moveCourse, 
    addSemester, 
    removeSemester,
    undo,
    redo,
    canUndo,
    canRedo
  } = usePlanner();

  const [activeDragId, setActiveDragId] = React.useState(null);
  const [activeDragData, setActiveDragData] = React.useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveDragId(active.id);
    setActiveDragData(active.data.current);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    setActiveDragId(null);
    setActiveDragData(null);

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Handle dropping course from catalog to semester
    if (activeData?.isFromCatalog && overData?.type === 'semester') {
      addCourseToSemester(activeData.course, overData.semester.id);
      return;
    }

    // Handle moving course between semesters
    if (activeData?.semesterId && overData?.type === 'semester') {
      const sourceSemesterId = activeData.semesterId;
      const destSemesterId = overData.semester.id;
      
      if (sourceSemesterId !== destSemesterId) {
        // Find the course to move
        const sourceSemester = semesters.find(s => s.id === sourceSemesterId);
        const courseToMove = sourceSemester?.courses.find(c => c.id === active.id);
        
        if (courseToMove) {
          moveCourse(sourceSemesterId, destSemesterId, active.id, 0);
        }
      }
    }
  };

  const handleDragOver = (event) => {
    // Optional: Handle drag over events for visual feedback
  };

  const handleSetupComplete = (dates) => {
    setSetupDates(dates);
  };

  // Show setup form if not completed
  if (!isSetupComplete) {
    return <PlannerSetup onComplete={handleSetupComplete} />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className={`
        h-full transition-colors duration-300
        ${isDarkMode 
          ? 'bg-gradient-to-br from-slate-900 to-slate-800' 
          : 'bg-gradient-to-br from-slate-50 to-blue-50'
        }
      `}>
        {/* Toolbar */}
        <div className={`
          sticky top-0 z-10 backdrop-blur-sm border-b
          ${isDarkMode 
            ? 'bg-slate-900/80 border-slate-700' 
            : 'bg-white/80 border-gray-200'
          }
        `}>
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <h1 className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Schedule Planner
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={addSemester}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2
                  ${isDarkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }
                  shadow-lg hover:shadow-xl
                `}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Semester</span>
              </button>
              
              <button
                onClick={() => {
                  const confirmed = window.confirm('Are you sure you want to clear all semesters? This will remove all planned courses and cannot be undone.');
                  if (confirmed) {
                    // Clear localStorage
                    localStorage.removeItem('coursePlanner');
                    // Reset all semesters to empty state
                    semesters.forEach(semester => {
                      semester.courses.forEach(course => {
                        removeCourseFromSemester(course.id, semester.id);
                      });
                    });
                  }
                }}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2
                  ${isDarkMode 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-red-500 hover:bg-red-600 text-white'
                  }
                  shadow-lg hover:shadow-xl
                `}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Clear All</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex h-screen overflow-hidden">
          {/* Course Catalog Sidebar */}
          <div className="flex-shrink-0 p-4" style={{ width: '336px' }}>
            <CatalogPanel />
          </div>

          {/* Semester Grid - Two columns, vertical scroll */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
            <div className="grid grid-cols-2 gap-4 max-w-6xl mx-auto">
              <SortableContext
                items={semesters.map(s => s.id)}
                strategy={horizontalListSortingStrategy}
              >
                {semesters.map((semester) => (
                  <SemesterColumn
                    key={semester.id}
                    semester={semester}
                    onRemoveSemester={(semesterId) => {
                      if (semester.courses.length > 0) {
                        const confirmed = window.confirm(
                          `Are you sure you want to remove ${semester.season} ${semester.year}? This will remove all ${semester.courses.length} courses in this semester.`
                        );
                        if (!confirmed) return;
                      }
                      removeSemester(semesterId);
                    }}
                  />
                ))}
              </SortableContext>
            </div>
          </div>

          {/* Progress Tracker Sidebar */}
          <div className="flex-shrink-0 p-4" style={{ width: '304px' }}>
            <ProgressTracker />
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeDragId && activeDragData ? (
            <div className="rotate-3 scale-105">
              <CourseCard
                course={activeDragData.course}
                isInCatalog={activeDragData.isFromCatalog}
              />
            </div>
          ) : null}
        </DragOverlay>

        {/* Keyboard shortcuts hint */}
        <div className={`
          fixed bottom-4 left-4 px-3 py-2 rounded-lg text-xs
          ${isDarkMode 
            ? 'bg-slate-800 border border-slate-700 text-slate-400' 
            : 'bg-white border border-gray-200 text-gray-500'
          }
          shadow-lg opacity-75 hover:opacity-100 transition-opacity duration-200
        `}>
          <div className="flex items-center space-x-4">
            <span><kbd className="font-mono">Ctrl+Z</kbd> Undo</span>
            <span><kbd className="font-mono">Ctrl+Y</kbd> Redo</span>
            <span>Drag courses to plan</span>
          </div>
        </div>
      </div>
    </DndContext>
  );
};

const SchedulePlannerPage = () => {
  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        // Undo will be handled by the PlannerContent component
      } else if ((event.ctrlKey || event.metaKey) && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
        event.preventDefault();
        // Redo will be handled by the PlannerContent component
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <PlannerProvider>
      <PlannerContent />
    </PlannerProvider>
  );
};

export default SchedulePlannerPage; 