/**
 * DraggableNode.js - Toolbar Node Component
 * 
 * PURPOSE: Represents a node in the toolbar that can be dragged
 * onto the pipeline canvas.
 * 
 * Architectural Decision (AD):
 * - Uses HTML5 drag and drop API for native feel
 * - Stores node type in dataTransfer for drop handling
 * - Visual feedback on drag states
 */

export const DraggableNode = ({ type, label, icon }) => {
  const onDragStart = (event, nodeType) => {
    const appData = { nodeType };
    event.target.style.cursor = 'grabbing';
    event.dataTransfer.setData('application/reactflow', JSON.stringify(appData));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="draggable-node"
      onDragStart={(event) => onDragStart(event, type)}
      onDragEnd={(event) => (event.target.style.cursor = 'grab')}
      draggable
      role="button"
      tabIndex={0}
      aria-label={`Drag ${label} node`}
    >
      {icon && <span className="draggable-node-icon">{icon}</span>}
      <span className="draggable-node-label">{label}</span>
    </div>
  );
};
