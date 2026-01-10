/**
 * InputNode.js - Pipeline Input Node
 * 
 * PURPOSE: Represents an entry point for data into the pipeline.
 * Users can configure the input name and type (Text/File).
 * 
 * Architectural Decision (AD): 
 * Uses BaseNode abstraction for consistent styling and reduces code duplication.
 * State is managed locally for immediate UI updates, while also being
 * synced to the global store for pipeline serialization.
 */

import { useState, useEffect } from 'react';
import { BaseNode, TextField, SelectField } from '../components/BaseNode';
import { useStore } from '../store';
import { Download, FileText, FolderOpen } from 'lucide-react';

// Node configuration - defines the structure and appearance
const nodeConfig = {
  header: {
    title: 'Input',
    icon: <Download size={14} />,
    accentColor: '#10B981', // Green - represents data entry
  },
  handles: [
    { id: 'value', type: 'source', position: '50%', label: 'output' }
  ],
  minWidth: 220,
};

// Input type options
const inputTypeOptions = [
  { value: 'Text', label: 'Text', icon: <FileText size={12} /> },
  { value: 'File', label: 'File', icon: <FolderOpen size={12} /> },
];

export const InputNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  
  // Local state for immediate UI updates
  const [currName, setCurrName] = useState(
    data?.inputName || id.replace('customInput-', 'input_')
  );
  const [inputType, setInputType] = useState(data?.inputType || 'Text');

  // Sync state changes to global store
  useEffect(() => {
    updateNodeField(id, 'inputName', currName);
  }, [currName, id, updateNodeField]);

  useEffect(() => {
    updateNodeField(id, 'inputType', inputType);
  }, [inputType, id, updateNodeField]);

  const handleNameChange = (e) => setCurrName(e.target.value);
  const handleTypeChange = (e) => setInputType(e.target.value);

  return (
    <BaseNode id={id} data={data} config={nodeConfig}>
      <TextField
        label="Name"
        value={currName}
        onChange={handleNameChange}
        placeholder="Enter input name..."
      />
      <SelectField
        label="Type"
        value={inputType}
        onChange={handleTypeChange}
        options={inputTypeOptions}
      />
    </BaseNode>
  );
};
