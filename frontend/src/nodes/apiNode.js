/**
 * APINode.js - API Request Node
 * 
 * PURPOSE: Demonstrates how the BaseNode abstraction handles
 * nodes that configure external integrations.
 * 
 * NEW NODE #2 - Shows: Multiple inputs, URL configuration, method selection
 */

import { useState, useEffect } from 'react';
import { BaseNode, TextField, SelectField, DisplayField } from '../components/BaseNode';
import { useStore } from '../store';
import { Globe, Download, Upload, RefreshCw, Edit3, Trash2, Clock } from 'lucide-react';

const nodeConfig = {
  header: {
    title: 'API',
    icon: <Globe size={14} />,
    accentColor: '#3B82F6', // Blue - represents networking/API
  },
  handles: [
    { id: 'body', type: 'target', position: '40%', label: 'body' },
    { id: 'headers', type: 'target', position: '60%', label: 'headers' },
    { id: 'response', type: 'source', position: '50%', label: 'response' }
  ],
  minWidth: 280,
};

const methodOptions = [
  { value: 'GET', label: 'GET', icon: <Download size={12} /> },
  { value: 'POST', label: 'POST', icon: <Upload size={12} /> },
  { value: 'PUT', label: 'PUT', icon: <RefreshCw size={12} /> },
  { value: 'PATCH', label: 'PATCH', icon: <Edit3 size={12} /> },
  { value: 'DELETE', label: 'DELETE', icon: <Trash2 size={12} /> },
];

export const APINode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  
  const [method, setMethod] = useState(data?.method || 'GET');
  const [url, setUrl] = useState(data?.url || '');
  const [timeout, setTimeout] = useState(data?.timeout || '30');

  useEffect(() => {
    updateNodeField(id, 'method', method);
    updateNodeField(id, 'url', url);
    updateNodeField(id, 'timeout', timeout);
  }, [method, url, timeout, id, updateNodeField]);

  return (
    <BaseNode id={id} data={data} config={nodeConfig}>
      <SelectField
        label="Method"
        value={method}
        onChange={(e) => setMethod(e.target.value)}
        options={methodOptions}
      />
      <TextField
        label="URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://api.example.com/endpoint"
      />
      <TextField
        label="Timeout (seconds)"
        value={timeout}
        onChange={(e) => setTimeout(e.target.value)}
        placeholder="30"
      />
      <DisplayField
        label="Status"
        value="Awaiting input"
        icon={<Clock size={12} />}
      />
    </BaseNode>
  );
};
