# VectorShift Frontend Technical Assessment

A modern, feature-rich pipeline builder built with React and React Flow, featuring a custom node abstraction system, dynamic variable handling, and backend integration for DAG validation.

![Pipeline Builder](https://img.shields.io/badge/React-18.2.0-blue) ![React Flow](https://img.shields.io/badge/ReactFlow-11.8.3-green) ![FastAPI](https://img.shields.io/badge/FastAPI-Backend-orange)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- npm or yarn

### Installation & Running

```bash
# 1. Install frontend dependencies
cd frontend
npm install

# 2. Start the frontend (runs on port 3000)
npm start

# 3. In a new terminal, start the backend
cd backend
pip install fastapi uvicorn pydantic
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The app will be available at `http://localhost:3000`

## ✨ Features Implemented

### Part 1: Node Abstraction
- **BaseNode Component**: Reusable abstraction for all nodes with consistent styling
- **5 New Node Types**:
  - 🔍 **Filter Node**: Data transformation with multiple filter types
  - 🌐 **API Node**: HTTP request configuration (GET, POST, PUT, PATCH, DELETE)
  - 🔀 **Condition Node**: Conditional branching with true/false outputs
  - 🔗 **Merge Node**: Combine multiple data streams with various strategies
  - 📌 **Note Node**: Documentation/comments with color customization

### Part 2: Styling
- **Dark Theme**: Professional dark UI inspired by modern dev tools
- **Glassmorphism Effects**: Subtle transparency and blur effects
- **Lucide Icons**: Professional SVG icons throughout (no emojis)
- **CSS Design System**: Custom properties for consistent theming
- **Smooth Animations**: Framer Motion for node interactions
- **Responsive Layout**: Toolbar and canvas adapt to screen size

### Part 3: Text Node Logic
- **Dynamic Sizing**: Width/height automatically adjusts based on content
- **Variable Detection**: Parses `{{variableName}}` syntax in real-time
- **Dynamic Handles**: Creates input handles for each detected variable
- **Visual Feedback**: Shows variable count and names below textarea

### Part 4: Backend Integration
- **Pipeline Submission**: Sends nodes/edges to FastAPI backend
- **DAG Validation**: Uses Kahn's algorithm to detect cycles
- **Result Modal**: User-friendly display of analysis results
- **Error Handling**: Graceful handling of network/server errors

## 🏗️ Architecture

```
frontend/
├── src/
│   ├── components/
│   │   └── BaseNode/          # Core node abstraction
│   │       ├── BaseNode.js    # Main component with handle rendering
│   │       ├── BaseNode.css   # Node styling system
│   │       └── index.js       # Exports
│   ├── nodes/                 # Individual node implementations
│   │   ├── inputNode.js       # Pipeline input
│   │   ├── outputNode.js      # Pipeline output
│   │   ├── llmNode.js         # LLM processing
│   │   ├── textNode.js        # Text with variables
│   │   ├── filterNode.js      # Data filtering
│   │   ├── conditionNode.js   # Conditional branching
│   │   ├── mergeNode.js       # Data merging
│   │   ├── apiNode.js         # API requests
│   │   └── noteNode.js        # Documentation
│   ├── App.js                 # Main app component
│   ├── ui.js                  # React Flow canvas
│   ├── toolbar.js             # Node selection toolbar
│   ├── submit.js              # Backend integration
│   ├── store.js               # Zustand state management
│   └── index.css              # Global styles & design system
│
backend/
└── main.py                    # FastAPI server with DAG detection
```

## 🎨 Design Decisions

### Why BaseNode Abstraction?
- **Single Source of Truth**: All nodes share consistent structure
- **Rapid Development**: New nodes require only a config object
- **Maintainability**: Style changes propagate to all nodes
- **Extensibility**: Easy to add new field types

### Why Kahn's Algorithm for DAG Detection?
- **Efficiency**: O(V + E) time complexity
- **Simplicity**: Easy to understand and maintain
- **Reliability**: Proven algorithm for topological sorting

### Why Lucide Icons?
- **Professional**: SVG icons look crisp at any size
- **Consistent**: Same design language as shadcn/ui
- **Lightweight**: Tree-shakable, only includes used icons

## 📦 Dependencies

### Frontend
- `react` & `react-dom` - UI framework
- `reactflow` - Node-based editor
- `zustand` - State management
- `framer-motion` - Animations
- `lucide-react` - Icons
- `@emotion/react` & `@emotion/styled` - CSS-in-JS

### Backend
- `fastapi` - Modern Python web framework
- `uvicorn` - ASGI server
- `pydantic` - Data validation

## 🧪 Testing the Application

1. **Drag nodes** from the toolbar onto the canvas
2. **Connect nodes** by dragging from output handles to input handles
3. **Configure nodes** using the input fields
4. **Test Text Node variables**: Type `Hello {{name}}, welcome to {{city}}!`
5. **Submit pipeline**: Click "Submit Pipeline" to validate

## 📝 Author

Shivansh Tripathi - Frontend Technical Assessment for VectorShift
