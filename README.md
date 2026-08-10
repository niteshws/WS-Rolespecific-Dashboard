# Workstatus · Work Intelligence

A high-fidelity, working prototype of the **Work Intelligence** dashboard for the
Workstatus platform. Built with React + TypeScript + Vite + Tailwind CSS and
hand-rolled shadcn/ui-style primitives.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## What to try

- **Switch dashboards** in the sidebar (or the toolbar switcher) under
  **Intelligence → Dashboards** (Executive / IT / PMO / People). The Executive
  view mirrors the production Workstatus dashboard; the whole grid re-renders
  from a different config payload — same components, different data.
- **Drill down to the report.** Click any Layer 1 KPI card, any widget's
  **View report →**, or an insight's action link. A Layer-3 slide-over opens
  with a narrative, summary stats, a Layer-2 recap chart, and the dense
  itemized table (sort / filter / export CSV).
- **Edit the layout.** Hit **Edit** to reorder (▲▼), resize (grow/shrink), or
  hide/show any widget. Changes persist to that dashboard for the session.
- **Create / Duplicate / Delete** dashboards from a role template.
- **Share** a dashboard — toggle **Private / Public** and copy the link.

## Architecture

```
src/
├─ types.ts                  # widget/archetype schema (the modular contract)
├─ data/
│  ├─ dummy.ts               # deterministic realistic data + generators
│  └─ archetypes.ts          # per-role dashboard payloads (CEO/IT/PMO/HR)
├─ components/
│  ├─ layout/                # Sidebar (Intelligence IA) + Topbar
│  ├─ dashboard/
│  │  ├─ DashboardView.tsx   # owns the 3-layer disclosure state
│  │  ├─ BentoGrid.tsx       # responsive aspect-ratio grid wrapper
│  │  ├─ WidgetRenderer.tsx  # descriptor.type → component (dynamic render)
│  │  ├─ KpiCard.tsx         # Layer 1
│  │  ├─ InsightBanner.tsx   # data storytelling
│  │  └─ DataTable.tsx       # Layer 3 report
│  ├─ charts/                # Layer 2 SVG charts (scatter/heatmap/…)
│  └─ ui/                    # shadcn-style primitives
```

### The modular contract

An **archetype** resolves to `{ insights, kpis, widgets }`. Each widget is a
`WidgetDescriptor { type, size, layer, payload }`. `BentoGrid` places it by
`size`; `WidgetRenderer` maps `type` → component. Adding a widget type is one
`case` + one schema entry — the grid never changes.

## Design system

| Token            | Value     | Use                                  |
| ---------------- | --------- | ------------------------------------ |
| Primary          | `#5d2bff` | CTAs, active states, deep-work data  |
| Ink              | `#110302` | Base dark surfaces / primary text    |
| Muted            | `#374151` | Structural borders, secondary text   |
| Health · good    | `#10b981` | Emerald — data health only           |
| Health · warn    | `#f59e0b` | Amber — data health only             |
| Health · bad     | `#ef4444` | Red — data health only               |

- **Type:** Inter (self-hosted via `@fontsource/inter`).
- **Geometry:** strict 4px radius (`rounded`), 8px base spacing grid.
- **A11y:** semantic landmarks, ARIA roles/labels, keyboard-focusable KPIs and
  controls, visible focus rings.

> Prototype only — all data is synthetic and generated deterministically.
