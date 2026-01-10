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
import { 
  Download, 
  Upload, 
  Bot, 
  Type, 
  Filter, 
  GitBranch, 
  Merge, 
  Globe, 
  StickyNote,
  Zap
} from 'lucide-react';

// Node definitions organized by category
// Each node has: type (matches nodeTypes in ui.js), label, and icon
const nodeDefinitions = {
  io: [
    { type: 'customInput', label: 'Input', icon: <Download size={16} /> },
    { type: 'customOutput', label: 'Output', icon: <Upload size={16} /> },
  ],
  processing: [
    { type: 'llm', label: 'LLM', icon: <Bot size={16} /> },
    { type: 'text', label: 'Text', icon: <Type size={16} /> },
    { type: 'filter', label: 'Filter', icon: <Filter size={16} /> },
  ],
  logic: [
    { type: 'condition', label: 'Condition', icon: <GitBranch size={16} /> },
    { type: 'merge', label: 'Merge', icon: <Merge size={16} /> },
  ],
  integration: [
    { type: 'api', label: 'API', icon: <Globe size={16} /> },
  ],
  utility: [
    { type: 'note', label: 'Note', icon: <StickyNote size={16} /> },
  ],
};

export const PipelineToolbar = () => {
  return (
    <div className="toolbar">
      {/* Logo */}
      <div className="toolbar-logo">
        <span className="toolbar-logo-icon"><Zap size={18} /></span>
        <span className="toolbar-logo-text">VectorShift</span>
      </div>

      {/* Nodes */}
      <div className="toolbar-nodes">
        <span className="toolbar-label">Nodes</span>
        
        {/* I/O Nodes */}
        {nodeDefinitions.io.map((node) => (
          <DraggableNode 
            key={node.type}
            type={node.type} 
            label={node.label}
            icon={node.icon}
          />
        ))}

        {/* Processing Nodes */}
        {nodeDefinitions.processing.map((node) => (
          <DraggableNode 
            key={node.type}
            type={node.type} 
            label={node.label}
            icon={node.icon}
          />
        ))}

        {/* Logic Nodes */}
        {nodeDefinitions.logic.map((node) => (
          <DraggableNode 
            key={node.type}
            type={node.type} 
            label={node.label}
            icon={node.icon}
          />
        ))}

        {/* Integration Nodes */}
        {nodeDefinitions.integration.map((node) => (
          <DraggableNode 
            key={node.type}
            type={node.type} 
            label={node.label}
            icon={node.icon}
          />
        ))}

        {/* Utility Nodes */}
        {nodeDefinitions.utility.map((node) => (
          <DraggableNode 
            key={node.type}
            type={node.type} 
            label={node.label}
            icon={node.icon}
          />
        ))}
      </div>
    </div>
  );
};
