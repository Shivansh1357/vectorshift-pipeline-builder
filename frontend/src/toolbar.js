/**
 * PipelineToolbar.js - Node Selection Toolbar
 * 
 * PURPOSE: Displays draggable nodes that users can add to the pipeline.
 * 
 * Architectural Decision (AD):
 * - Centralized node definitions make it easy to add new nodes
 * - Each node has an icon, label, and type for visual clarity
 * - Grouped by category for better organization
 * - Uses Lucide React for professional, consistent icons
 */

import { DraggableNode } from './draggableNode';
import { appBrand, nodeCatalog } from './nodeCatalog';

export const PipelineToolbar = () => {
  return (
    <div className="toolbar">
      {/* Logo */}
      <div className="toolbar-logo">
        <span className="toolbar-logo-icon">{appBrand.icon}</span>
        <span className="toolbar-logo-text">{appBrand.name}</span>
      </div>

      {/* Nodes */}
      <div className="toolbar-nodes">
        <span className="toolbar-label">Nodes</span>

        {nodeCatalog.flatMap((group) =>
          group.items.map((node) => (
            <DraggableNode
              key={node.type}
              type={node.type}
              label={node.label}
              icon={<node.Icon size={16} />}
            />
          ))
        )}
      </div>

      <div className="toolbar-help" title="Keyboard shortcuts">
        <span className="toolbar-help-item"><span className="kbd">Ctrl/Cmd+K</span> Palette</span>
        <span className="toolbar-help-item"><span className="kbd">Ctrl/Cmd+Enter</span> Run</span>
        <span className="toolbar-help-item"><span className="kbd">Del</span> Delete</span>
      </div>
    </div>
  );
};
