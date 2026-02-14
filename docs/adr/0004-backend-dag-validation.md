# ADR 0004: Validate DAG using Kahn's algorithm in the backend

Status: Accepted (2026-02-14)

## Context

The backend must return:
`{ num_nodes: int, num_edges: int, is_dag: bool }`

and detect cycles in the submitted graph.

## Decision

Implement DAG validation using Kahn's algorithm (topological processing):
- Build adjacency list and in-degree counts
- Process all nodes with in-degree 0
- If all nodes are processed, the graph is a DAG; otherwise it contains a cycle

Also defensively ignore edges that reference unknown nodes.

## Consequences

Positive:
- O(V+E) time complexity; simple and reliable.
- Clear link to real execution ordering (topological sort).

Tradeoffs:
- This endpoint validates only structure, not node semantics/execution.
