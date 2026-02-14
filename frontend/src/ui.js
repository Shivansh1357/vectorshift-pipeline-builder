/**
 * PipelineUI.js - Main Pipeline Canvas Component
 * 
 * PURPOSE: Renders the React Flow canvas where users build pipelines
 * by connecting nodes together.
 * 
 * Architectural Decision (AD):
 * - Uses React Flow for node-based editor functionality
 * - Zustand store for state management (nodes, edges)
 * - All node types registered in nodeTypes object
 * - Drag and drop support for adding new nodes
 */

import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import ReactFlow, { Controls, Background, MiniMap } from 'reactflow';
import { useStore } from './store';
import { useToast } from './components/ui/ToastProvider';

// Import all node types
import {
  InputNode,
  OutputNode,
  LLMNode,
  TextNode,
  FilterNode,
  APINode,
  ConditionNode,
  MergeNode,
  NoteNode,
} from './nodes';

// Import custom edge
import { CustomEdge } from './components/edges/CustomEdge';
import { CommandPalette } from './components/ui/CommandPalette';
import { InspectorPanel } from './components/ui/InspectorPanel';
import { PromptModal } from './components/ui/PromptModal';
import { nodeCatalog, paletteActions } from './nodeCatalog';
import { Sparkles, Trash2, Pencil } from 'lucide-react';

import 'reactflow/dist/style.css';

// Grid configuration
const gridSize = 20;
const proOptions = { hideAttribution: true };
const STORAGE_KEY = 'vectorshift.pipeline.v1';
const TEMPLATES_KEY = 'vectorshift.templates.v1';
const INSPECTOR_DOUBLE_CLICK =
  String(process.env.REACT_APP_INSPECTOR_DOUBLE_CLICK ?? 'true').toLowerCase() !== 'false';

/**
 * Node Types Registry
 */
const nodeTypes = {
  customInput: InputNode,
  customOutput: OutputNode,
  llm: LLMNode,
  text: TextNode,
  filter: FilterNode,
  api: APINode,
  condition: ConditionNode,
  merge: MergeNode,
  note: NoteNode,
};

// Register custom edge types
const edgeTypes = {
  default: CustomEdge,
};

export const PipelineUI = () => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const { info, success, error } = useToast();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState('');
  const [inspectorClosed, setInspectorClosed] = useState(false);
  const [inspectorTarget, setInspectorTarget] = useState(null);
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameTemplateId, setRenameTemplateId] = useState(null);
  const [renameTemplateName, setRenameTemplateName] = useState('');

  // Use individual selectors to prevent infinite re-renders
  const nodes = useStore((state) => state.nodes);
  const edges = useStore((state) => state.edges);
  const getNodeID = useStore((state) => state.getNodeID);
  const addNode = useStore((state) => state.addNode);
  const setGraph = useStore((state) => state.setGraph);
  const clearGraph = useStore((state) => state.clearGraph);
  const deleteSelectedElements = useStore((state) => state.deleteSelectedElements);
  const onNodesChange = useStore((state) => state.onNodesChange);
  const onEdgesChange = useStore((state) => state.onEdgesChange);
  const onConnect = useStore((state) => state.onConnect);

  const selectedNode = useMemo(() => nodes.find((n) => n.selected), [nodes]);
  const selectedEdge = useMemo(() => edges.find((e) => e.selected), [edges]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TEMPLATES_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setSavedTemplates(parsed);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (INSPECTOR_DOUBLE_CLICK) return;
    if (selectedNode || selectedEdge) setInspectorClosed(false);
  }, [selectedNode, selectedEdge]);

  const closeInspector = useCallback(() => {
    setInspectorClosed(true);
    setInspectorTarget(null);
  }, []);

  /**
   * Initialize node data when a new node is created
   */
  const getInitNodeData = (nodeID, type) => {
    return {
      id: nodeID,
      nodeType: type
    };
  };

  /**
   * Handle node drop from toolbar
   */
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const dataString = event?.dataTransfer?.getData('application/reactflow');

      if (dataString) {
        const appData = JSON.parse(dataString);
        const type = appData?.nodeType;

        // Validate dropped element
        if (typeof type === 'undefined' || !type) {
          return;
        }

        // Calculate drop position
        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        // Create new node
        const nodeID = getNodeID(type);
        const newNode = {
          id: nodeID,
          type,
          position,
          data: getInitNodeData(nodeID, type),
        };

        addNode(newNode);
      }
    },
    [reactFlowInstance, getNodeID, addNode]
  );

  /**
   * Handle drag over for drop zone
   */
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const addNodeAtCenter = useCallback(
    (type) => {
      if (!reactFlowInstance || !reactFlowWrapper.current) return;
      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: bounds.width / 2,
        y: bounds.height / 2,
      });
      const nodeID = getNodeID(type);
      addNode({
        id: nodeID,
        type,
        position,
        data: getInitNodeData(nodeID, type),
      });
    },
    [reactFlowInstance, getNodeID, addNode]
  );

  const loadTemplate = useCallback(
    (templateId) => {
      if (!reactFlowInstance || !reactFlowWrapper.current) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const center = reactFlowInstance.project({ x: bounds.width / 2, y: bounds.height / 2 });
      const dx = 360;
      const dy = 220;

      const applyTemplate = (templateNodes, templateEdges, toastMessage) => {
        setGraph({
          nodes: (templateNodes || []).map((n) => ({ ...n, selected: false })),
          edges: (templateEdges || []).map((e) => ({ ...e, selected: false })),
        });
        closeInspector();

        // Fit view after state updates so dense templates don't overlap or go off-screen.
        setTimeout(() => {
          try {
            reactFlowInstance.fitView({ padding: 0.35, duration: 450 });
          } catch {
            // ignore
          }
        }, 0);

        success(toastMessage);
      };

      if (templateId === 'prompt_llm_output') {
        const inSystem = getNodeID('customInput');
        const inPrompt = getNodeID('customInput');
        const llm = getNodeID('llm');
        const out = getNodeID('customOutput');

        const newNodes = [
          { id: inSystem, type: 'customInput', position: { x: center.x - dx, y: center.y - dy }, data: { ...getInitNodeData(inSystem, 'customInput'), inputName: 'system', inputType: 'Text' } },
          { id: inPrompt, type: 'customInput', position: { x: center.x - dx, y: center.y + dy }, data: { ...getInitNodeData(inPrompt, 'customInput'), inputName: 'prompt', inputType: 'Text' } },
          { id: llm, type: 'llm', position: { x: center.x, y: center.y }, data: { ...getInitNodeData(llm, 'llm'), model: 'gpt-4' } },
          { id: out, type: 'customOutput', position: { x: center.x + dx, y: center.y }, data: { ...getInitNodeData(out, 'customOutput'), outputName: 'result', outputType: 'Text' } },
        ];

        const newEdges = [
          {
            id: `${inSystem}->${llm}:system`,
            source: inSystem,
            target: llm,
            sourceHandle: `${inSystem}-value`,
            targetHandle: `${llm}-system`,
            type: 'default',
            animated: true,
          },
          {
            id: `${inPrompt}->${llm}:prompt`,
            source: inPrompt,
            target: llm,
            sourceHandle: `${inPrompt}-value`,
            targetHandle: `${llm}-prompt`,
            type: 'default',
            animated: true,
          },
          {
            id: `${llm}->${out}:value`,
            source: llm,
            target: out,
            sourceHandle: `${llm}-response`,
            targetHandle: `${out}-value`,
            type: 'default',
            animated: true,
          },
        ];

        applyTemplate(newNodes, newEdges, 'Template loaded: Prompt → LLM → Output');
        return;
      }

      if (templateId === 'text_to_output') {
        const text = getNodeID('text');
        const out = getNodeID('customOutput');
        const newNodes = [
          {
            id: text,
            type: 'text',
            position: { x: center.x - dx / 2, y: center.y },
            data: { ...getInitNodeData(text, 'text'), text: 'Hello {{name}}! Today is {{day}}.' },
          },
          { id: out, type: 'customOutput', position: { x: center.x + dx / 2, y: center.y }, data: { ...getInitNodeData(out, 'customOutput'), outputName: 'message', outputType: 'Text' } },
        ];
        const newEdges = [
          {
            id: `${text}->${out}:value`,
            source: text,
            target: out,
            sourceHandle: `${text}-output`,
            targetHandle: `${out}-value`,
            type: 'default',
            animated: true,
          },
        ];
        applyTemplate(newNodes, newEdges, 'Template loaded: Text → Output');
        return;
      }

      if (templateId === 'api_enrichment') {
        const body = getNodeID('customInput');
        const headers = getNodeID('customInput');
        const api = getNodeID('api');
        const filter = getNodeID('filter');
        const out = getNodeID('customOutput');
        const note = getNodeID('note');

        const newNodes = [
          { id: body, type: 'customInput', position: { x: center.x - dx, y: center.y - dy }, data: { ...getInitNodeData(body, 'customInput'), inputName: 'request_body', inputType: 'Text' } },
          { id: headers, type: 'customInput', position: { x: center.x - dx, y: center.y + dy }, data: { ...getInitNodeData(headers, 'customInput'), inputName: 'headers', inputType: 'Text' } },
          { id: api, type: 'api', position: { x: center.x, y: center.y }, data: { ...getInitNodeData(api, 'api'), method: 'POST', url: 'https://api.example.com/enrich', timeout: '30' } },
          { id: filter, type: 'filter', position: { x: center.x + dx, y: center.y }, data: { ...getInitNodeData(filter, 'filter'), filterType: 'contains', filterValue: 'success', caseSensitivity: 'insensitive' } },
          { id: out, type: 'customOutput', position: { x: center.x + dx * 2, y: center.y }, data: { ...getInitNodeData(out, 'customOutput'), outputName: 'enriched_response', outputType: 'Text' } },
          { id: note, type: 'note', position: { x: center.x, y: center.y - dy * 2 }, data: { ...getInitNodeData(note, 'note'), noteText: 'API Enrichment template:\n- Two inputs feed API (body + headers)\n- Response is filtered then sent to Output\nRun to validate DAG + counts', noteColor: '#3B82F6' } },
        ];

        const newEdges = [
          { id: `${body}->${api}:body`, source: body, target: api, sourceHandle: `${body}-value`, targetHandle: `${api}-body`, type: 'default', animated: true },
          { id: `${headers}->${api}:headers`, source: headers, target: api, sourceHandle: `${headers}-value`, targetHandle: `${api}-headers`, type: 'default', animated: true },
          { id: `${api}->${filter}:input`, source: api, target: filter, sourceHandle: `${api}-response`, targetHandle: `${filter}-input`, type: 'default', animated: true },
          { id: `${filter}->${out}:value`, source: filter, target: out, sourceHandle: `${filter}-output`, targetHandle: `${out}-value`, type: 'default', animated: true },
        ];

        applyTemplate(newNodes, newEdges, 'Template loaded: API Enrichment → Filter → Output');
        return;
      }

      if (templateId === 'smart_router') {
        const query = getNodeID('customInput');
        const system = getNodeID('customInput');
        const prompt = getNodeID('text');
        const cond = getNodeID('condition');
        const llm = getNodeID('llm');
        const api = getNodeID('api');
        const merge = getNodeID('merge');
        const out = getNodeID('customOutput');
        const note = getNodeID('note');

        const newNodes = [
          { id: query, type: 'customInput', position: { x: center.x - dx * 1.25, y: center.y }, data: { ...getInitNodeData(query, 'customInput'), inputName: 'query', inputType: 'Text' } },
          { id: system, type: 'customInput', position: { x: center.x - dx * 1.25, y: center.y - dy * 1.4 }, data: { ...getInitNodeData(system, 'customInput'), inputName: 'system', inputType: 'Text' } },
          {
            id: prompt,
            type: 'text',
            position: { x: center.x - dx * 0.35, y: center.y },
            data: { ...getInitNodeData(prompt, 'text'), text: 'Route this user request: {{query}}\nReturn a short intent label.' },
          },
          { id: cond, type: 'condition', position: { x: center.x + dx * 0.35, y: center.y }, data: { ...getInitNodeData(cond, 'condition'), operator: 'contains', compareValue: 'purchase' } },
          { id: llm, type: 'llm', position: { x: center.x + dx * 1.2, y: center.y - dy }, data: { ...getInitNodeData(llm, 'llm'), model: 'gpt-4' } },
          { id: api, type: 'api', position: { x: center.x + dx * 1.2, y: center.y + dy }, data: { ...getInitNodeData(api, 'api'), method: 'POST', url: 'https://api.example.com/search', timeout: '30' } },
          { id: merge, type: 'merge', position: { x: center.x + dx * 2.1, y: center.y }, data: { ...getInitNodeData(merge, 'merge'), strategy: 'concat', delimiter: 'newline' } },
          { id: out, type: 'customOutput', position: { x: center.x + dx * 3, y: center.y }, data: { ...getInitNodeData(out, 'customOutput'), outputName: 'final', outputType: 'Text' } },
          { id: note, type: 'note', position: { x: center.x - dx * 0.1, y: center.y - dy * 2 }, data: { ...getInitNodeData(note, 'note'), noteText: 'Smart Router template:\n- Text node uses {{query}} variable → dynamic handle\n- Condition branches to LLM (true) or API (false)\n- Merge combines responses → Output\nUse inspector to copy node/edge JSON.', noteColor: '#F97316' } },
        ];

        const newEdges = [
          // variable binding: query -> prompt {{query}}
          { id: `${query}->${prompt}:query`, source: query, target: prompt, sourceHandle: `${query}-value`, targetHandle: `${prompt}-query`, type: 'default', animated: true },

          // prompt output -> condition input
          { id: `${prompt}->${cond}:input`, source: prompt, target: cond, sourceHandle: `${prompt}-output`, targetHandle: `${cond}-input`, type: 'default', animated: true },

          // branch true -> llm prompt, false -> api body
          { id: `${cond}->${llm}:prompt`, source: cond, target: llm, sourceHandle: `${cond}-true`, targetHandle: `${llm}-prompt`, type: 'default', animated: true },
          { id: `${cond}->${api}:body`, source: cond, target: api, sourceHandle: `${cond}-false`, targetHandle: `${api}-body`, type: 'default', animated: true },

          // system input -> llm system
          { id: `${system}->${llm}:system`, source: system, target: llm, sourceHandle: `${system}-value`, targetHandle: `${llm}-system`, type: 'default', animated: true },

          // llm response + api response -> merge -> output
          { id: `${llm}->${merge}:in1`, source: llm, target: merge, sourceHandle: `${llm}-response`, targetHandle: `${merge}-input1`, type: 'default', animated: true },
          { id: `${api}->${merge}:in2`, source: api, target: merge, sourceHandle: `${api}-response`, targetHandle: `${merge}-input2`, type: 'default', animated: true },
          { id: `${merge}->${out}:value`, source: merge, target: out, sourceHandle: `${merge}-output`, targetHandle: `${out}-value`, type: 'default', animated: true },
        ];

        applyTemplate(newNodes, newEdges, 'Template loaded: Smart Router (Variables → Branch → Merge)');
        return;
      }

      if (templateId === 'data_prep_llm_output') {
        const query = getNodeID('customInput');
        const system = getNodeID('customInput');
        const prep = getNodeID('filter');
        const prompt = getNodeID('text');
        const llm = getNodeID('llm');
        const out = getNodeID('customOutput');
        const note = getNodeID('note');

        const promptText =
          'You are an assistant. Rewrite the following user query into a clear task:\n\n{{query}}\n\nReturn JSON with keys: intent, constraints, output_format.';

        const newNodes = [
          {
            id: query,
            type: 'customInput',
            position: { x: center.x - dx * 1.35, y: center.y + dy * 0.2 },
            data: { ...getInitNodeData(query, 'customInput'), inputName: 'query', inputType: 'Text' },
          },
          {
            id: system,
            type: 'customInput',
            position: { x: center.x - dx * 1.35, y: center.y - dy * 1.2 },
            data: { ...getInitNodeData(system, 'customInput'), inputName: 'system', inputType: 'Text' },
          },
          {
            id: prompt,
            type: 'text',
            position: { x: center.x - dx * 0.35, y: center.y },
            data: {
              ...getInitNodeData(prompt, 'text'),
              text: promptText,
              variables: ['query'],
              dynamicHandles: [{ id: 'query', label: 'query', type: 'target' }],
            },
          },
          {
            id: prep,
            type: 'filter',
            position: { x: center.x + dx * 0.45, y: center.y },
            data: { ...getInitNodeData(prep, 'filter'), filterType: 'regex', filterValue: '\\\\s+', caseSensitivity: 'insensitive' },
          },
          {
            id: llm,
            type: 'llm',
            position: { x: center.x + dx * 1.35, y: center.y - dy * 0.1 },
            data: { ...getInitNodeData(llm, 'llm'), model: 'gpt-4' },
          },
          {
            id: out,
            type: 'customOutput',
            position: { x: center.x + dx * 2.35, y: center.y - dy * 0.1 },
            data: { ...getInitNodeData(out, 'customOutput'), outputName: 'prepared_request', outputType: 'Text' },
          },
          {
            id: note,
            type: 'note',
            position: { x: center.x - dx * 0.15, y: center.y - dy * 2.1 },
            data: {
              ...getInitNodeData(note, 'note'),
              noteText:
                'Data Prep → LLM → Output:\n- Text node uses {{query}} (dynamic handle)\n- Filter simulates preprocessing/normalization\n- LLM consumes the cleaned prompt\nGreat for showing: variables + transformations + backend DAG validation.',
              noteColor: '#06B6D4',
            },
          },
        ];

        const newEdges = [
          { id: `${query}->${prompt}:query`, source: query, target: prompt, sourceHandle: `${query}-value`, targetHandle: `${prompt}-query`, type: 'default', animated: true },
          { id: `${prompt}->${prep}:input`, source: prompt, target: prep, sourceHandle: `${prompt}-output`, targetHandle: `${prep}-input`, type: 'default', animated: true },
          { id: `${prep}->${llm}:prompt`, source: prep, target: llm, sourceHandle: `${prep}-output`, targetHandle: `${llm}-prompt`, type: 'default', animated: true },
          { id: `${system}->${llm}:system`, source: system, target: llm, sourceHandle: `${system}-value`, targetHandle: `${llm}-system`, type: 'default', animated: true },
          { id: `${llm}->${out}:value`, source: llm, target: out, sourceHandle: `${llm}-response`, targetHandle: `${out}-value`, type: 'default', animated: true },
        ];

        applyTemplate(newNodes, newEdges, 'Template loaded: Data Prep → LLM → Output');
        return;
      }

      if (templateId === 'rag_lite') {
        const query = getNodeID('customInput');
        const system = getNodeID('customInput');
        const api = getNodeID('api');
        const filter = getNodeID('filter');
        const prompt = getNodeID('text');
        const llm = getNodeID('llm');
        const out = getNodeID('customOutput');
        const note = getNodeID('note');

        const promptText =
          'Answer the question using the provided context.\n\nQuestion:\n{{query}}\n\nContext:\n{{context}}\n\nAnswer concisely and cite the context in 1-2 bullets.';

        const newNodes = [
          {
            id: query,
            type: 'customInput',
            position: { x: center.x - dx * 1.6, y: center.y + dy * 0.2 },
            data: { ...getInitNodeData(query, 'customInput'), inputName: 'query', inputType: 'Text' },
          },
          {
            id: system,
            type: 'customInput',
            position: { x: center.x - dx * 1.6, y: center.y - dy * 1.2 },
            data: { ...getInitNodeData(system, 'customInput'), inputName: 'system', inputType: 'Text' },
          },
          {
            id: api,
            type: 'api',
            position: { x: center.x - dx * 0.55, y: center.y + dy * 0.15 },
            data: { ...getInitNodeData(api, 'api'), method: 'POST', url: 'https://api.example.com/search', timeout: '30' },
          },
          {
            id: filter,
            type: 'filter',
            position: { x: center.x + dx * 0.35, y: center.y + dy * 0.15 },
            data: { ...getInitNodeData(filter, 'filter'), filterType: 'contains', filterValue: 'snippet', caseSensitivity: 'insensitive' },
          },
          {
            id: prompt,
            type: 'text',
            position: { x: center.x + dx * 0.35, y: center.y - dy * 0.95 },
            data: {
              ...getInitNodeData(prompt, 'text'),
              text: promptText,
              variables: ['context', 'query'],
              dynamicHandles: [
                { id: 'query', label: 'query', type: 'target' },
                { id: 'context', label: 'context', type: 'target' },
              ],
            },
          },
          {
            id: llm,
            type: 'llm',
            position: { x: center.x + dx * 1.35, y: center.y - dy * 0.6 },
            data: { ...getInitNodeData(llm, 'llm'), model: 'gpt-4' },
          },
          {
            id: out,
            type: 'customOutput',
            position: { x: center.x + dx * 2.35, y: center.y - dy * 0.6 },
            data: { ...getInitNodeData(out, 'customOutput'), outputName: 'answer', outputType: 'Text' },
          },
          {
            id: note,
            type: 'note',
            position: { x: center.x - dx * 0.05, y: center.y - dy * 2.25 },
            data: {
              ...getInitNodeData(note, 'note'),
              noteText:
                'RAG Lite (Search → Context → LLM):\n- Query drives an API “search”\n- Filter cleans the response\n- Text prompt injects {{query}} + {{context}} (dynamic handles)\n- LLM produces final answer → Output\nGreat for showcasing a realistic product flow.',
              noteColor: '#3B82F6',
            },
          },
        ];

        const newEdges = [
          { id: `${query}->${api}:body`, source: query, target: api, sourceHandle: `${query}-value`, targetHandle: `${api}-body`, type: 'default', animated: true },
          { id: `${query}->${prompt}:query`, source: query, target: prompt, sourceHandle: `${query}-value`, targetHandle: `${prompt}-query`, type: 'default', animated: true },
          { id: `${api}->${filter}:input`, source: api, target: filter, sourceHandle: `${api}-response`, targetHandle: `${filter}-input`, type: 'default', animated: true },
          { id: `${filter}->${prompt}:context`, source: filter, target: prompt, sourceHandle: `${filter}-output`, targetHandle: `${prompt}-context`, type: 'default', animated: true },
          { id: `${prompt}->${llm}:prompt`, source: prompt, target: llm, sourceHandle: `${prompt}-output`, targetHandle: `${llm}-prompt`, type: 'default', animated: true },
          { id: `${system}->${llm}:system`, source: system, target: llm, sourceHandle: `${system}-value`, targetHandle: `${llm}-system`, type: 'default', animated: true },
          { id: `${llm}->${out}:value`, source: llm, target: out, sourceHandle: `${llm}-response`, targetHandle: `${out}-value`, type: 'default', animated: true },
        ];

        applyTemplate(newNodes, newEdges, 'Template loaded: RAG Lite (Search → Context → LLM)');
        return;
      }

      if (templateId === 'invalid_dag_cycle') {
        const text = getNodeID('text');
        const filter = getNodeID('filter');
        const out = getNodeID('customOutput');
        const note = getNodeID('note');

        const newNodes = [
          {
            id: text,
            type: 'text',
            position: { x: center.x - dx, y: center.y },
            data: {
              ...getInitNodeData(text, 'text'),
              text: 'This template intentionally creates a cycle.\n\nFilter output feeds {{x}}.\nText output feeds Filter input.',
              variables: ['x'],
              dynamicHandles: [{ id: 'x', label: 'x', type: 'target' }],
            },
          },
          {
            id: filter,
            type: 'filter',
            position: { x: center.x, y: center.y },
            data: {
              ...getInitNodeData(filter, 'filter'),
              filterType: 'contains',
              filterValue: 'cycle',
              caseSensitivity: 'insensitive',
            },
          },
          {
            id: out,
            type: 'customOutput',
            position: { x: center.x + dx, y: center.y + dy * 0.6 },
            data: { ...getInitNodeData(out, 'customOutput'), outputName: 'unused', outputType: 'Text' },
          },
          {
            id: note,
            type: 'note',
            position: { x: center.x, y: center.y - dy * 1.2 },
            data: {
              ...getInitNodeData(note, 'note'),
              noteColor: '#EF4444',
              noteText:
                'Feedback Loop: Text <-> Filter\n\nLoop:\nText -> Filter -> Text\n\nSubmit to see cycle detection in action.',
            },
          },
        ];

        const newEdges = [
          {
            id: `${text}->${filter}:input`,
            source: text,
            target: filter,
            sourceHandle: `${text}-output`,
            targetHandle: `${filter}-input`,
            type: 'default',
            animated: true,
          },
          {
            id: `${filter}->${text}:x`,
            source: filter,
            target: text,
            sourceHandle: `${filter}-output`,
            targetHandle: `${text}-x`,
            type: 'default',
            animated: true,
          },
          {
            id: `${filter}->${out}:value`,
            source: filter,
            target: out,
            sourceHandle: `${filter}-output`,
            targetHandle: `${out}-value`,
            type: 'default',
            animated: true,
          },
        ];

        applyTemplate(newNodes, newEdges, 'Template loaded: Feedback Loop: Text ↔ Filter');
        return;
      }
    },
    [reactFlowInstance, getNodeID, setGraph, closeInspector, success]
  );

  const isTyping = () => {
    const tag = String(document.activeElement?.tagName || '').toLowerCase();
    return tag === 'input' || tag === 'textarea' || document.activeElement?.isContentEditable;
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      if (isTyping()) return;

      const isCmdOrCtrl = event.metaKey || event.ctrlKey;

      if (isCmdOrCtrl && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((v) => !v);
        setPaletteQuery('');
        return;
      }

      if (!isCmdOrCtrl && (event.key === 'n' || event.key === 'N')) {
        event.preventDefault();
        setPaletteOpen(true);
        setPaletteQuery('');
        return;
      }

      if (event.key === 'Delete') {
        event.preventDefault();
        deleteSelectedElements();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [deleteSelectedElements]);

  const handleAction = useCallback(
    (actionId) => {
      if (actionId === 'run') {
        window.dispatchEvent(new Event('pipeline:submit'));
        info('Running pipeline…');
        return;
      }

      if (actionId === 'copy_pipeline') {
        const payload = {
          nodes: (nodes || []).map((node) => ({
            id: node.id,
            type: node.type,
            data: node.data,
            position: node.position,
          })),
          edges: (edges || []).map((edge) => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle,
            type: edge.type,
          })),
        };

        const text = JSON.stringify(payload, null, 2);
        const writeText = navigator?.clipboard?.writeText;
        if (!writeText) {
          error('Copy failed (clipboard not available).');
          return;
        }

        writeText
          .call(navigator.clipboard, text)
          .then(() => success('Pipeline JSON copied to clipboard.'))
          .catch(() => error('Copy failed (clipboard not available).'));
        return;
      }

      if (actionId === 'save') {
        try {
          const payload = { nodes, edges, savedAt: Date.now() };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
          success('Saved to browser storage.');
        } catch (e) {
          error('Failed to save pipeline.');
        }
        return;
      }

      if (actionId === 'load') {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (!raw) {
            info('No saved pipeline found yet.');
            return;
          }
          const parsed = JSON.parse(raw);
          setGraph({ nodes: parsed.nodes || [], edges: parsed.edges || [] });
          success('Loaded saved pipeline.');
        } catch (e) {
          error('Failed to load pipeline.');
        }
        return;
      }

      if (actionId === 'save_template') {
        setTemplateName(`Template ${new Date().toLocaleString()}`);
        setTemplateModalOpen(true);
        return;
      }

      if (actionId === 'clear') {
        clearGraph();
        info('Canvas cleared.');
      }
    },
    [nodes, edges, setGraph, clearGraph, info, success, error]
  );

  const deleteSavedTemplate = useCallback(
    (templateId) => {
      const next = (savedTemplates || []).filter((t) => String(t.id) !== String(templateId));
      try {
        localStorage.setItem(TEMPLATES_KEY, JSON.stringify(next));
        setSavedTemplates(next);
        success('Template deleted.');
      } catch {
        error('Failed to delete template.');
      }
    },
    [savedTemplates, success, error]
  );

  const renameSavedTemplate = useCallback(
    (templateId, nextName) => {
      if (templateId == null) {
        error('No template selected.');
        return false;
      }

      const name = String(nextName || '').trim();
      if (!name) {
        error('Please enter a template name.');
        return false;
      }

      const next = (savedTemplates || []).map((t) =>
        String(t.id) === String(templateId) ? { ...t, name } : t
      );

      try {
        localStorage.setItem(TEMPLATES_KEY, JSON.stringify(next));
        setSavedTemplates(next);
        success('Template renamed.');
        return true;
      } catch {
        error('Failed to rename template.');
        return false;
      }
    },
    [savedTemplates, success, error]
  );

  const paletteGroups = useMemo(() => {
    const nodeItems = nodeCatalog.map((group) => ({
      id: `nodes:${group.section}`,
      title: group.section,
      items: group.items.map((n) => ({
        id: `node:${n.type}`,
        label: n.label,
        description: `Add a ${n.label} node`,
        keywords: [n.type, ...(n.keywords || [])],
        icon: <n.Icon size={16} />,
        onSelect: () => {
          addNodeAtCenter(n.type);
          setPaletteOpen(false);
        },
      })),
    }));

    const starterTemplatesGroup = {
      id: 'templates',
      title: 'Starter Templates',
      items: [
        {
          id: 'tpl:prompt_llm_output',
          label: 'Prompt → LLM → Output',
          description: 'A starter pipeline with 2 inputs feeding an LLM',
          tooltip:
            'Two Inputs feed an LLM (system + prompt), then into Output.\nIncludes: multi-input node wiring + backend DAG validation.\nIn a real product: executes the LLM step and passes the response to Output.',
          keywords: ['template', 'starter', 'llm'],
          icon: <Sparkles size={16} />,
          onSelect: () => {
            loadTemplate('prompt_llm_output');
            setPaletteOpen(false);
          },
        },
        {
          id: 'tpl:text_to_output',
          label: 'Text → Output',
          description: 'Quickly test Text node variables and output wiring',
          tooltip:
            'Text node auto-detects {{variables}} and creates dynamic input handles.\nIncludes: variable parsing + handle generation.\nIn a real product: variables bind upstream outputs into the template text before execution.',
          keywords: ['template', 'text'],
          icon: <Sparkles size={16} />,
          onSelect: () => {
            loadTemplate('text_to_output');
            setPaletteOpen(false);
          },
        },
        {
          id: 'tpl:api_enrichment',
          label: 'API Enrichment → Filter → Output',
          description: 'Showcases API + Filter nodes with 2 inputs (body/headers)',
          tooltip:
            'Two Inputs feed API (body + headers), API response passes through Filter into Output.\nIncludes: multi-input wiring + transformation step.\nIn a real product: performs the HTTP call, then filters/transforms the response before output.',
          keywords: ['template', 'api', 'filter'],
          icon: <Sparkles size={16} />,
          onSelect: () => {
            loadTemplate('api_enrichment');
            setPaletteOpen(false);
          },
        },
        {
          id: 'tpl:smart_router',
          label: 'Smart Router (Variables → Branch → Merge)',
          description: 'Text variables + Condition branching + Merge to Output',
          tooltip:
            'Input binds into a Text node via {{query}}, flows into a Condition node that branches to LLM (true) or API (false), then merges to Output.\nIncludes: variables + branching + merging.\nIn a real product: routes requests to the best tool/model and aggregates results.',
          keywords: ['template', 'condition', 'merge', 'variables'],
          icon: <Sparkles size={16} />,
          onSelect: () => {
            loadTemplate('smart_router');
            setPaletteOpen(false);
          },
        },
        {
          id: 'tpl:data_prep_llm_output',
          label: 'Data Prep → LLM → Output',
          description: 'Filter preprocessing + Text variables + LLM',
          tooltip:
            '{{query}} is injected into a Text prompt, then a Filter simulates preprocessing before the LLM consumes it.\nIncludes: variables + preprocessing step + DAG validation.\nIn a real product: normalizes/cleans input, then runs the LLM and forwards the result.',
          keywords: ['template', 'filter', 'llm', 'variables'],
          icon: <Sparkles size={16} />,
          onSelect: () => {
            loadTemplate('data_prep_llm_output');
            setPaletteOpen(false);
          },
        },
          {
            id: 'tpl:rag_lite',
            label: 'RAG Lite (Search → Context → LLM)',
            description: 'API search + Filter + prompt injection ({{context}})',
            tooltip:
              'Query triggers an API "search", Filter cleans the response, Text injects {{query}} + {{context}} into a prompt, then LLM answers.\nIncludes: retrieval-style context injection.\nIn a real product: fetches context from a knowledge source before generating the answer.',
            keywords: ['template', 'api', 'filter', 'rag', 'context'],
            icon: <Sparkles size={16} />,
            onSelect: () => {
              loadTemplate('rag_lite');
              setPaletteOpen(false);
            },
          },
          {
            id: 'tpl:invalid_dag_cycle',
            label: 'Feedback Loop: Text ↔ Filter',
            description: 'A cyclic dependency between Text and Filter',
            tooltip:
              'A Text node and Filter node feed into each other (cycle).\nUse Submit to see cycle detection in the backend response.',
            keywords: ['template', 'cycle', 'invalid', 'dag'],
            icon: <Sparkles size={16} />,
            onSelect: () => {
              loadTemplate('invalid_dag_cycle');
              setPaletteOpen(false);
            },
          },
        ],
      };

    const savedTemplatesGroup = {
      id: 'saved_templates',
      title: 'Saved Templates',
      items: (savedTemplates || []).slice(0, 20).map((t) => {
        const name = t.name || 'Untitled template';
        const meta = `${(t.nodes || []).length} nodes · ${(t.edges || []).length} edges`;
        return {
          id: `saved:${t.id}`,
          label: name,
          description: meta,
          tooltip: 'Load this saved template into the canvas.',
          keywords: ['template', 'saved', 'load'],
          icon: <Sparkles size={16} />,
          actions: [
            {
              id: `edit:${t.id}`,
              label: 'Rename',
              tooltip: 'Rename this template',
              icon: <Pencil size={16} />,
              onSelect: () => {
                setRenameTemplateId(t.id);
                setRenameTemplateName(name);
                setRenameModalOpen(true);
                setPaletteOpen(false);
              },
            },
            {
              id: `delete:${t.id}`,
              label: 'Delete',
              tooltip: 'Delete this template',
              variant: 'danger',
              icon: <Trash2 size={16} />,
              onSelect: () => {
                deleteSavedTemplate(t.id);
                setPaletteOpen(false);
              },
            },
          ],
          onSelect: () => {
            setGraph({ nodes: t.nodes || [], edges: t.edges || [] });
            success(`Loaded template: ${name}`);
            setPaletteOpen(false);
          },
        };
      }),
    };

    const actionsGroup = {
      id: 'actions',
      title: 'Actions',
      items: paletteActions.map((a) => ({
        id: `action:${a.id}`,
        label: a.label,
        description:
          a.id === 'run'
            ? 'Submit to backend (Ctrl/Cmd+Enter)'
            : a.id === 'copy_pipeline'
            ? 'Copy nodes & edges JSON to clipboard'
            : a.id === 'save'
            ? 'Persist to this browser'
            : a.id === 'load'
            ? 'Restore last saved pipeline'
            : a.id === 'save_template'
            ? 'Save current graph as a reusable template'
            : 'Remove all nodes & edges',
        keywords: a.keywords || [],
        icon: <a.Icon size={16} />,
        onSelect: () => {
          handleAction(a.id);
          setPaletteOpen(false);
        },
      })),
    };

    const groups = [starterTemplatesGroup];
    if ((savedTemplates || []).length > 0) groups.push(savedTemplatesGroup);
    groups.push(actionsGroup, ...nodeItems);
    return groups;
  }, [addNodeAtCenter, handleAction, loadTemplate, savedTemplates, setGraph, success, deleteSavedTemplate]);

  const duplicateSelectedNode = useCallback(() => {
    if (!selectedNode) return;
    const newId = getNodeID(selectedNode.type);
    addNode({
      ...selectedNode,
      id: newId,
      position: { x: selectedNode.position.x + 40, y: selectedNode.position.y + 40 },
      data: { ...(selectedNode.data || {}), id: newId },
      selected: false,
    });
    success('Node duplicated.');
  }, [selectedNode, getNodeID, addNode, success]);

  const inspectorNode =
    selectedNode && (!INSPECTOR_DOUBLE_CLICK || (inspectorTarget?.kind === 'node' && inspectorTarget?.id === selectedNode.id))
      ? selectedNode
      : null;
  const inspectorEdge =
    selectedEdge && (!INSPECTOR_DOUBLE_CLICK || (inspectorTarget?.kind === 'edge' && inspectorTarget?.id === selectedEdge.id))
      ? selectedEdge
      : null;

  return (
    <div ref={reactFlowWrapper} className="pipeline-wrapper">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={setReactFlowInstance}
        onPaneClick={() => {
          if (!INSPECTOR_DOUBLE_CLICK) return;
          closeInspector();
        }}
        onNodeDoubleClick={(_, node) => {
          if (!INSPECTOR_DOUBLE_CLICK) return;
          setInspectorClosed(false);
          setInspectorTarget({ kind: 'node', id: node.id });
        }}
        onEdgeDoubleClick={(_, edge) => {
          if (!INSPECTOR_DOUBLE_CLICK) return;
          setInspectorClosed(false);
          setInspectorTarget({ kind: 'edge', id: edge.id });
        }}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        proOptions={proOptions}
        snapGrid={[gridSize, gridSize]}
        snapToGrid
        connectionLineType="smoothstep"
        defaultEdgeOptions={{
          type: 'default', // Use our custom edge by default
          animated: true,
          style: { stroke: '#6366F1', strokeWidth: 2 }
        }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background
          color="rgba(110, 110, 110, 0.2)"
          gap={gridSize}
          size={1}
          variant="dots"
        />
        <Controls className="custom-controls" />
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          className="custom-minimap"
          nodeColor={(node) => {
            // Use visually distinct colors for minimap nodes
            switch (node.type) {
              case 'customInput': return '#6366F1';
              case 'customOutput': return '#8B5CF6';
              case 'text': return '#10B981';
              default: return '#3B82F6';
            }
          }}
          maskColor="rgba(15, 23, 42, 0.6)"
        />
      </ReactFlow>

      {nodes.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-card">
            <div className="empty-state-title">Start building a pipeline</div>
            <div className="empty-state-subtitle">
              Drag nodes from the top bar, or press <span className="kbd">N</span> /{' '}
              <span className="kbd">Ctrl/Cmd+K</span>.
            </div>
            <div className="empty-state-actions">
              <button
                className="empty-state-button"
                type="button"
                onClick={() => loadTemplate('prompt_llm_output')}
                title="Two inputs feed an LLM (system + prompt), then into Output."
              >
                Use template: Prompt → LLM → Output
              </button>
              <button
                className="empty-state-button secondary"
                type="button"
                onClick={() => loadTemplate('smart_router')}
                title="Routes a query through variables, branching (Condition), and merging (Merge) into Output."
              >
                Use template: Smart Router (Variables → Branch → Merge)
              </button>
            </div>
          </div>
        </div>
      )}

      <CommandPalette
        open={paletteOpen}
        query={paletteQuery}
        setQuery={setPaletteQuery}
        groups={paletteGroups}
        onClose={() => setPaletteOpen(false)}
      />

      {(inspectorNode || inspectorEdge) && !inspectorClosed && (
        <InspectorPanel
          node={inspectorNode}
          edge={inspectorEdge}
          onClose={closeInspector}
          onDeleteSelected={deleteSelectedElements}
          onDuplicateNode={duplicateSelectedNode}
          onToast={(msg, type) => {
            if (type === 'success') success(msg);
            else if (type === 'error') error(msg);
            else info(msg);
          }}
        />
      )}

      <PromptModal
        open={templateModalOpen}
        title="Save as template"
        description="This saves the current nodes & edges so you can reload it from the command palette."
        value={templateName}
        placeholder="Template name…"
        confirmText="Save template"
        cancelText="Cancel"
        onChange={setTemplateName}
        onCancel={() => setTemplateModalOpen(false)}
        onConfirm={() => {
          const name = (templateName || '').trim();
          if (!name) {
            error('Please enter a template name.');
            return;
          }
          if ((nodes || []).length === 0) {
            error('Canvas is empty. Add some nodes first.');
            return;
          }

          const next = [
            {
              id: `${Date.now()}`,
              name,
              nodes,
              edges,
              savedAt: Date.now(),
            },
            ...(savedTemplates || []),
          ].slice(0, 20);

          try {
            localStorage.setItem(TEMPLATES_KEY, JSON.stringify(next));
            setSavedTemplates(next);
            setTemplateModalOpen(false);
            success('Template saved. Open palette to load it.');
          } catch {
            error('Failed to save template.');
          }
        }}
      />

      <PromptModal
        open={renameModalOpen}
        title="Rename template"
        description="Updates the template name in browser storage."
        value={renameTemplateName}
        placeholder="Template name…"
        confirmText="Rename"
        cancelText="Cancel"
        onChange={setRenameTemplateName}
        onCancel={() => setRenameModalOpen(false)}
        onConfirm={() => {
          const ok = renameSavedTemplate(renameTemplateId, renameTemplateName);
          if (ok) setRenameModalOpen(false);
        }}
      />
    </div>
  );
};
