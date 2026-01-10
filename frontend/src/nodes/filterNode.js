/**
 * FilterNode.js - Data Transformation Node
 * 
 * PURPOSE: Demonstrates how the BaseNode abstraction handles
 * nodes with multiple configuration options and data transformation.
 * 
 * NEW NODE #1 - Shows: Multiple select fields, custom logic
 */

import { useState, useEffect } from 'react';
import { BaseNode, SelectField, TextField } from '../components/BaseNode';
import { useStore } from '../store';
import { Filter, Box, Target, Play, Square, Code, LetterText, CaseSensitive } from 'lucide-react';

const nodeConfig = {
  header: {
    title: 'Filter',
    icon: <Filter size={14} />,
    accentColor: '#06B6D4', // Cyan - represents filtering/search
  },
  handles: [
    { id: 'input', type: 'target', position: '50%', label: 'input' },
    { id: 'output', type: 'source', position: '50%', label: 'filtered' }
  ],
  minWidth: 260,
};

const filterTypeOptions = [
  { value: 'contains', label: 'Contains', icon: <Box size={12} /> },
  { value: 'equals', label: 'Equals', icon: <Target size={12} /> },
  { value: 'startsWith', label: 'Starts With', icon: <Play size={12} /> },
  { value: 'endsWith', label: 'Ends With', icon: <Square size={12} /> },
  { value: 'regex', label: 'Regex Match', icon: <Code size={12} /> },
];

const caseSensitivityOptions = [
  { value: 'insensitive', label: 'Case Insensitive', icon: <LetterText size={12} /> },
  { value: 'sensitive', label: 'Case Sensitive', icon: <CaseSensitive size={12} /> },
];

export const FilterNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  
  const [filterType, setFilterType] = useState(data?.filterType || 'contains');
  const [filterValue, setFilterValue] = useState(data?.filterValue || '');
  const [caseSensitivity, setCaseSensitivity] = useState(data?.caseSensitivity || 'insensitive');

  useEffect(() => {
    updateNodeField(id, 'filterType', filterType);
    updateNodeField(id, 'filterValue', filterValue);
    updateNodeField(id, 'caseSensitivity', caseSensitivity);
  }, [filterType, filterValue, caseSensitivity, id, updateNodeField]);

  return (
    <BaseNode id={id} data={data} config={nodeConfig}>
      <SelectField
        label="Filter Type"
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)}
        options={filterTypeOptions}
      />
      <TextField
        label="Filter Value"
        value={filterValue}
        onChange={(e) => setFilterValue(e.target.value)}
        placeholder="Enter filter pattern..."
      />
      <SelectField
        label="Case Sensitivity"
        value={caseSensitivity}
        onChange={(e) => setCaseSensitivity(e.target.value)}
        options={caseSensitivityOptions}
      />
    </BaseNode>
  );
};
