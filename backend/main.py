"""
VectorShift Backend - Pipeline Analysis API

Architectural Decision (AD-4): Backend Implementation
=====================================================

WHY THIS APPROACH:
1. FastAPI: Modern, fast Python web framework with automatic OpenAPI docs
2. Pydantic: Type-safe request/response validation
3. CORS: Enabled for local development (frontend on port 3000)
4. DAG Detection: Uses Kahn's Algorithm for topological sort

Algorithm Choice - Kahn's Algorithm:
- Time Complexity: O(V + E) where V = nodes, E = edges
- Space Complexity: O(V + E) for adjacency list
- Why Kahn's: Efficiently detects cycles by checking if all nodes can be processed
- A graph is a DAG if and only if topological sort processes all nodes

The endpoint receives nodes and edges from the React Flow frontend,
analyzes the graph structure, and returns:
- num_nodes: Total count of nodes in the pipeline
- num_edges: Total count of edges (connections) in the pipeline  
- is_dag: Boolean indicating if the graph is a valid Directed Acyclic Graph
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from collections import defaultdict, deque


# ============================================
# Pydantic Models for Request/Response
# ============================================

class NodeData(BaseModel):
    """Represents a node in the pipeline"""
    id: str
    type: str
    data: Optional[Dict[str, Any]] = None


class EdgeData(BaseModel):
    """Represents an edge (connection) between nodes"""
    id: str
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None


class PipelineRequest(BaseModel):
    """Request body for pipeline analysis"""
    nodes: List[NodeData]
    edges: List[EdgeData]


class PipelineResponse(BaseModel):
    """Response body with analysis results"""
    num_nodes: int
    num_edges: int
    is_dag: bool


# ============================================
# FastAPI Application Setup
# ============================================

app = FastAPI(
    title="VectorShift Pipeline API",
    description="API for analyzing pipeline configurations",
    version="1.0.0"
)

# Enable CORS for frontend access
# In production, restrict origins to specific domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================
# DAG Detection Algorithm
# ============================================

def is_directed_acyclic_graph(nodes: List[NodeData], edges: List[EdgeData]) -> bool:
    """
    Determines if the given graph is a Directed Acyclic Graph (DAG).
    
    Uses Kahn's Algorithm for topological sorting:
    1. Calculate in-degree for each node
    2. Add all nodes with in-degree 0 to a queue
    3. Process queue: remove node, reduce in-degree of neighbors
    4. If we can process all nodes, it's a DAG
    
    A cycle exists if some nodes can never reach in-degree 0.
    
    Args:
        nodes: List of NodeData objects
        edges: List of EdgeData objects
        
    Returns:
        True if the graph is a DAG, False if it contains cycles
    """
    if len(nodes) == 0:
        return True  # Empty graph is technically a DAG
    
    # Build adjacency list and in-degree count
    adjacency_list: Dict[str, List[str]] = defaultdict(list)
    in_degree: Dict[str, int] = {node.id: 0 for node in nodes}
    
    # Populate adjacency list and in-degrees from edges
    for edge in edges:
        source = edge.source
        target = edge.target
        
        # Add edge to adjacency list
        adjacency_list[source].append(target)
        
        # Increment in-degree of target
        if target in in_degree:
            in_degree[target] += 1
    
    # Initialize queue with nodes that have no incoming edges (in-degree = 0)
    queue = deque([node_id for node_id, degree in in_degree.items() if degree == 0])
    
    # Count of nodes processed
    processed_count = 0
    
    # Process nodes in topological order
    while queue:
        current_node = queue.popleft()
        processed_count += 1
        
        # For each neighbor of current node
        for neighbor in adjacency_list[current_node]:
            if neighbor in in_degree:
                in_degree[neighbor] -= 1
                
                # If neighbor now has no incoming edges, add to queue
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)
    
    # If we processed all nodes, it's a DAG
    # If some nodes remain unprocessed, there's a cycle
    return processed_count == len(nodes)


# ============================================
# API Endpoints
# ============================================

@app.get('/')
def read_root():
    """Health check endpoint"""
    return {'status': 'healthy', 'message': 'VectorShift Pipeline API is running'}


@app.post('/pipelines/parse', response_model=PipelineResponse)
def parse_pipeline(pipeline: PipelineRequest) -> PipelineResponse:
    """
    Analyze a pipeline configuration.
    
    Receives the nodes and edges of a pipeline and returns:
    - Number of nodes
    - Number of edges
    - Whether the pipeline forms a valid DAG
    
    Args:
        pipeline: PipelineRequest containing nodes and edges
        
    Returns:
        PipelineResponse with analysis results
    """
    nodes = pipeline.nodes
    edges = pipeline.edges
    
    # Calculate metrics
    num_nodes = len(nodes)
    num_edges = len(edges)
    is_dag = is_directed_acyclic_graph(nodes, edges)
    
    return PipelineResponse(
        num_nodes=num_nodes,
        num_edges=num_edges,
        is_dag=is_dag
    )


# ============================================
# Additional Utility Endpoints (for debugging)
# ============================================

@app.get('/pipelines/info')
def get_info():
    """Returns API information"""
    return {
        'name': 'VectorShift Pipeline API',
        'version': '1.0.0',
        'endpoints': {
            'POST /pipelines/parse': 'Analyze a pipeline for node count, edge count, and DAG validity'
        }
    }
