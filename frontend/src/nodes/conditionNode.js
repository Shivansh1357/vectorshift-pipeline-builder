/**
 * ConditionNode.js - Conditional Branching Node
 * 
 * PURPOSE: Demonstrates branching logic with multiple outputs.
 * Shows how BaseNode handles nodes with multiple output handles.
 * 
 * NEW NODE #3 - Shows: Multiple outputs, condition configuration
 */

import { useState, useEffect } from 'react';
import { BaseNode, TextField, SelectField } from '../components/BaseNode';
import { useStore } from '../store';
import { GitBranch, Equal, X, Search, ChevronRight, ChevronLeft, Circle, CheckCircle, Lightbulb } from 'lucide-react';

const nodeConfig = {
  header: {
    title: 'Condition',
    icon: <GitBranch size={14} />,
    accentColor: '#F97316', // Orange - represents decision/branching
  },
  handles: [
    { id: 'input', type: 'target', position: '50%', label: 'input' },
    { id: 'true', type: 'source', position: '40%', label: 'true' },
    { id: 'false', type: 'source', position: '60%', label: 'false' }
  ],
  minWidth: 260,
};

const operatorOptions = [
  { value: 'equals', label: 'Equals', icon: <Equal size={12} /> },
  { value: 'notEquals', label: 'Not Equals', icon: <X size={12} /> },
  { value: 'contains', label: 'Contains', icon: <Search size={12} /> },
  { value: 'greaterThan', label: 'Greater Than', icon: <ChevronRight size={12} /> },
  { value: 'lessThan', label: 'Less Than', icon: <ChevronLeft size={12} /> },
  { value: 'isEmpty', label: 'Is Empty', icon: <Circle size={12} /> },
  { value: 'isNotEmpty', label: 'Is Not Empty', icon: <CheckCircle size={12} /> },
];

export const ConditionNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  
  const [operator, setOperator] = useState(data?.operator || 'equals');
  const [compareValue, setCompareValue] = useState(data?.compareValue || '');

  useEffect(() => {
    updateNodeField(id, 'operator', operator);
    updateNodeField(id, 'compareValue', compareValue);
  }, [operator, compareValue, id, updateNodeField]);

  const needsCompareValue = !['isEmpty', 'isNotEmpty'].includes(operator);

  return (
    <BaseNode id={id} data={data} config={nodeConfig}>
      <SelectField
        label="Operator"
        value={operator}
        onChange={(e) => setOperator(e.target.value)}
        options={operatorOptions}
      />
      {needsCompareValue && (
        <TextField
          label="Compare Value"
          value={compareValue}
          onChange={(e) => setCompareValue(e.target.value)}
          placeholder="Value to compare against..."
        />
      )}
      <div className="condition-hint" style={{
        padding: '8px 12px',
        background: 'rgba(249, 115, 22, 0.1)',
        borderRadius: '6px',
        fontSize: '11px',
        color: 'rgba(255, 255, 255, 0.6)',
        lineHeight: 1.4,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        <Lightbulb size={12} />
        <span>True output triggers when condition is met, False otherwise</span>
      </div>
    </BaseNode>
  );
};
