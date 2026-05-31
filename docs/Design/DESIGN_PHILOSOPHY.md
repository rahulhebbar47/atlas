# DESIGN_PHILOSOPHY.md — ATLAS Visual Design System

## Design Identity

ATLAS is a serious analytical tool that must look like it belongs in a Bloomberg terminal, a professional briefing room, AND a modern design portfolio. The aesthetic is **"intelligence infrastructure"** — clean, dense with information, but never cluttered. Think: the visual language of the best data journalism (NYT, FT, The Pudding) meets institutional credibility.

This is NOT a generic dashboard. This is NOT Bootstrap. This is NOT "purple gradients on white."

---

## Core Aesthetic Principles

### 1. Dark Mode Primary, Light Mode Secondary
- Default: deep navy/charcoal background (#04070D void, #080D18 deep, #0C1424 surface)
- Data elements glow against dark backgrounds — this is how Bloomberg, trading terminals, and mission-critical dashboards work
- Light mode available as toggle for presentations/printing
- Dark doesn't mean black — use rich, deep blues and slate grays with subtle depth

### 2. Typography
- **Display / Headers**: Instrument Serif — a distinctive serif face for titles and section headers. NOT Inter, NOT Roboto, NOT Arial.
- **Data / Numbers**: JetBrains Mono for all numerical displays and monospace content. Numbers must align in columns.
- **Body Text**: DM Sans — clean, readable sans-serif with good x-height.
- **Hierarchy**: 4 levels max. Title → Section → Label → Caption. Enforce with size and weight, not color.

### 3. Color System

**Primary Palette — Capability Vectors:**
Each AI capability vector gets a distinct, vibrant color that persists across all views:
- Generative AI (language, code, creative, scientific): Electric Blue (#3B82F6)
- Agentic AI (multi-step workflows, decisions): Amber (#F59E0B)
- Embodied AI (robotics, autonomous vehicles): Red/Coral (#EF4444)

**Status Colors:**
- Growth / Positive: Green (#22C55E)
- Decline / Warning: Orange (#F97316)
- Critical / Tipping Point: Red (#EF4444)
- Neutral / Baseline: Gray (#6B7280)

**Surface Colors (Dark Mode):**
- Void (base background): #04070D
- Deep: #080D18
- Surface: #0C1424
- Elevated: #111D33
- Card/Panel: #13203A
- Text Primary: #E8ECF4
- Text Secondary: #8A96AD

### 4. Data Visualization Principles

- **Every chart tells one story.** If a chart needs a paragraph of explanation, it's the wrong chart.
- **Annotate key transitions directly on charts.** When welfare metrics cross critical thresholds, the chart should visually highlight the change — vertical line, color change, annotation.
- **Use small multiples** for comparing across occupation clusters rather than cramming 38 lines on one chart.
- **Sparklines** for secondary metrics in data tables.
- **Interactive tooltips** with full context — hover on any data point to see the full computation chain.
- **Time is always the x-axis** for the primary views. The user is always asking "what happens when?"

### 5. Layout — Three-Panel Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  ATLAS     [Navigation Tabs]              [Settings] [Theme]│
├──────────────┬───────────────────────────┬──────────────────┤
│              │                           │                  │
│  CONTROLS    │   MAIN VISUALIZATION      │  INSIGHTS /      │
│              │                           │  POLICY PANEL    │
│  • Capability│   • Employment over time  │                  │
│    sliders   │   • GDP trajectory        │  • CWI tracker   │
│  • BFCS      │   • Occupation breakdown  │  • Tipping point │
│    thresholds│   • Wage distribution     │  • Policy levers │
│  • Timeline  │                           │  • Key metrics   │
│    controls  │                           │                  │
│              │                           │                  │
│  Collapsible │   Responsive, zoomable    │  Collapsible     │
│  ~280px      │   Flexible center         │  ~320px          │
│              │                           │                  │
└──────────────┴───────────────────────────┴──────────────────┘
```

### 6. Animation & Interaction

- **Slider manipulation → instant chart update.** No lag, no loading spinners for model computation.
- **Smooth transitions** when data changes — curves should animate between states, not jump.
- **Hover states** reveal detail without cluttering the default view.
- **Zoom and pan** on all time-series charts.
- **Scrub timeline** — a master time scrubber that lets you see the state of all metrics at any point.
- **Transitions**: Use Framer Motion with `duration: 0.3s` for panel transitions, `duration: 0.15s` for micro-interactions.

### 7. Presentation Mode

A dedicated mode for presenting to others:
- Hides control panels
- Full-screen visualization with step-through narrative
- Key metrics displayed as large, prominent cards
- Suitable for projecting in a briefing room
- Export to PNG/SVG for slides

### 8. Responsive Considerations

- Primary target: desktop (1440px+). This is a professional tool.
- Tablet: Stack panels vertically, controls collapse to bottom sheet
- Mobile: Read-only summary view with key metrics and simplified charts
- No mobile editing of model parameters — too many controls

---

## Component Design Language

### Cards
- Subtle border (1px border, border-color from surface palette)
- No box-shadows (too generic) — use border + slight background elevation
- 16px border-radius (not too round, not too sharp)
- 24px internal padding

### Sliders
- Custom-styled, not browser default
- Show current value prominently
- Show the range min/max
- Color-coded to match capability vector or metric
- Snap points for common values (optional)

### Charts
- Clean axes with minimal gridlines (light dotted, low opacity)
- Direct labels on lines rather than legends where possible
- Area fills at 10-15% opacity for context
- Tipping point annotations: vertical dashed red line with label

### Data Tables
- Monospace numbers, right-aligned
- Alternating row backgrounds (very subtle)
- Sortable columns
- Embedded sparklines for trend visualization
- Color-coded cells for status (green/yellow/red bands)

### Buttons
- Minimal — most interaction is through sliders, dropdowns, and direct manipulation
- Primary action: filled, capability-colored
- Secondary: outlined, subtle
- Destructive: red outline, fills on hover

---

## Don'ts

- No card shadows
- No rounded corners > 16px
- No gradient backgrounds on cards
- No icon-heavy navigation (text labels are clearer for analytical tools)
- No skeleton loaders (use subtle pulse animation on empty states)
- No "fun" empty states — this is a serious tool. Empty states should instruct: "Connect to BLS API to load employment data"
- No tooltips as the only way to find important controls
