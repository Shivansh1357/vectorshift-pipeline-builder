/**
 * OutputNode.js - Pipeline Output Node
 * 
 * PURPOSE: Represents an exit point for data from the pipeline.
 * Users can configure the output name and type (Text/Image).
 * 
 * Architectural Decision (AD): 
 * Mirrors InputNode structure for consistency.
 * Target handle on left receives data, no source handles.
 */

import { useState, useEffect } from 'react';
import { BaseNode, TextField, SelectField } from '../components/BaseNode';
import { useStore } from '../store';
import { Upload, FileText, Image } from 'lucide-react';

const nodeConfig = {
  header: {
    title: 'Output',
    icon: <Upload size={14} />,
    accentColor: '#F59E0B', // Amber - represents data output
  },
  handles: [
    { id: 'value', type: 'target', position: '50%', label: 'input' }
  ],
  minWidth: 220,
};

const outputTypeOptions = [
  { value: 'Text', label: 'Text', icon: <FileText size={12} /> },
  { value: 'Image', label: 'Image', icon: <Image size={12} /> },
];

export const OutputNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  
  const [currName, setCurrName] = useState(
    data?.outputName || id.replace('customOutput-', 'output_')
  );
  const [outputType, setOutputType] = useState(data?.outputType || 'Text');

  useEffect(() => {
    updateNodeField(id, 'outputName', currName);
  }, [currName, id, updateNodeField]);

  useEffect(() => {
    updateNodeField(id, 'outputType', outputType);
  }, [outputType, id, updateNodeField]);

  const handleNameChange = (e) => setCurrName(e.target.value);
  const handleTypeChange = (e) => setOutputType(e.target.value);

  return (
    <BaseNode id={id} data={data} config={nodeConfig}>
      <TextField
        label="Name"
        value={currName}
        onChange={handleNameChange}
        placeholder="Enter output name..."
      />
      <SelectField
        label="Type"
        value={outputType}
        onChange={handleTypeChange}
        options={outputTypeOptions}
      />
    </BaseNode>
  );
};
