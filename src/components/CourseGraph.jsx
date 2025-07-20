import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import elk from 'cytoscape-elk';

// Register the ELK layout
cytoscape.use(elk);

const CourseGraph = ({ courses = [], edges = [], completedCourses = [], eligibleCourses = [], onCourseClick }) => {
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
      noDataMsg.className = 'absolute inset-0 flex items-center justify-center text-center text-gray-500';
      noDataMsg.innerHTML = `
        <div>
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                switch (status) {
                  case 'completed': return '#22c55e'; // Green
                  case 'eligible': return '#eab308';  // Yellow
                  default: return '#9ca3af';          // Grey
                }
              },
              'border-width': 2,
              'border-color': (node) => {
                const status = node.data('status');
                switch (status) {
                  case 'completed': return '#16a34a'; // Darker green
                  case 'eligible': return '#ca8a04';  // Darker yellow
                  default: return '#6b7280';          // Darker grey
                }
              },
              'label': 'data(label)',
              'text-valign': 'center',
              'text-halign': 'center',
              'font-size': '12px',
              'font-weight': 'bold',
              'color': '#ffffff',
              'text-outline-width': 1,
              'text-outline-color': '#000000',
              'width': 70,
              'height': 50,
              'shape': 'round-rectangle'
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 2,
              'line-color': '#64748b',
              'target-arrow-color': '#64748b',
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
        tooltip.className = 'absolute bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 max-w-xs';
        tooltip.style.left = `${e.renderedPosition.x + 10}px`;
        tooltip.style.top = `${e.renderedPosition.y - 10}px`;
        tooltip.style.pointerEvents = 'none';
        
        const statusText = {
          'completed': '<span class="text-green-600 font-bold">✓ Completed</span>',
          'eligible': '<span class="text-yellow-600 font-bold">⚠ Eligible</span>',
          'ineligible': '<span class="text-gray-600 font-bold">❌ Prerequisites not met</span>'
        }[nodeData.status] || '';
        
        tooltip.innerHTML = `
          <div class="font-bold text-gray-900 mb-1">${nodeData.courseCode}</div>
          <div class="text-sm text-gray-600 mb-2">${nodeData.fullName}</div>
          <div class="text-xs">${statusText}</div>
          ${nodeData.credits > 0 ? `<div class="text-xs text-gray-500 mt-1">${nodeData.credits} credits</div>` : ''}
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
      errorMsg.className = 'absolute inset-0 flex items-center justify-center text-center text-red-600';
      errorMsg.innerHTML = `
        <div>
          <svg class="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
  }, [courses, edges, completedCourses, eligibleCourses, onCourseClick]);

  return (
    <div className="relative w-full h-full min-h-[700px] rounded-2xl overflow-hidden border border-slate-200 bg-white">
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-slate-200 z-10">
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Course Status</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-[#22c55e] border border-[#16a34a]"></div>
            <span className="text-slate-700">Completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-[#eab308] border border-[#ca8a04]"></div>
            <span className="text-slate-700">Eligible</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-[#9ca3af] border border-[#6b7280]"></div>
            <span className="text-slate-700">Prerequisites Not Met</span>
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-slate-200">
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-6 h-[2px] bg-[#64748b]"></div>
            <span className="text-slate-700">Prerequisite</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseGraph; 