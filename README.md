# VectorShift Pipeline Builder

Visual pipeline builder (node/edge editor) with backend graph validation. Build workflows on a canvas, submit them, and receive node/edge counts plus DAG validity (cycle detection).

## 1. Project overview

### Purpose
- Problem: non-technical users need to compose AI/data workflows without writing code.
- Users: builders/operators who want a visual editor (Retool/n8n/Flowise-style experience).
- Why it exists: represent workflows as a directed graph and validate structure before execution.

### Scope
Included:
- Visual editor for creating pipelines (nodes + edges).
- Text templating with `{{variableName}}` that generates dynamic input handles.
- Backend endpoint to count nodes/edges and validate if the graph is a DAG.
- UX/editor features (palette, templates, save/load, inspector, toasts).

Out of scope (intentional):
- Executing the pipeline (running the LLM/API steps end-to-end).
- Persistent multi-user storage (uses localStorage for templates in this submission).

## 2. Architecture (high level)

Frontend (React + React Flow) stores the graph in a single Zustand store and serializes it on submit.
Backend (FastAPI) validates the submitted graph using Kahn's algorithm for cycle detection.

More details:
- `Architecture.MD`
- ADRs: `docs/adr/README.md`

## 3. What is implemented

### Node types
- Input, Output
- Text (dynamic variables + auto-resize)
- LLM
- Filter
- API
- Condition (branch true/false)
- Merge (multi-input merge)
- Note (documentation node)

### Text node logic
- Auto-resizes width/height with content.
- Detects `{{variableName}}` (valid JS identifiers) and creates a left-side handle per variable.

### Backend integration
- Frontend submits `{ nodes, edges }` to `POST /pipelines/parse`.
- Response format: `{ num_nodes: int, num_edges: int, is_dag: bool }`.
- Cycle detection uses Kahn's algorithm (topological processing).

### Editor / UX features
- Command palette: add nodes, load templates, and run actions.
- Starter templates (including complex flows) + saved templates (localStorage).
- Copy pipeline JSON (palette) + copy selected node/edge JSON (inspector).
- Inspector panel (copy JSON, duplicate, delete) opened via double-click (configurable).
- Toast notifications + results modal + "last run" pill.
- Custom animated edges, minimap, custom controls styling.

## 4. Keyboard shortcuts

- `Ctrl/Cmd+K`: open command palette
- `N`: open palette (node search/add)
- `Ctrl/Cmd+Enter`: submit/run pipeline
- `Del`: delete selected nodes/edges
- Double-click node/edge: open Inspector (default)

## 5. Starter templates

Open the palette (`Ctrl/Cmd+K`) -> Starter Templates:
- Prompt -> LLM -> Output
- Text -> Output
- API Enrichment -> Filter -> Output
- Smart Router (Variables -> Branch -> Merge)
- Data Prep -> LLM -> Output
- RAG Lite (Search -> Context -> LLM)
- Feedback Loop: Text ↔ Filter

## 6. Installation & setup

### Prerequisites
- Node.js 18+
- Python 3.8+

### Backend (FastAPI)
```bash
cd backend
pip install fastapi uvicorn pydantic
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
Backend URL: `http://localhost:8000`

### Frontend (React)
```bash
cd frontend
npm install
npm start
```
Frontend URL: `http://localhost:3000`

### Environment variables

Frontend supports:
- `REACT_APP_INSPECTOR_DOUBLE_CLICK` (default: `true`)
  - `true`: inspector opens only on double-click
  - `false`: inspector opens on selection

File: `frontend/.env`

## 7. How to review quickly

1. Load a complex template (e.g., Smart Router).
2. Edit the Text node and add a new `{{variable}}` to see a handle appear.
3. Submit (`Ctrl/Cmd+Enter`) and verify the modal shows node/edge counts and DAG validity.
4. Create a cycle and submit again to see `is_dag: false`.
5. Double-click a node to open Inspector -> Copy JSON / Duplicate.

## 8. Docs

- `RUN_BOOK.md` (run + troubleshooting)
- `Architecture.MD` (system overview)
- ADR index: `docs/adr/README.md`

## Author

Shivansh Tripathi
