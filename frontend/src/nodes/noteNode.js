/**
 * NoteNode.js - Documentation/Note Node
 * 
 * PURPOSE: Allows users to add notes and comments to their pipeline.
 * Demonstrates a node without any handles - purely informational.
 * 
 * NEW NODE #5 - Shows: No handles, textarea, color customization
 */

import { useState, useEffect } from 'react';
import { BaseNode, NodeField, SelectField } from '../components/BaseNode';
import { useStore } from '../store';
import { StickyNote } from 'lucide-react';

const colorOptions = [
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#10B981', label: 'Green' },
  { value: '#3B82F6', label: 'Blue' },
  { value: '#F59E0B', label: 'Orange' },
  { value: '#6B7280', label: 'Gray' },
];

export const NoteNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  
  const [noteText, setNoteText] = useState(data?.noteText || '');
  const [noteColor, setNoteColor] = useState(data?.noteColor || '#8B5CF6');

  // Dynamic config based on color selection
  const nodeConfig = {
    header: {
      title: 'Note',
      icon: <StickyNote size={14} />,
      accentColor: noteColor,
    },
    handles: [], // No handles for notes
    minWidth: 220,
  };

  useEffect(() => {
    updateNodeField(id, 'noteText', noteText);
    updateNodeField(id, 'noteColor', noteColor);
  }, [noteText, noteColor, id, updateNodeField]);

  return (
    <BaseNode id={id} data={data} config={nodeConfig}>
      <SelectField
        label="Color"
        value={noteColor}
        onChange={(e) => setNoteColor(e.target.value)}
        options={colorOptions}
        renderOption={(option) => (
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: option.value,
              display: 'inline-block',
            }} />
            {option.label}
          </span>
        )}
      />
      <NodeField label="Note">
        <textarea
          className="field-textarea"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Add your notes here..."
          rows={4}
          style={{ minHeight: '80px' }}
        />
      </NodeField>
    </BaseNode>
  );
};
