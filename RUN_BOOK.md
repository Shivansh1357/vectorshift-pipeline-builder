# RUN_BOOK

This is a practical guide to run and demo the submission quickly.

## Requirements

- Node.js: 18+
- Python: 3.8+

## Run the project

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

## Core usage

### Add nodes

- Drag nodes from the top toolbar onto the canvas, or:
- Press `N` (opens palette), then search and add a node.

### Connect nodes

- Drag from a source handle (right side) to a target handle (left side).

### Text variables

In the Text node, type:

```txt
Hello {{name}}. Today is {{day}}.
```

Each `{{variable}}` creates a new input handle on the left.

### Submit / validate

- Click **Submit Pipeline**, or press `Ctrl/Cmd+Enter`.
- The modal shows:
  - number of nodes
  - number of edges
  - whether the graph is a DAG

## Keyboard shortcuts

- `Ctrl/Cmd+K`: command palette
- `N`: open palette (add/search nodes)
- `Ctrl/Cmd+Enter`: submit/run
- `Del`: delete selected nodes/edges

## Templates (recommended demo order)

Open palette (`Ctrl/Cmd+K`) -> Starter Templates:

- Smart Router (Variables -> Branch -> Merge)
- RAG Lite (Search -> Context -> LLM)
- Data Prep -> LLM -> Output
- API Enrichment -> Filter -> Output
- Prompt -> LLM -> Output
- Text -> Output
- Feedback Loop: Text ↔ Filter

## Troubleshooting

### npm scripts blocked on Windows PowerShell

If you see "running scripts is disabled", use the `.cmd` entrypoint:

```bash
npm.cmd -C frontend run build
```

### Ports in use

- Frontend: change port via environment (`PORT=3001 npm start`)
- Backend: change port (`uvicorn main:app --port 8001`) and update `API_BASE_URL` in `frontend/src/submit.js`

### Backend not reachable

- Confirm backend is running at `http://localhost:8000`
- Confirm no firewall/VPN is blocking local ports
