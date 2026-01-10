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

import { useState, useRef, useCallback } from 'react';
import ReactFlow, { Controls, Background, MiniMap } from 'reactflow';
import { useStore } from './store';

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

import 'reactflow/dist/style.css';

// Grid configuration
const gridSize = 20;
const proOptions = { hideAttribution: true };

/**
 * Node Types Registry
 * 
 * Maps node type strings to their React components.
 * When adding a new node:
 * 1. Create the node component in /nodes
 * 2. Export it from /nodes/index.js
 * 3. Register it here with a unique type key
 * 4. Add it to the toolbar in toolbar.js
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

export const PipelineUI = () => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  
  // Use individual selectors to prevent infinite re-renders
  const nodes = useStore((state) => state.nodes);
  const edges = useStore((state) => state.edges);
  const getNodeID = useStore((state) => state.getNodeID);
  const addNode = useStore((state) => state.addNode);
  const onNodesChange = useStore((state) => state.onNodesChange);
  const onEdgesChange = useStore((state) => state.onEdgesChange);
  const onConnect = useStore((state) => state.onConnect);

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
        nodeTypes={nodeTypes}
        proOptions={proOptions}
        snapGrid={[gridSize, gridSize]}
        snapToGrid
        connectionLineType="smoothstep"
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
        }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background 
          color="rgba(255, 255, 255, 0.03)" 
          gap={gridSize} 
          size={1}
        />
        <Controls />
        <MiniMap 
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
      </ReactFlow>
    </div>
  );
};
