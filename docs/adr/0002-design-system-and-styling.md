# ADR 0002: CSS variables design system + consistent dark theme

Status: Accepted (2026-02-14)

## Context

The assessment asks for unified styling and maintainable UI design. Adding ad-hoc CSS across components becomes inconsistent quickly.

## Decision

Use a small design system in `frontend/src/index.css`:
- CSS custom properties (colors, spacing, radius, shadows)
- consistent component classes for toolbar, nodes, modal, toasts
- subtle motion via Framer Motion where appropriate

## Consequences

Positive:
- Easier to maintain and iterate on visuals.
- App looks cohesive and product-like.

Tradeoffs:
- Requires discipline to keep new UI using existing tokens.

