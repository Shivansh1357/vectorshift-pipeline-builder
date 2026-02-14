# Architecture

This project is a small "visual pipeline builder" (a node/edge editor) with a minimal backend validator. Users compose workflows on a canvas, submit them to the backend, and receive graph metrics + DAG validity.

## High-level flow

1. User creates/edits a graph on the canvas (nodes + edges).
2. The graph state lives in a global store (Zustand) so it's easy to serialize.
3. Clicking Submit (or `Ctrl/Cmd+Enter`) sends `{ nodes, edges }` to the backend.
4. The backend counts nodes/edges and checks if the graph is a DAG (cycle detection).
5. The UI shows a result modal + toasts + last-run status.

## Frontend architecture (React)

### Key modules

- `frontend/src/App.js`
  - Composes `PipelineToolbar`, `PipelineUI`, and `SubmitButton`.
  - Wraps everything in `ToastProvider`.

- `frontend/src/store.js`
  - Single source of truth for `nodes` and `edges`.
  - Supports graph actions (`addNode`, `setGraph`, `clearGraph`, selection delete).

- `frontend/src/ui.js`
  - React Flow canvas:
    - node registration (`nodeTypes`)
    - edge registration (`edgeTypes`)
    - drag/drop to add nodes
    - keyboard shortcuts and command palette
    - starter templates and saved templates (localStorage)
    - inspector panel on selection

- `frontend/src/submit.js`
  - Serializes graph and POSTs to the backend `/pipelines/parse`.
  - Shows a results modal and stores "last run" summary.

### Node abstraction

All nodes are built using a shared base component:

- `frontend/src/components/BaseNode/BaseNode.js`
  - Defines a consistent node frame, header, handles, and field layout.
  - Supports dynamic handles for Text node variables (`data.dynamicHandles`).

Each node file in `frontend/src/nodes/*` is mostly configuration + small state binding:
- Handles (target/source) and label placement are declared in config.
- Node fields write into `node.data` through the store.

### Data model

- Node:
  - `id`, `type`, `position`, `data`
- Edge:
  - `id`, `source`, `target`, `sourceHandle`, `targetHandle`

The backend only needs `id/source/target` to validate DAG, but handles are included for richer structure.

### Storage

Local persistence is intentionally lightweight:

- Saved pipeline: `localStorage["vectorshift.pipeline.v1"]`
- Saved templates: `localStorage["vectorshift.templates.v1"]`

## Backend architecture (FastAPI)

- `backend/main.py`
  - `POST /pipelines/parse`
    - counts nodes/edges
    - validates DAG using Kahn's algorithm (topological processing)
    - returns `{ num_nodes, num_edges, is_dag }`

### DAG check rationale

In a real pipeline executor, a DAG enables deterministic execution order via topological sorting. Cycles imply circular dependencies and prevent a clean evaluation order.

## UX extras (product polish)

- Command palette (`Ctrl/Cmd+K`) to add nodes, load templates, and run actions.
- Starter templates to quickly demonstrate realistic workflows.
- Saved templates for repeatable demos.
- Inspector panel to debug/copy JSON and speed iteration.
- Non-blocking toasts + last-run pill for immediate feedback.

