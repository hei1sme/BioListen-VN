---
name: Tactical Cyber Forest
colors:
  background: "#090d0b"
  foreground: "#e2e8f0"
  primary: "#00ff8f"
  primary-dark: "#059669"
  accent-green: "#10b981"
  alert-crimson: "#f43f5e"
  warning-amber: "#f59e0b"
  border-deep: "#16221c"
  border-light: "#253b30"
  panel-bg: "#0c1310"
  surface-hover: "#14201a"
typography:
  headline: { fontFamily: var(--font-sans), fontSize: 24px, fontWeight: 700 }
  monospace: { fontFamily: var(--font-mono), fontSize: 12px }
rounded:
  xs: 0px
  sm: 2px
  md: 4px
---

# Tactical Cyber Forest Design Specification

## Overview
A technical, high-density dark mode theme optimized for forest ranger operations and biodiversity surveillance. The design mimics a ranger command center tactical console with sharp geometric cards, thin digital dividers, grid background grids, and vibrant neon status overlays.

## Colors
- **Background (#090d0b):** Dark ink forest black to minimize glare during night operations.
- **Primary (#00ff8f):** Active telemetry lights, cursor focus, and status success tags.
- **Border Deep (#16221c) & Border Light (#253b30):** Thin, sharp container boundaries replacing standard grey lines.
- **Alert Crimson (#f43f5e):** Reserved exclusively for active threat alarms (e.g. chainsaw and gunshot detection).
- **Warning Amber (#f59e0b):** Used for weather interference warnings or low-confidence telemetry.

## Shapes
- **Corner Radii:** Extremely sharp. Standard radius is 2px (`rounded-sm`), with 0px for grids and full-pill exclusively for interactive trigger states. Avoids friendly, rounded SaaS cards (the 8px-12px "safe zone").

## Do's and Don'ts
- **Do** wrap charts, lists, and maps in crisp border panels with monospace coordinate counters in their margins.
- **Don't** use purple, violet, indigo, or mesh-gradient slop.
- **Do** implement tactile push scales (`active:scale-[0.98]`) for buttons.
- **Don't** allow two CTAs on the page with identical intent.
