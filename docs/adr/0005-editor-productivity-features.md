# ADR 0005: Add editor productivity features (palette, templates, inspector)

Status: Accepted (2026-02-14)

## Context

To make the submission feel like a product (not just a canvas), we want fast discovery, quick actions, and strong feedback loops.

## Decision

Add:
- Command palette (`Ctrl/Cmd+K`) for actions and node insertion
- Starter templates for realistic demo flows
- Saved templates and "copy pipeline JSON" to support demos
- Inspector panel for selection debugging (copy JSON, duplicate, delete)
- Non-blocking toasts and last-run pill for run feedback

## Consequences

Positive:
- Much easier to demo and evaluate quickly.
- Signals strong UX/editor ergonomics.

Tradeoffs:
- Extra UI beyond assignment requirements (kept lightweight and local-only).
