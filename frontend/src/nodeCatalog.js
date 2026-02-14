import React from 'react';
import {
  Download,
  Upload,
  Bot,
  Type,
  Filter,
  GitBranch,
  Merge,
  Globe,
  StickyNote,
  Zap,
  Play,
  Save,
  FolderOpen,
  Trash2,
  Copy,
  Sparkles,
} from 'lucide-react';

export const appBrand = {
  name: 'VectorShift',
  icon: <Zap size={18} />,
};

export const nodeCatalog = [
  {
    section: 'I/O',
    items: [
      { type: 'customInput', label: 'Input', Icon: Download, keywords: ['source', 'start'] },
      { type: 'customOutput', label: 'Output', Icon: Upload, keywords: ['sink', 'end'] },
    ],
  },
  {
    section: 'Processing',
    items: [
      { type: 'llm', label: 'LLM', Icon: Bot, keywords: ['ai', 'model'] },
      { type: 'text', label: 'Text', Icon: Type, keywords: ['prompt', 'template'] },
      { type: 'filter', label: 'Filter', Icon: Filter, keywords: ['transform'] },
    ],
  },
  {
    section: 'Logic',
    items: [
      { type: 'condition', label: 'Condition', Icon: GitBranch, keywords: ['branch'] },
      { type: 'merge', label: 'Merge', Icon: Merge, keywords: ['join'] },
    ],
  },
  {
    section: 'Integration',
    items: [
      { type: 'api', label: 'API', Icon: Globe, keywords: ['http', 'request'] },
    ],
  },
  {
    section: 'Utility',
    items: [
      { type: 'note', label: 'Note', Icon: StickyNote, keywords: ['docs', 'comment'] },
    ],
  },
];

export const paletteActions = [
  { id: 'run', label: 'Run pipeline', Icon: Play, keywords: ['submit', 'analyze'] },
  { id: 'copy_pipeline', label: 'Copy pipeline JSON', Icon: Copy, keywords: ['json', 'clipboard'] },
  { id: 'save', label: 'Save pipeline', Icon: Save, keywords: ['export'] },
  { id: 'load', label: 'Load pipeline', Icon: FolderOpen, keywords: ['import'] },
  { id: 'save_template', label: 'Save as template', Icon: Sparkles, keywords: ['template', 'starter'] },
  { id: 'clear', label: 'Clear canvas', Icon: Trash2, keywords: ['reset', 'delete'] },
];
