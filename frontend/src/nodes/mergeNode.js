/**
 * MergeNode.js - Data Merge Node
 * 
 * PURPOSE: Demonstrates combining multiple data streams.
 * Shows how BaseNode handles multiple inputs merging to single output.
 * 
 * NEW NODE #4 - Shows: Multiple inputs, merge strategy selection
 */

import { useState, useEffect } from 'react';
import { BaseNode, SelectField, DisplayField } from '../components/BaseNode';
import { useStore } from '../store';
import { Merge, Paperclip, List, Braces, Hash, ArrowRight, CornerDownRight, Space, Minus, Circle, BarChart2 } from 'lucide-react';

const nodeConfig = {
  header: {
    title: 'Merge',
    icon: <Merge size={14} />,
    accentColor: '#14B8A6', // Teal - represents combining/merging
  },
  handles: [
    { id: 'input1', type: 'target', position: '35%', label: 'in_1' },
    { id: 'input2', type: 'target', position: '50%', label: 'in_2' },
    { id: 'input3', type: 'target', position: '65%', label: 'in_3' },
    { id: 'output', type: 'source', position: '50%', label: 'merged' }
  ],
  minWidth: 260,
};

const mergeStrategyOptions = [
  { value: 'concat', label: 'Concatenate', icon: <Paperclip size={12} /> },
  { value: 'array', label: 'Array', icon: <List size={12} /> },
  { value: 'object', label: 'Object', icon: <Braces size={12} /> },
  { value: 'first', label: 'First Non-Empty', icon: <Hash size={12} /> },
  { value: 'last', label: 'Last Non-Empty', icon: <ArrowRight size={12} /> },
];

const delimiterOptions = [
  { value: 'newline', label: 'New Line', icon: <CornerDownRight size={12} /> },
  { value: 'space', label: 'Space', icon: <Space size={12} /> },
  { value: 'comma', label: 'Comma', icon: <Minus size={12} /> },
  { value: 'none', label: 'None', icon: <Circle size={12} /> },
];

export const MergeNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  
  const [strategy, setStrategy] = useState(data?.strategy || 'concat');
  const [delimiter, setDelimiter] = useState(data?.delimiter || 'newline');

  useEffect(() => {
    updateNodeField(id, 'strategy', strategy);
    updateNodeField(id, 'delimiter', delimiter);
  }, [strategy, delimiter, id, updateNodeField]);

  return (
    <BaseNode id={id} data={data} config={nodeConfig}>
      <SelectField
        label="Merge Strategy"
        value={strategy}
        onChange={(e) => setStrategy(e.target.value)}
        options={mergeStrategyOptions}
      />
      {strategy === 'concat' && (
        <SelectField
          label="Delimiter"
          value={delimiter}
          onChange={(e) => setDelimiter(e.target.value)}
          options={delimiterOptions}
        />
      )}
      <DisplayField
        label="Inputs"
        value="3 available"
        icon={<BarChart2 size={12} />}
      />
    </BaseNode>
  );
};
