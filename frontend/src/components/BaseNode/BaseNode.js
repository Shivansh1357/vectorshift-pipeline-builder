/**
 * BaseNode.js - Core Node Abstraction Component
 * 
 * Architectural Decision (AD-1): Factory Pattern for Node Creation
 * ================================================================
 * 
 * WHY THIS APPROACH:
 * 1. Single Source of Truth: All nodes share a consistent structure, reducing bugs
 * 2. Rapid Development: New nodes can be created with just a configuration object
 * 3. Consistent Styling: All nodes automatically inherit the design system
 * 4. Maintainability: Changes to node appearance propagate to all nodes
 * 5. Extensibility: Easy to add new field types, handle configurations, etc.
 * 
 * The BaseNode component accepts a configuration object that defines:
 * - Header (title, icon, color)
 * - Handles (inputs/outputs with positions)
 * - Fields (text inputs, selects, textareas, custom content)
 * - Styling options
 */

import React from 'react';
import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';
import './BaseNode.css';

/**
 * BaseNode Component
 * 
 * @param {Object} props
 * @param {string} props.id - Unique node identifier
 * @param {Object} props.data - Node data from React Flow
 * @param {Object} props.config - Node configuration object
 * @param {Object} props.config.header - Header configuration {title, icon, accentColor}
 * @param {Array} props.config.handles - Array of handle configurations
 * @param {Array} props.config.fields - Array of field configurations
 * @param {React.ReactNode} props.children - Custom content to render
 */
export const BaseNode = ({ id, data, config, children, style = {} }) => {
  const { header, handles = [], minWidth = 240, minHeight = 'auto' } = config;

  // Calculate dynamic handles on left side (for variables)
  const dynamicHandles = data?.dynamicHandles || [];

  // Separate handles by type
  const targetHandles = handles.filter((h) => h.type === 'target');
  const sourceHandles = handles.filter((h) => h.type === 'source');

  // Check if we have handles on each side (including dynamic)
  const hasLeftHandles = targetHandles.length > 0 || dynamicHandles.length > 0;
  const hasRightHandles = sourceHandles.length > 0;
  const hasNoHandles = !hasLeftHandles && !hasRightHandles;

  // Calculate handle positions
  const getHandlePosition = (index, total, customPosition) => {
    if (customPosition) return customPosition;
    return `${((index + 1) * 100) / (total + 1)}%`;
  };

  // Build class names
  const classNames = [
    'base-node',
    hasNoHandles && 'no-handles',
    !hasLeftHandles && 'no-left-handles',
    !hasRightHandles && 'no-right-handles',
  ].filter(Boolean).join(' ');

  // Calculate content padding based on handles
  const contentStyle = {
    paddingLeft: hasLeftHandles ? '55px' : '14px',
    paddingRight: hasRightHandles ? '55px' : '14px',
  };

  return (
    <motion.div
      className={classNames}
      style={{
        '--accent-color': header?.accentColor || 'var(--primary-accent)',
        minWidth,
        minHeight,
        ...style
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Node Header */}
      <div className="node-header">
        {header?.icon && <span className="node-icon">{header.icon}</span>}
        <span className="node-title">{header?.title || 'Node'}</span>
      </div>

      {/* Input Handles (Left Side) */}
      {targetHandles.map((handle, index) => (
        <Handle
          key={handle.id}
          type="target"
          position={Position.Left}
          id={`${id}-${handle.id}`}
          className="node-handle node-handle-target"
          style={{
            top: getHandlePosition(index, targetHandles.length, handle.position),
            ...handle.style
          }}
        />
      ))}

      {/* Handle Labels for Target Handles */}
      {targetHandles.map((handle, index) => (
        handle.label && (
          <div
            key={`label-${handle.id}`}
            className="handle-label-container handle-label-left"
            style={{
              top: getHandlePosition(index, targetHandles.length, handle.position),
            }}
          >
            {handle.label}
          </div>
        )
      ))}

      {/* Dynamic Handles for Variables (Left Side) */}
      {dynamicHandles.map((handle, index) => (
        <React.Fragment key={handle.id}>
          <Handle
            type="target"
            position={Position.Left}
            id={`${id}-${handle.id}`}
            className="node-handle node-handle-target node-handle-dynamic"
            style={{
              top: `${((index + 1) * 100) / (dynamicHandles.length + 1)}%`,
            }}
          />
          <div
            className="handle-label-container handle-label-left dynamic-label"
            style={{
              top: `${((index + 1) * 100) / (dynamicHandles.length + 1)}%`,
            }}
          >
            {handle.label}
          </div>
        </React.Fragment>
      ))}

      {/* Output Handles (Right Side) */}
      {sourceHandles.map((handle, index) => (
        <Handle
          key={handle.id}
          type="source"
          position={Position.Right}
          id={`${id}-${handle.id}`}
          className="node-handle node-handle-source"
          style={{
            top: getHandlePosition(index, sourceHandles.length, handle.position),
            ...handle.style
          }}
        />
      ))}

      {/* Handle Labels for Source Handles */}
      {sourceHandles.map((handle, index) => (
        handle.label && (
          <div
            key={`label-${handle.id}`}
            className="handle-label-container handle-label-right"
            style={{
              top: getHandlePosition(index, sourceHandles.length, handle.position),
            }}
          >
            {handle.label}
          </div>
        )
      ))}

      {/* Node Content */}
      <div className="node-content" style={contentStyle}>
        {children}
      </div>
    </motion.div>
  );
};

/**
 * Field Components - Reusable field types for nodes
 * 
 * AD: Component Composition Pattern
 * These field components can be composed inside any node,
 * providing consistent styling and behavior.
 */

export const NodeField = ({ label, children, className = '' }) => (
  <div className={`node-field ${className}`}>
    {label && <label className="field-label">{label}</label>}
    {children}
  </div>
);

export const TextField = ({ label, value, onChange, placeholder, ...props }) => (
  <NodeField label={label}>
    <input
      type="text"
      className="field-input"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...props}
    />
  </NodeField>
);

export const TextAreaField = ({ label, value, onChange, placeholder, rows = 3, style = {}, ...props }) => (
  <NodeField label={label}>
    <textarea
      className="field-textarea"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      style={style}
      {...props}
    />
  </NodeField>
);

export const SelectField = ({ label, value, onChange, options, ...props }) => (
  <NodeField label={label}>
    <select className="field-select" value={value} onChange={onChange} {...props}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </NodeField>
);

export const DisplayField = ({ label, value, icon }) => (
  <NodeField label={label}>
    <div className="field-display">
      {icon && <span className="display-icon">{icon}</span>}
      <span className="display-value">{value}</span>
    </div>
  </NodeField>
);

export default BaseNode;
