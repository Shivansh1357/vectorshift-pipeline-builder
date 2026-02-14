# ADR 0001: BaseNode abstraction for all node types

Status: Accepted (2026-02-14)

## Context

The starter project contains multiple node components with repeated structure (header, handles, fields, styling). Duplicating code makes it harder to add new nodes consistently.

## Decision

Create a `BaseNode` component that:
- renders a consistent node shell (header + content)
- renders handles from a config object
- provides shared field components (text/select/textarea/display)
- supports dynamic handles via `data.dynamicHandles` for Text variables

Each node becomes a small file that mostly defines configuration and binds UI fields into `node.data`.

## Consequences

Positive:
- New nodes are fast to build and consistent in appearance.
- Styling changes can be applied in one place.

Tradeoffs:
- Some per-node customization still lives in node components (by design).

