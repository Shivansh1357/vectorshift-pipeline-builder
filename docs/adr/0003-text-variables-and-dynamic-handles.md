# ADR 0003: Detect `{{variables}}` and generate dynamic handles

Status: Accepted (2026-02-14)

## Context

The Text node needs two improvements:
- auto-size with content
- detect `{{variableName}}` and create input handles on the left

## Decision

In `TextNode`:
- Parse variables using a regex for valid JS identifiers.
- Deduplicate and sort variable names for stable ordering.
- Store dynamic handle definitions in `node.data.dynamicHandles`.

In `BaseNode`:
- Render dynamic handles + labels on the left based on `data.dynamicHandles`.

## Consequences

Positive:
- Mirrors real "template prompt" behavior in visual pipeline tools.
- Gives a concrete demonstration of dynamic node behavior.

Tradeoffs:
- The parser is intentionally simple and does not attempt full template-language support.
