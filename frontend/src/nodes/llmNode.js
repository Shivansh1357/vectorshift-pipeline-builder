/**
 * LLMNode.js - Large Language Model Node
 * 
 * PURPOSE: Represents an LLM processing node that takes a system prompt
 * and user prompt as inputs and produces a response.
 * 
 * Architectural Decision (AD): 
 * Multiple input handles (system, prompt) demonstrate handle flexibility.
 * Static display content shows node can have informational areas.
 */

import { BaseNode, DisplayField, SelectField } from '../components/BaseNode';
import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Bot, Brain, Zap, Sparkles, Gem, CheckCircle } from 'lucide-react';

const nodeConfig = {
  header: {
    title: 'LLM',
    icon: <Bot size={14} />,
    accentColor: '#8B5CF6', // Purple - represents AI/intelligence
  },
  handles: [
    { id: 'system', type: 'target', position: '40%', label: 'system' },
    { id: 'prompt', type: 'target', position: '60%', label: 'prompt' },
    { id: 'response', type: 'source', position: '50%', label: 'response' }
  ],
  minWidth: 260,
};

const modelOptions = [
  { value: 'gpt-4', label: 'GPT-4', icon: <Brain size={12} /> },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', icon: <Zap size={12} /> },
  { value: 'claude-3', label: 'Claude 3', icon: <Sparkles size={12} /> },
  { value: 'gemini-pro', label: 'Gemini Pro', icon: <Gem size={12} /> },
];

export const LLMNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const [model, setModel] = useState(data?.model || 'gpt-4');

  useEffect(() => {
    updateNodeField(id, 'model', model);
  }, [model, id, updateNodeField]);

  return (
    <BaseNode id={id} data={data} config={nodeConfig}>
      <SelectField
        label="Model"
        value={model}
        onChange={(e) => setModel(e.target.value)}
        options={modelOptions}
      />
      <DisplayField
        label="Status"
        value="Ready to process"
        icon={<CheckCircle size={12} />}
      />
    </BaseNode>
  );
};
