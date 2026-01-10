# VectorShift Frontend Assessment - Run Book

## 📋 Project Overview

This is a pipeline builder application that allows users to create visual workflows by connecting different types of nodes. The project consists of:

- **Frontend**: React application with React Flow for the node-based editor
- **Backend**: FastAPI server for pipeline validation (DAG detection)

---

## 🚀 Getting Started

### System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Node.js | 16.x | 18.x or higher |
| Python | 3.8 | 3.10 or higher |
| RAM | 4 GB | 8 GB |
| OS | Windows/macOS/Linux | Any |

### Step-by-Step Setup

#### 1. Clone/Extract the Project

```bash
# If downloaded as zip, extract it first
unzip Shivansh_Tripathi_technical_assessment.zip
cd frontend_technical_assessment
```

#### 2. Start the Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will start at `http://localhost:3000`

#### 3. Start the Backend (New Terminal)

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install fastapi uvicorn pydantic

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will start at `http://localhost:8000`

---

## 🎯 Features Walkthrough

### 1. Node Types Available

| Node | Icon | Purpose |
|------|------|---------|
| **Input** | ⬇️ | Entry point for pipeline data |
| **Output** | ⬆️ | Exit point for pipeline data |
| **LLM** | 🤖 | Language model processing |
| **Text** | 📝 | Text input with variable support |
| **Filter** | 🔍 | Data filtering/transformation |
| **Condition** | 🔀 | Conditional branching (if/else) |
| **Merge** | 🔗 | Combine multiple inputs |
| **API** | 🌐 | HTTP request configuration |
| **Note** | 📌 | Documentation/comments |

### 2. Creating a Pipeline

1. **Drag nodes** from the left toolbar onto the canvas
2. **Connect nodes** by clicking and dragging from an output handle (right side) to an input handle (left side)
3. **Configure nodes** by editing the fields within each node
4. **Pan/Zoom** using mouse drag and scroll wheel

### 3. Text Node Variables

The Text node supports template variables:

```
Hello {{name}}, welcome to {{city}}!
```

- Variables are detected automatically using `{{variableName}}` syntax
- Each variable creates a new input handle on the left
- Variables must be valid JavaScript identifiers

### 4. Pipeline Validation

Click **"Submit Pipeline"** to:
- Send the pipeline to the backend
- Check if it forms a valid DAG (Directed Acyclic Graph)
- View results in a modal showing:
  - Number of nodes
  - Number of edges
  - DAG validity status

---

## 🔧 Troubleshooting

### Frontend Issues

| Problem | Solution |
|---------|----------|
| `npm install` fails | Delete `node_modules` and `package-lock.json`, then retry |
| Port 3000 in use | Run `set PORT=3001 && npm start` (Windows) or `PORT=3001 npm start` (Mac/Linux) |
| Blank screen | Check browser console for errors, ensure all dependencies installed |

### Backend Issues

| Problem | Solution |
|---------|----------|
| `uvicorn` not found | Run `pip install uvicorn` |
| Port 8000 in use | Use `uvicorn main:app --port 8001` and update `API_BASE_URL` in `submit.js` |
| CORS errors | Backend includes CORS middleware; ensure it's running |

### Connection Issues

| Problem | Solution |
|---------|----------|
| "Failed to analyze pipeline" | Ensure backend is running at `http://localhost:8000` |
| Network error | Check if both frontend and backend are running |

---

## 📁 Project Structure

```
frontend_technical_assessment/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   └── BaseNode/     # Core node abstraction
│   │   ├── nodes/            # Individual node types
│   │   ├── App.js            # Main app
│   │   ├── ui.js             # React Flow canvas
│   │   ├── toolbar.js        # Node toolbar
│   │   ├── submit.js         # Backend integration
│   │   ├── store.js          # State management
│   │   └── index.css         # Global styles
│   ├── public/               # Static assets
│   └── package.json          # Dependencies
│
├── backend/                  # FastAPI server
│   └── main.py               # API endpoints & DAG detection
│
├── README.md                 # Project documentation
└── RUN_BOOK.md              # This file
```

---

## 🧪 Testing Checklist

Use this checklist to verify all features work:

- [ ] Frontend starts without errors
- [ ] Backend starts without errors
- [ ] Can drag nodes onto canvas
- [ ] Can connect nodes with edges
- [ ] Can edit node fields
- [ ] Text node resizes with content
- [ ] Text node creates handles for `{{variables}}`
- [ ] Submit button shows loading state
- [ ] Modal displays results after submission
- [ ] Empty pipeline shows 0 nodes, 0 edges, is_dag: true

---

## 📞 Contact

For any issues with running the assessment:
- Email: shivanshtripathi1357@gmail.com

---

## 📄 License

This project was created as part of the VectorShift Frontend Technical Assessment.
