// store.js

import { create } from "zustand";
import {
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    MarkerType,
  } from 'reactflow';

export const useStore = create((set, get) => ({
    nodes: [],
    edges: [],
    nodeIDs: {},
    lastRun: null,
    getNodeID: (type) => {
        const newIDs = {...get().nodeIDs};
        if (newIDs[type] === undefined) {
            newIDs[type] = 0;
        }
        newIDs[type] += 1;
        set({nodeIDs: newIDs});
        return `${type}-${newIDs[type]}`;
    },
    addNode: (node) => {
        set({
            nodes: [...get().nodes, node]
        });
    },
    setGraph: ({ nodes, edges }) => {
      const derived = {};
      for (const node of nodes || []) {
        const id = String(node?.id ?? '');
        const lastDash = id.lastIndexOf('-');
        if (lastDash <= 0) continue;
        const type = id.slice(0, lastDash);
        const num = Number(id.slice(lastDash + 1));
        if (!Number.isFinite(num)) continue;
        derived[type] = Math.max(derived[type] || 0, num);
      }

      set({
        nodes: Array.isArray(nodes) ? nodes : [],
        edges: Array.isArray(edges) ? edges : [],
        nodeIDs: derived,
      });
    },
    clearGraph: () => set({ nodes: [], edges: [], nodeIDs: {} }),
    setLastRun: (result) => set({ lastRun: result }),
    onNodesChange: (changes) => {
      set({
        nodes: applyNodeChanges(changes, get().nodes),
      });
    },
    onEdgesChange: (changes) => {
      set({
        edges: applyEdgeChanges(changes, get().edges),
      });
    },
    onConnect: (connection) => {
      set({
        edges: addEdge(
          {
            ...connection,
            type: 'default',
            animated: true,
            markerEnd: { type: MarkerType.Arrow, height: '20px', width: '20px' },
            style: { stroke: '#6366F1', strokeWidth: 2 },
          },
          get().edges
        ),
      });
    },
    deleteSelectedElements: () => {
      const nodes = get().nodes || [];
      const edges = get().edges || [];
      const remainingNodes = nodes.filter((n) => !n.selected);
      const selectedNodeIds = new Set(nodes.filter((n) => n.selected).map((n) => n.id));
      const remainingEdges = edges.filter((e) => {
        if (e.selected) return false;
        if (selectedNodeIds.has(e.source) || selectedNodeIds.has(e.target)) return false;
        return true;
      });

      set({ nodes: remainingNodes, edges: remainingEdges });
    },
    updateNodeField: (nodeId, fieldName, fieldValue) => {
      set({
        nodes: get().nodes.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: { ...(node.data || {}), [fieldName]: fieldValue },
            };
          }

          return node;
        }),
      });
    },
  }));
