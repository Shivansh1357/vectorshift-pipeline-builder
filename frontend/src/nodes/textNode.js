/**
 * TextNode.js - Dynamic Text Input Node with Variable Detection
 * 
 * PURPOSE: Allows users to enter text with support for template variables.
 * Variables in the format {{variableName}} create dynamic input handles.
 * 
 * Architectural Decision (AD-3): Dynamic Handle Generation
 * =========================================================
 * 
 * WHY THIS APPROACH:
 * 1. Real-time Parsing: Variables are detected as user types using regex
 * 2. Dynamic Handles: Each unique variable creates a target handle on the left
 * 3. Auto-sizing: The textarea grows with content for better UX
 * 4. Variable Validation: Only valid JS identifiers are accepted
 * 
 * Variable Format: {{variableName}}
 * - Must be a valid JavaScript identifier
 * - Duplicates are automatically deduplicated
 * - Handles are sorted alphabetically for consistency
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { BaseNode, NodeField } from '../components/BaseNode';
import { useStore } from '../store';
import { Type, Link2 } from 'lucide-react';

const nodeConfig = {
  header: {
    title: 'Text',
    icon: <Type size={14} />,
    accentColor: '#EC4899', // Pink - represents text/content
  },
  handles: [
    { id: 'output', type: 'source', position: '50%', label: 'output' }
  ],
  minWidth: 240,
};

// Regex to match {{variableName}} where variableName is a valid JS identifier
// Valid JS identifier: starts with letter, $, or _, followed by letters, digits, $, or _
const VARIABLE_REGEX = /\{\{([a-zA-Z_$][a-zA-Z0-9_$]*)\}\}/g;

/**
 * Extract unique variables from text
 * @param {string} text - The text to parse
 * @returns {string[]} - Array of unique variable names, sorted alphabetically
 */
const extractVariables = (text) => {
  const matches = text.matchAll(VARIABLE_REGEX);
  const variables = [...matches].map((match) => match[1]);
  // Remove duplicates and sort
  return [...new Set(variables)].sort();
};

/**
 * Calculate textarea dimensions based on content
 * @param {string} text - The text content
 * @returns {Object} - { width, height } in pixels
 */
const calculateDimensions = (text) => {
  const lines = text.split('\n');
  const maxLineLength = Math.max(...lines.map((line) => line.length), 20);
  const lineCount = lines.length;
  
  // Base dimensions with some padding
  const charWidth = 7; // Approximate character width in pixels
  const lineHeight = 20; // Line height in pixels
  const minWidth = 180;
  const minHeight = 50;
  const maxWidth = 350;
  const maxHeight = 250;
  
  const calculatedWidth = Math.min(Math.max(maxLineLength * charWidth + 24, minWidth), maxWidth);
  const calculatedHeight = Math.min(Math.max(lineCount * lineHeight + 16, minHeight), maxHeight);
  
  return { width: calculatedWidth, height: calculatedHeight };
};

export const TextNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const textareaRef = useRef(null);
  
  const [currText, setCurrText] = useState(data?.text || '');
  const [dimensions, setDimensions] = useState({ width: 180, height: 50 });

  // Extract variables from text
  const variables = useMemo(() => extractVariables(currText), [currText]);

  // Update dimensions when text changes
  useEffect(() => {
    const newDimensions = calculateDimensions(currText);
    setDimensions(newDimensions);
  }, [currText]);

  // Sync text to store
  useEffect(() => {
    updateNodeField(id, 'text', currText);
  }, [currText, id, updateNodeField]);

  // Sync variables as dynamic handles (rendered by BaseNode)
  useEffect(() => {
    const dynamicHandles = variables.map((varName) => ({
      id: varName,
      label: varName,
      type: 'target',
    }));
    updateNodeField(id, 'dynamicHandles', dynamicHandles);
    updateNodeField(id, 'variables', variables);
  }, [variables, id, updateNodeField]);

  const handleTextChange = (e) => {
    setCurrText(e.target.value);
  };

  return (
    <BaseNode 
      id={id} 
      data={data} 
      config={nodeConfig}
      style={{ minWidth: dimensions.width }}
    >
      <NodeField label="Text Content">
        <textarea
          ref={textareaRef}
          className="field-textarea text-node-textarea"
          value={currText}
          onChange={handleTextChange}
          placeholder="Enter text... Use {{variable}} for variables"
          style={{
            width: '100%',
            height: dimensions.height,
            transition: 'height 0.15s ease',
          }}
        />
      </NodeField>

      {/* Variable indicator */}
      {variables.length > 0 && (
        <div style={{
          padding: '6px 10px',
          background: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '4px',
          fontSize: '10px',
          color: '#10B981',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          <Link2 size={12} />
          <span>
            {variables.length} variable{variables.length !== 1 ? 's' : ''}: {variables.join(', ')}
          </span>
        </div>
      )}
    </BaseNode>
  );
};
