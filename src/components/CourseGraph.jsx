import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';

// Register the dagre layout
cytoscape.use(dagre);

const CourseGraph = ({ courses = [], edges = [], completedCourses = [], eligibleCourses = [] }) => {
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

    if (!courses || courses.length === 0) {
      // Display a message if no courses are available
      const noDataMsg = document.createElement('div');
      noDataMsg.style.position = 'absolute';
      noDataMsg.style.top = '50%';
      noDataMsg.style.left = '50%';
      noDataMsg.style.transform = 'translate(-50%, -50%)';
      noDataMsg.style.textAlign = 'center';
      noDataMsg.style.color = '#6b7280';
      noDataMsg.innerHTML = `
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p class="text-lg font-semibold">No course data available</p>
        <p class="text-sm mt-2">Please make sure courses are loaded correctly</p>
      `;
      containerRef.current.appendChild(noDataMsg);
      return;
    }

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
              name: course.courseName || course.courseCode,
              status: completedCourses.includes(course.courseCode) 
                ? 'completed' 
                : eligibleCourses.includes(course.courseCode) 
                  ? 'eligible' 
                  : 'not-eligible'
            }
          })),
          
          // Edges - prerequisites - only use valid edges
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
              'label': 'data(label)',
              'color': '#333',
              'text-valign': 'center',
              'text-halign': 'center',
              'font-size': '10px',
              'font-weight': 'bold',
              'width': '60px',
              'height': '60px',
              'border-width': '2px',
              'border-color': '#fff',
              'border-opacity': 0.8,
              'shape': 'roundrectangle'
            }
          },
          {
            selector: 'node[status="completed"]',
            style: {
              'background-color': '#4ade80', // Green
              'border-color': '#22c55e',
              'border-width': '2px',
              'color': '#166534'
            }
          },
          {
            selector: 'node[status="eligible"]',
            style: {
              'background-color': '#fde047', // Yellow
              'border-color': '#eab308',
              'border-width': '2px',
              'color': '#854d0e'
            }
          },
          {
            selector: 'node[status="not-eligible"]',
            style: {
              'background-color': '#e5e7eb', // Grey
              'border-color': '#9ca3af',
              'color': '#4b5563'
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 2,
              'line-color': '#9ca3af',
              'target-arrow-color': '#9ca3af',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'opacity': 0.7
            }
          },
          {
            selector: 'edge[source.status="completed"]',
            style: {
              'line-color': '#4ade80', 
              'target-arrow-color': '#4ade80',
              'opacity': 0.9
            }
          }
        ],
        
        layout: {
          name: 'dagre',
          rankDir: 'LR', // Left to right layout
          nodeSep: 80,
          rankSep: 100,
          padding: 50,
          animate: true,
          animationDuration: 500,
          fit: true
        }
      });
      
      cyRef.current = cy;
      
      // Add hover interactions
      cy.on('mouseover', 'node', function(e) {
        const node = e.target;
        node.style({
          'border-width': '3px',
          'border-color': '#3b82f6',
          'font-size': '12px',
          'z-index': 999,
          'transform': 'scale(1.1)'
        });
        
        // Show tooltip with course name
        const courseName = node.data('name');
        const status = node.data('status');
        
        const tooltip = document.createElement('div');
        tooltip.id = 'cy-tooltip';
        tooltip.style.position = 'absolute';
        tooltip.style.left = `${e.renderedPosition.x + 70}px`;
        tooltip.style.top = `${e.renderedPosition.y - 30}px`;
        tooltip.style.backgroundColor = 'white';
        tooltip.style.padding = '8px 12px';
        tooltip.style.borderRadius = '6px';
        tooltip.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        tooltip.style.maxWidth = '250px';
        tooltip.style.zIndex = 1000;
        tooltip.style.fontSize = '14px';
        
        let statusText = '';
        if (status === 'completed') statusText = '<span style="color:#166534;font-weight:bold">✓ Completed</span>';
        else if (status === 'eligible') statusText = '<span style="color:#854d0e;font-weight:bold">⚠ Eligible to take</span>';
        else statusText = '<span style="color:#4b5563;font-weight:bold">❌ Prerequisites not met</span>';
        
        tooltip.innerHTML = `<div style="font-weight:bold">${node.data('label')}</div>
                           <div style="font-size:12px;margin:4px 0">${courseName}</div>
                           <div style="font-size:12px">${statusText}</div>`;
        
        containerRef.current.appendChild(tooltip);
      });
      
      cy.on('mouseout', 'node', function(e) {
        const node = e.target;
        node.style({
          'border-width': '2px',
          'border-color': node.data('status') === 'completed' ? '#22c55e' : 
                          node.data('status') === 'eligible' ? '#eab308' : '#9ca3af',
          'font-size': '10px',
          'z-index': 'auto',
          'transform': 'scale(1)'
        });
        
        // Remove tooltip
        const tooltip = document.getElementById('cy-tooltip');
        if (tooltip) tooltip.remove();
      });
      
      // Clean up
      return () => {
        if (cy) {
          cy.destroy();
        }
      };
    } catch (error) {
      console.error("Error creating Cytoscape graph:", error);
      // Optionally display an error message to the user
      const errorMsg = document.createElement('div');
      errorMsg.style.position = 'absolute';
      errorMsg.style.top = '50%';
      errorMsg.style.left = '50%';
      errorMsg.style.transform = 'translate(-50%, -50%)';
      errorMsg.style.textAlign = 'center';
      errorMsg.style.color = '#dc2626'; // Red color for errors
      errorMsg.style.padding = '20px';
      errorMsg.style.borderRadius = '10px';
      errorMsg.style.backgroundColor = 'white';
      errorMsg.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.2)';
      errorMsg.innerHTML = `
        <svg class="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.93 1.75a2.25 2.25 0 01-1.2-2.25V6.75A2.25 2.25 0 016.75 4.5h10.5A2.25 2.25 0 0119.5 6.75v8.25a2.25 2.25 0 01-1.2 2.25M16.5 7.5V18a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 18V7.5a2.25 2.25 0 012.25-2.25h9.75a2.25 2.25 0 012.25 2.25" />
        </svg>
        <p class="text-lg font-semibold">Graph Creation Error</p>
        <p class="text-sm">Could not generate course graph due to missing or invalid data.</p>
      `;
      containerRef.current.appendChild(errorMsg);
      return () => {
        if (errorMsg) {
          errorMsg.remove();
        }
      };
    }
  }, [courses, edges, completedCourses, eligibleCourses]);

  return (
    <div className="relative w-full h-full min-h-[600px] rounded-2xl overflow-hidden border border-slate-200 bg-white">
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md border border-slate-200 z-10">
        <h4 className="text-sm font-semibold text-slate-900 mb-2">Course Status</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-[#4ade80] border-2 border-[#22c55e]"></div>
            <span className="text-slate-700">Completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-[#fde047] border-2 border-[#eab308]"></div>
            <span className="text-slate-700">Eligible to Take</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-[#e5e7eb] border-2 border-[#9ca3af]"></div>
            <span className="text-slate-700">Prerequisites Not Met</span>
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-slate-200">
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-6 h-[2px] bg-[#9ca3af]"></div>
            <span className="text-slate-700">Prerequisite</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseGraph; 