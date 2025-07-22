import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import elk from 'cytoscape-elk';
import nodeHtmlLabel from 'cytoscape-node-html-label';
import { useTheme } from '../contexts/ThemeContext';

// Register the ELK layout and node HTML label extensions
cytoscape.use(elk);
cytoscape.use(nodeHtmlLabel);

const CourseGraph = ({ courses = [], edges = [], completedCourses = [], eligibleCourses = [], onCourseClick }) => {
  const { isDarkMode } = useTheme();
  const cyRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    console.log("CourseGraph received data:", { 
      courses, 
      edges, 
      completedCourses, 
      eligibleCourses
    });

    // Clear any existing content
    containerRef.current.innerHTML = '';

    if (!courses || courses.length === 0) {
      const noDataMsg = document.createElement('div');
      noDataMsg.className = `absolute inset-0 flex items-center justify-center text-center transition-colors duration-300 ${
        isDarkMode ? 'text-slate-400' : 'text-gray-500'
      }`;
      noDataMsg.innerHTML = `
        <div>
          <svg class="w-16 h-16 mx-auto mb-4 ${
            isDarkMode ? 'text-slate-600' : 'text-gray-300'
          }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p class="text-lg font-semibold">No course data available</p>
          <p class="text-sm mt-2">Please ensure the backend is running and courses are loaded</p>
        </div>
      `;
      containerRef.current.appendChild(noDataMsg);
      return;
    }

    // Extract course numbers from course codes for cleaner node labels
    const extractCourseNumber = (courseCode) => {
      // Extract just the number part (e.g., "CSC 1300" -> "1300")
      const match = courseCode.match(/\d+/);
      return match ? match[0] : courseCode;
    };

    // Debug the available course codes
    const availableCourseIds = courses.map(course => course.courseCode);
    console.log("Available course IDs for graph nodes:", availableCourseIds);
    
    // Filter edges to ensure they only reference existing nodes
    const validEdges = edges.filter(edge => {
      const sourceExists = availableCourseIds.includes(edge.from);
      const targetExists = availableCourseIds.includes(edge.to);
      
      if (!sourceExists) {
        console.warn(`Edge source not found: ${edge.from}`);
      }
      if (!targetExists) {
        console.warn(`Edge target not found: ${edge.to}`);
      }
      
      return sourceExists && targetExists;
    });
    
    console.log(`Filtered ${edges.length - validEdges.length} invalid edges. Using ${validEdges.length} valid edges.`);

    // Determine node status based on course eligibility
    const getNodeStatus = (courseCode) => {
      if (completedCourses.includes(courseCode)) return 'completed';
      if (eligibleCourses.includes(courseCode)) return 'eligible';
      return 'ineligible';
    };

    // Create the Cytoscape instance
    try {
      const cy = cytoscape({
        container: containerRef.current,
        elements: [
          // Nodes - courses
          ...courses.map(course => ({
            data: { 
              id: course.courseCode, 
              label: course.courseCode,
              fullName: course.courseName || course.courseCode,
              courseCode: course.courseCode,
              status: getNodeStatus(course.courseCode),
              credits: course.credits || 0
            }
          })),
          
          // Edges - prerequisites (only valid edges from backend)
          ...validEdges.map(edge => ({
            data: { 
              id: `${edge.from}-${edge.to}`,
              source: edge.from, 
              target: edge.to 
            }
          }))
        ],
        
        style: [
          {
            selector: 'node',
            style: {
              'background-color': (node) => {
                const status = node.data('status');
                if (isDarkMode) {
                  switch (status) {
                    case 'completed': return '#059669'; // Dark mode green
                    case 'eligible': return '#d97706';  // Dark mode yellow/orange
                    default: return '#6b7280';          // Dark mode grey
                  }
                } else {
                  switch (status) {
                    case 'completed': return '#22c55e'; // Light mode green
                    case 'eligible': return '#eab308';  // Light mode yellow
                    default: return '#9ca3af';          // Light mode grey
                  }
                }
              },
              'border-width': 2,
              'border-color': (node) => {
                const status = node.data('status');
                if (isDarkMode) {
                  switch (status) {
                    case 'completed': return '#047857'; // Darker dark mode green
                    case 'eligible': return '#b45309';  // Darker dark mode yellow/orange
                    default: return '#4b5563';          // Darker dark mode grey
                  }
                } else {
                  switch (status) {
                    case 'completed': return '#16a34a'; // Darker light mode green
                    case 'eligible': return '#ca8a04';  // Darker light mode yellow
                    default: return '#6b7280';          // Darker light mode grey
                  }
                }
              },
              'label': '',
              'text-valign': 'center',
              'text-halign': 'center',
              'font-size': '13px',
              'font-weight': 'normal',
              'color': '#ffffff',
              'text-outline-width': 1,
              'text-outline-color': isDarkMode ? '#000000' : '#000000',
              'width': 70,
              'height': 50,
              'shape': 'round-rectangle'
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 2,
              'line-color': isDarkMode ? '#94a3b8' : '#64748b',
              'target-arrow-color': isDarkMode ? '#94a3b8' : '#64748b',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'arrow-scale': 1.5
            }
          }
        ],
        
        layout: {
          name: 'elk',
          elk: {
            // Top-down hierarchical layout
            'algorithm': 'layered',
            'elk.direction': 'DOWN',
            
            // Spacing configuration for clean hierarchy
            'elk.layered.spacing.nodeNodeBetweenLayers': 120,
            'elk.spacing.nodeNode': 100,
            'elk.layered.spacing.edgeNodeBetweenLayers': 40,
            'elk.layered.spacing.edgeEdgeBetweenLayers': 20,
            
            // Layout strategies for optimal positioning
            'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
            'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
            'elk.layered.cycleBreaking.strategy': 'DEPTH_FIRST',
            
            // Component and padding settings
            'elk.spacing.componentComponent': 80,
            'elk.padding': '[left=60,top=60,right=60,bottom=60]',
            
            // Additional settings for better readability
            'elk.layered.compaction.postCompaction.strategy': 'EDGE_LENGTH',
            'elk.layered.compaction.postCompaction.constraints': 'SEQUENCE',
            'elk.layered.thoroughness': 10
          },
          animate: false, // Disable animation for better performance
          fit: true,
          padding: 50
        }
      });
      
      cyRef.current = cy;

      cy.nodeHtmlLabel([
        {
          query: 'node',
          halign: 'center',
          valign: 'center',
          tpl: (data) => `
            <div style="
              font-size: 14px;
              font-weight: 600;
              color: #ffffff;
              background-color: transparent;
              text-shadow: 0 0 2px black;
              padding: 2px 4px;
              text-align: center;
              line-height: 1.2;
              word-break: break-word;
            ">
              ${data.courseCode}
            </div>
          `
        }
      ]);
      
      // Add hover interactions for course details
      cy.on('mouseover', 'node', function(e) {
        const node = e.target;
        const nodeData = node.data();
        
        // Highlight the node
        node.style({
          'border-width': '4px',
          'border-color': '#3b82f6',
          'z-index': 999
        });
        
        // Create tooltip with course information
        const tooltip = document.createElement('div');
        tooltip.id = 'cy-tooltip';
        tooltip.className = `absolute rounded-lg shadow-lg p-3 z-50 max-w-xs transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-slate-800 border border-slate-700 text-white' 
            : 'bg-white border border-gray-200 text-gray-900'
        }`;
        tooltip.style.left = `${e.renderedPosition.x + 10}px`;
        tooltip.style.top = `${e.renderedPosition.y - 10}px`;
        tooltip.style.pointerEvents = 'none';
        
        const statusText = {
          'completed': isDarkMode 
            ? '<span class="text-green-400 font-bold">✓ Completed</span>'
            : '<span class="text-green-600 font-bold">✓ Completed</span>',
          'eligible': isDarkMode 
            ? '<span class="text-yellow-400 font-bold">⚠ Eligible</span>'
            : '<span class="text-yellow-600 font-bold">⚠ Eligible</span>',
          'ineligible': isDarkMode 
            ? '<span class="text-slate-500 font-bold">❌ Prerequisites not met</span>'
            : '<span class="text-gray-600 font-bold">❌ Prerequisites not met</span>'
        }[nodeData.status] || '';
        
        tooltip.innerHTML = `
          <div class="font-bold mb-1 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }">${nodeData.courseCode}</div>
          <div class="text-sm mb-2 ${
            isDarkMode ? 'text-slate-300' : 'text-gray-600'
          }">${nodeData.fullName}</div>
          <div class="text-xs">${statusText}</div>
          ${nodeData.credits > 0 ? `<div class="text-xs mt-1 ${
            isDarkMode ? 'text-slate-400' : 'text-gray-500'
          }">${nodeData.credits} credits</div>` : ''}
        `;
        
        containerRef.current.appendChild(tooltip);
      });
      
      cy.on('mouseout', 'node', function(e) {
        const node = e.target;
        const nodeData = node.data();
        
        // Reset node styling
        node.style({
          'border-width': '2px',
          'border-color': {
            'completed': '#16a34a',
            'eligible': '#ca8a04',
            'ineligible': '#6b7280'
          }[nodeData.status] || '#6b7280',
          'z-index': 1
        });
        
        // Remove tooltip
        const tooltip = document.getElementById('cy-tooltip');
        if (tooltip) {
          tooltip.remove();
        }
      });

      // Handle node clicks to show course details
      cy.on('tap', 'node', function(e) {
        const node = e.target;
        const nodeData = node.data();
        
        if (onCourseClick && nodeData.courseCode) {
          onCourseClick(nodeData.courseCode);
        }
      });
      
      // Cleanup function
      return () => {
        if (cyRef.current) {
          cyRef.current.destroy();
        }
        const tooltip = document.getElementById('cy-tooltip');
        if (tooltip) {
          tooltip.remove();
        }
      };
      
    } catch (error) {
      console.error("Error creating Cytoscape graph:", error);
      const errorMsg = document.createElement('div');
      errorMsg.className = `absolute inset-0 flex items-center justify-center text-center transition-colors duration-300 ${
        isDarkMode ? 'text-red-400' : 'text-red-600'
      }`;
      errorMsg.innerHTML = `
        <div>
          <svg class="w-16 h-16 mx-auto mb-4 ${
            isDarkMode ? 'text-red-500' : 'text-red-500'
          }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p class="text-lg font-semibold">Graph Creation Error</p>
          <p class="text-sm">Unable to create course prerequisite graph</p>
        </div>
      `;
      containerRef.current.appendChild(errorMsg);
      
      return () => {
        if (errorMsg) {
          errorMsg.remove();
        }
      };
    }
  }, [courses, edges, completedCourses, eligibleCourses, onCourseClick, isDarkMode]);

  return (
    <div className={`
      relative w-full h-full min-h-[700px] rounded-2xl overflow-hidden border transition-all duration-300
      ${isDarkMode 
        ? 'border-slate-700 bg-slate-900/50 backdrop-blur-sm' 
        : 'border-slate-200 bg-white'
      }
    `}>
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Legend */}
      <div className={`
        absolute top-4 right-4 p-4 rounded-lg shadow-lg border z-10 backdrop-blur-sm transition-colors duration-300
        ${isDarkMode 
          ? 'bg-slate-800/95 border-slate-700' 
          : 'bg-white/95 border-slate-200'
        }
      `}>
        <h4 className={`text-sm font-semibold mb-3 transition-colors duration-300 ${
          isDarkMode ? 'text-white' : 'text-slate-900'
        }`}>
          Course Status
        </h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded border ${
              isDarkMode 
                ? 'bg-[#059669] border-[#047857]' 
                : 'bg-[#22c55e] border-[#16a34a]'
            }`}></div>
            <span className={`transition-colors duration-300 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Completed
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded border ${
              isDarkMode 
                ? 'bg-[#d97706] border-[#b45309]' 
                : 'bg-[#eab308] border-[#ca8a04]'
            }`}></div>
            <span className={`transition-colors duration-300 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Eligible
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded border ${
              isDarkMode 
                ? 'bg-[#6b7280] border-[#4b5563]' 
                : 'bg-[#9ca3af] border-[#6b7280]'
            }`}></div>
            <span className={`transition-colors duration-300 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Prerequisites Not Met
            </span>
          </div>
        </div>
        <div className={`
          mt-3 pt-2 border-t transition-colors duration-300
          ${isDarkMode ? 'border-slate-600' : 'border-slate-200'}
        `}>
          <div className="flex items-center space-x-2 text-xs">
            <div className={`w-6 h-[2px] ${
              isDarkMode ? 'bg-[#94a3b8]' : 'bg-[#64748b]'
            }`}></div>
            <span className={`transition-colors duration-300 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Prerequisite
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseGraph; 