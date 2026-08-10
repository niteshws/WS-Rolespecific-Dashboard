# Workstatus Intelligence Dashboard — Developer Reference Guide

> A comprehensive, combined document covering **every dashboard view**, **widget**, **KPI**, and **data calculation** used in the prototype. This guide serves as a reference for developers picking up features from this prototype for production.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Dashboard Views](#dashboard-views)
   - [My Dashboard](#1-my-dashboard)
   - [Executive Overview](#2-executive-overview)
   - [IT & Security](#3-it--security)
   - [Project Management Office (PMO)](#4-project-management-office-pmo)
   - [People & Wellbeing (HR)](#5-people--wellbeing-hr)
3. [Widget Type Reference](#widget-type-reference)
4. [KPI Calculation Guide](#kpi-calculation-guide)
5. [Data Flow & Filtering](#data-flow--filtering)
6. [Plan Gating (Lower Plan)](#plan-gating-lower-plan)
7. [Color System](#color-system)
8. [Individual Member View](#individual-member-view)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  App.tsx                                                │
│  ├── Sidebar.tsx          (nav + dashboard links)       │
│  ├── Topbar.tsx           (breadcrumb + notifications)  │
│  └── DashboardView.tsx    (header + KPIs + BentoGrid)   │
│       ├── KpiCard.tsx     (Layer 1 — The Glance)        │
│       ├── BentoGrid.tsx   (Layout engine)               │
│       │    └── WidgetRenderer.tsx  (type → component)   │
│       │         └── WidgetShell.tsx (chrome + locked)    │
│       ├── InsightBanner.tsx (AI insights)                │
│       └── ReportDrawer.tsx  (Layer 3 drill-down)        │
└─────────────────────────────────────────────────────────┘
```

### Progressive Disclosure Layers

| Layer | Purpose | Component | Interaction |
|-------|---------|-----------|-------------|
| **1 — The Glance** | Macro KPIs at a glance | `KpiCard` | Click → opens Layer 3 drawer |
| **2 — The Story** | Visual widgets, charts, tables | `BentoGrid` > `WidgetRenderer` | Inline interaction, hover |
| **3 — The Detail** | Full itemized reports | `ReportDrawer` | Slide-out panel |

---

## Dashboard Views

### 1. My Dashboard

> **Path:** Sidebar → "My Dashboard"  
> **ID:** `my-dashboard`  
> **Scope:** Personal — shows only the logged-in user's data

#### KPIs

| KPI | Label | Calculation | Polarity |
|-----|-------|-------------|----------|
| `k-hours` | Hours Today | `SUM(timesheet_entries.duration) WHERE date = TODAY AND user = current_user` | Up = Good |
| `k-activity` | Activity Score | `AVG(activity_samples.mouse + activity_samples.keyboard) / total_samples * 100` over the selected period | Up = Good |
| `k-focus` | Focus Time | `SUM(uninterrupted_sessions >= 25min)` — contiguous productive blocks | Up = Good |
| `k-tasks` | Tasks Due Today | `COUNT(tasks) WHERE due_date = TODAY AND assignee = current_user AND status NOT IN ('done','closed')` | Up = Bad |

#### Widgets

| Widget | Type | Size | Calculation / Data Source |
|--------|------|------|--------------------------|
| My Allocation | `myAllocation` | third | **Over Allocated**: `SUM(assigned_hours) / capacity * 100` when > 100%. **Healthy**: capacity usage 70-100%. **Under Utilised**: capacity usage < 70%. Progress bar = healthy %. |
| Peak Focus Hours | `peakFocus` | third | Bar chart: For each hour 8AM–7PM, calculate `AVG(activity_score)` across all samples in that hour window. Peak = hour with highest activity. |
| Leave Balance | `leaveBalance` | third | Ring charts: `used / total` per leave policy category. Categories: Casual Leave, Default Policy, Privileged Leave. Source: HR/Leave system API. |
| My Workday at a Glance | `MyDashboardBanner` | full (banner) | Timeline strip: Contiguous blocks from timesheet entries. Color codes: Teal = work, Amber = break, Striped = idle, Blue = meetings, Pink = task switching. Remaining = unfilled target. |
| Intelligence Insights | `InsightBanner` | full (banner) | AI-generated from anomaly detection on user's data. Source: background analytics engine. |
| Recent Screenshots | `screenshots` | half | Last 9 desktop screenshots (3×3 grid). Source: agent-captured screenshots ordered by `captured_at DESC LIMIT 9`. |
| Recent Tasks | `recentTasks` | half | `SELECT task, project, status, priority, logged FROM tasks WHERE assignee = current_user ORDER BY updated_at DESC LIMIT 5` |
| Total Tasks | `donut` | half | Donut: `GROUP BY status` — Not Started, Active, Done, Closed. Center value = total count. |
| Apps & URLs Affecting Focus | `barList` | half | `SELECT app_name, SUM(duration) as allocation_pct, COUNT(context_switches) as attention_shifts FROM app_usage WHERE user = current_user GROUP BY app_name ORDER BY attention_shifts DESC` |
| Productive/Neutral/Unproductive Apps | `appBreakdown` | third each | `SELECT app_name, SUM(duration) FROM app_usage WHERE category = 'Productive'|'Neutral'|'Distracting' AND user = current_user GROUP BY app_name ORDER BY duration DESC` |
| Categories | `categoriesBar` | full-short | Stacked horizontal bar: `SELECT category, SUM(duration) FROM app_usage WHERE user = current_user GROUP BY category` |
| Login Activity | `heatmap` | half | Day × hour heatmap: `SELECT day_of_week, hour_of_day, AVG(activity_score) FROM activity_samples WHERE user = current_user GROUP BY day_of_week, hour_of_day` |
| Workload Balance | `miniTable` | half | `SELECT team, overutilized_pct, underutilized_pct, avg_breaks, avg_productive_mins FROM workload_analysis WHERE member = current_user` |
| Recent Timesheets | `dataTable` | full | `SELECT project, task, date, start_time, end_time, duration FROM timesheet_entries WHERE user = current_user ORDER BY date DESC, start_time DESC LIMIT 20` |

---

### 2. Executive Overview

> **Path:** Sidebar → "Executive Overview"  
> **ID:** `ceo`  
> **Scope:** Company-wide — aggregates all members

#### KPIs

| KPI | Label | Calculation | Polarity |
|-----|-------|-------------|----------|
| `k-effective` | Effective Time | `SUM(timesheet_entries.duration) WHERE date IN selected_range` across all org members | Up = Good |
| `k-productivity` | Avg Productivity | `AVG(all_members.activity_score)` — weighted by tracked hours | Up = Good |
| `k-projects` | Total Projects | `COUNT(DISTINCT projects) WHERE status NOT IN ('archived','cancelled')` | Up = Good |
| `k-overdue` | Overdue Tasks | `COUNT(tasks) WHERE due_date < TODAY AND status NOT IN ('done','closed','cancelled')` | Up = Bad |

#### Widgets

| Widget | Type | Size | Calculation |
|--------|------|------|-------------|
| Avg Working Hrs | `statGroup` | half-short | **Effective Time**: `SUM(duration) WHERE date = yesterday`. **Production Time**: `SUM(duration) WHERE activity_score >= 60`. Delta vs yesterday. |
| Avg Productivity | `statGroup` | half-short | **Productivity**: `AVG(productive_duration / total_duration) * 100`. **Activity**: mouse+keyboard active %. **Idle**: idle sample %. **Away**: no-input %. |
| Projects Profit & Loss | `statGroup` | half-short | **P/L**: `SUM(revenue) - SUM(cost)`. **Hrs Usage**: `SUM(logged_hours)` vs `budget_hours`. **Margin**: `profit / revenue * 100`. |
| Invoice Status | `statGroup` | half-short | `GROUP BY invoice_status` — Paid, Pending, Overdue amounts. |
| Utilization | `gauge` | half | `AVG(worked_hours) / target_hours`. Gauge color: ≥75% green, ≥50% sky blue, ≥30% amber, <30% red. |
| Work Time Classification | `segmentBar` | half | `SUM(core_work_duration)` vs `SUM(non_core)` vs `SUM(neutral)` as percentages of total tracked time. |
| Projects Worked | `donut` | half | `GROUP BY project_status`: Yet to Start, In Progress, On Hold, Complete, Cancelled, Archived. |
| Task Status | `donut` | half | `GROUP BY task_status`: Due Tomorrow, Overdue, Yet to Start, Archived, Triage, Cancelled. |
| Most Tracked / Least Tracked | `barList` | half each | Top/bottom 5 members by `SUM(tracked_hours)` in selected range. |
| Attendance Overview | `miniTable` | half | `SELECT member, team, first_clock_in, breaks_count, late_flag FROM attendance WHERE date IN range` |
| Activity Heatmap | `heatmap` | half | `SELECT day_of_week, hour, AVG(activity_score) FROM activity GROUP BY day_of_week, hour` — org-wide. |
| Members (Presence) | `members` | half | **Online**: `COUNT(members) WHERE last_heartbeat > NOW() - 5min`. Donut: online/offline. Device breakdown by OS. |
| Working Hours Leaderboard | `leaderboard` | half | `SELECT member, SUM(duration) FROM timesheets GROUP BY member ORDER BY SUM DESC LIMIT 8` |
| Recent Timesheets | `miniTable` | half | `SELECT member, project, date, start, stop, duration FROM timesheets ORDER BY date DESC LIMIT 10` |
| Activity Ledger | `dataTable` | full-tall | Full member-level table with tracked, active, idle, productivity %, focus, meetings, top app, WoW delta. |

---

### 3. IT & Security

> **Path:** Sidebar → "IT & Security"  
> **ID:** `it`  
> **Scope:** Organization-wide app/URL usage and security posture

#### KPIs

| KPI | Label | Calculation | Polarity |
|-----|-------|-------------|----------|
| `k-apps` | Active Apps | `COUNT(DISTINCT apps) WHERE last_used > NOW() - 30d` | Neutral |
| `k-prodScore` | Productivity Score | `AVG(productive_app_time / total_app_time) * 100` | Up = Good |
| `k-shadow` | Shadow IT Risk | `COUNT(DISTINCT apps) WHERE policy = 'unclassified' AND usage_hours > threshold` | Up = Bad |
| `k-license` | License Waste | `SUM(license_cost) WHERE app.last_used < NOW() - 60d` / total license cost * 100 | Up = Bad |

#### Widgets

| Widget | Type | Size | Calculation |
|--------|------|------|-------------|
| Category Allocation | `donut` | half | `SELECT category, SUM(duration) FROM app_usage GROUP BY category` — Development, Collaborative, CRM, etc. |
| Apps & URLs Affecting Focus | `barList` | half | `SELECT app, SUM(duration) as alloc, COUNT(context_switches) as shifts FROM app_usage GROUP BY app ORDER BY shifts DESC` |
| Productive/Neutral/Unproductive | `appBreakdown` | third each | `SELECT app, SUM(duration) FROM app_usage WHERE policy_category = X GROUP BY app ORDER BY duration DESC` |
| Categories | `categoriesBar` | full-short | Stacked bar: `SELECT category, COUNT(apps) FROM app_usage GROUP BY category` |
| Policy Split | `donut` | half | `SELECT policy_category, COUNT(DISTINCT apps) FROM app_usage GROUP BY policy_category` — Productive/Neutral/Distracting. |
| Devices & Presence | `members` | half | Device + presence data (same as Executive). |
| Login Activity | `heatmap` | half | Same heatmap calculation, org-wide. |
| Changes in Category Usage | `miniTable` | half | `SELECT category, (this_period_pct - last_period_pct) as change, allocation_pct, total_hrs, user_count FROM category_trends` |
| Usage & License Ledger | `dataTable` | full-tall | Per-member per-app usage detail with role, tracked hours, active hours, productivity %, top app, etc. |

---

### 4. Project Management Office (PMO)

> **Path:** Sidebar → "Project Management Office"  
> **ID:** `pmo`  
> **Scope:** Portfolio-level delivery health, budget, blockers

#### KPIs

| KPI | Label | Calculation | Polarity |
|-----|-------|-------------|----------|
| `k-ontrack` | On-Track Projects | `COUNT(projects WHERE health = 'on_track') / COUNT(projects) * 100` or X/Y format | Up = Good |
| `k-burn` | Avg Budget Burn | `AVG(projects.spent / projects.budget) * 100` | Up = Bad |
| `k-velocity` | Sprint Velocity | `SUM(story_points_completed) WHERE sprint = current_sprint` | Up = Good |
| `k-blockers` | Open Blockers | `COUNT(tasks WHERE type = 'blocker' AND status = 'open')` | Up = Bad |

#### Widgets

| Widget | Type | Size | Calculation |
|--------|------|------|-------------|
| Delivery Status | `donut` | half | `SELECT status, COUNT(*) FROM projects GROUP BY status` — On Track, At Risk, Delayed. |
| Budget Trend | `barChart` | half | Quarterly bar chart: `SELECT quarter, SUM(budgeted), SUM(invoiced) FROM project_finance GROUP BY quarter` with trend line. |
| Top Profitable Projects | `barList` | half | `SELECT project, (revenue - cost) as profit FROM projects ORDER BY profit DESC LIMIT 5` |
| Top Cost Drivers | `barList` | half | `SELECT function_area, SUM(cost) FROM project_costs GROUP BY function_area ORDER BY cost DESC` |
| Velocity vs. Capacity | `scatter` | half | `SELECT member, tracked_hours as x, story_points as y FROM sprint_data` — bubble size = team size. |
| Effort Allocation by Team | `stackedBar` | half | `SELECT team, deep_work_hrs, meeting_hrs, comms_hrs, admin_hrs FROM time_classification GROUP BY team` |
| Upcoming Milestones | `miniTable` | half | `SELECT milestone, project, progress FROM milestones WHERE due_date > TODAY ORDER BY due_date LIMIT 5` |
| Top Contributors | `leaderboard` | half | `SELECT member, SUM(story_points) FROM sprint_completions GROUP BY member ORDER BY SUM DESC LIMIT 8` |
| Project Delivery Ledger | `dataTable` | full-tall | `SELECT project, lead, status, progress, budget_used, profit, hours, open_tasks, blockers, due FROM projects` |

---

### 5. People & Wellbeing (HR)

> **Path:** Sidebar → "People & Wellbeing"  
> **ID:** `hr`  
> **Scope:** Organization-wide wellbeing, burnout risk, work-life balance

#### KPIs

| KPI | Label | Calculation | Polarity |
|-----|-------|-------------|----------|
| `k-wellbeing` | Wellbeing Index | Composite score: `0.3 * work_life_balance + 0.3 * break_regularity + 0.2 * overtime_inverse + 0.2 * focus_quality` normalized to 0–100 | Up = Good |
| `k-overtime` | After-Hours Work | `SUM(duration) WHERE hour NOT IN (work_schedule)` per week | Up = Bad |
| `k-breaks` | Avg Break Time | `AVG(break_duration_minutes) WHERE date IN range` | Up = Good |
| `k-risk` | Burnout Risk | `COUNT(members) WHERE weekly_hours > 50 AND after_hours_nights >= 4` | Up = Bad |

#### Widgets

| Widget | Type | Size | Calculation |
|--------|------|------|-------------|
| Employee Working | `statGroup` | half-short | **Working**: `COUNT(members WHERE status = 'active')`. **On Remote**: `COUNT WHERE location = 'remote'`. **On Leave**: `COUNT WHERE on_leave = true`. |
| Avg Activity / Day | `statGroup` | half-short | **Mouse**: `AVG(mouse_events_per_hour)`. **Keyboard**: `AVG(keystrokes_per_hour)`. **Average**: combined. Source: activity sampling agent. |
| Balance Split | `donut` | half | Members grouped by wellbeing index: ≥70 = Healthy, 50–69 = Watch, <50 = At Risk. |
| Daily Focus | `progressRing` | half | `current_focus_time / target_focus_time * 100`. Stats: total focus time, session count, avg session duration. |
| Load vs. Wellbeing | `scatter` | half | X = tracked hours, Y = wellbeing index. Bubble size = team size. One point per member. |
| When People Work | `heatmap` | half | Same heatmap, org-wide. Highlights after-hours activity patterns. |
| Avg Activity by Working Mode | `progressBars` | half | `SELECT mode, AVG(activity_score) FROM activity WHERE mode IN ('office','remote','hybrid') GROUP BY mode` |
| Avg Start & End by Location | `rangeBar` | half | `SELECT location, AVG(first_activity_hour), AVG(last_activity_hour) FROM daily_activity GROUP BY location` |
| Workload Balance | `miniTable` | half | `SELECT team, overutilized_pct, underutilized_pct, avg_breaks, avg_productive_mins FROM workload_analysis GROUP BY team` |
| Presence & Devices | `members` | half | Same as Executive. |
| Wellbeing Ledger | `dataTable` | full-tall | Full member table with tracked, active, idle, productivity, focus, meetings, top app, WoW delta, health indicator. |

---

## Widget Type Reference

All available widget types and their rendering component:

| Type Key | Component | Description | Payload Type |
|----------|-----------|-------------|--------------|
| `statGroup` | `StatGroup` | Grid of stat cards with label/value/delta | `StatGroupPayload` |
| `donut` | `Donut` | Donut chart with center value | `DonutPayload` |
| `barList` | `BarList` | Horizontal bar list with optional bubbles | `BarListPayload` |
| `barChart` / `lineChart` | `AxisChart` | Bar or line chart on X/Y axes | `AxisChartPayload` |
| `heatmap` | `Heatmap` | Day × Hour intensity grid | `HeatCell[]` |
| `scatter` | `ScatterChart` | Bubble scatter plot | `ScatterPoint[]` |
| `stackedBar` | `StackedBar` | 100% stacked horizontal bars | `StackedDatum[]` |
| `leaderboard` | `Leaderboard` | Ranked member list | `LeaderRow[]` |
| `appBreakdown` | `AppBreakdown` | App usage bars by category | `AppRow[]` |
| `categoriesBar` | `CategoriesBar` | Stacked category bar with legend | `CategoriesPayload` |
| `gauge` | `Gauge` | Semi-circle gauge with needle | `GaugePayload` |
| `progressRing` | `ProgressRing` | Circular progress with stats | `ProgressRingPayload` |
| `rangeBar` | `RangeBar` | Horizontal range indicator bars | `RangeBarPayload` |
| `progressBars` | `ProgressBars` | Labeled progress bars | `ProgressBarsPayload` |
| `segmentBar` | `SegmentBar` | 100% stacked classification bar | `SegmentBarPayload` |
| `miniTable` | `MiniTable` | Compact sortable table | `DataTablePayload` |
| `dataTable` | `DataTable` | Full-width scrollable table | `DataTablePayload` |
| `members` | `MembersWidget` | Presence donut + device chips | `MembersPayload` |
| `timeline` | `TimelineWidget` | Activity timeline with color blocks | *(built-in data)* |
| `screenshots` | `ScreenshotsWidget` | 3×3 screenshot grid | *(built-in data)* |
| `recentTasks` | `RecentTasksWidget` | Recent tasks list | *(built-in data)* |
| `leaveBalance` | `LeaveBalanceWidget` | Leave category ring charts | *(built-in data)* |
| `myAllocation` | `MyAllocationWidget` | Allocation stat boxes + bar | *(built-in data)* |
| `peakFocus` | `PeakFocusWidget` | Vertical hourly focus bar chart | *(built-in data)* |
| `personalAllocation` | `PersonalAllocationWidget` | Personal app usage bars | *(built-in data)* |
| `actionItems` | `MyActionItemsWidget` | Action items checklist | *(built-in data)* |

---

## KPI Calculation Guide

### Sparkline Generation

Each KPI includes a sparkline (mini trend line). In production:

```sql
SELECT DATE(created_at) as day, <metric_value>
FROM <metric_source>
WHERE date BETWEEN (TODAY - 14d) AND TODAY
GROUP BY day
ORDER BY day ASC
```

The sparkline renders the last 14 data points as an SVG area chart.

### Delta Calculation

```
delta_percent = ((current_value - comparison_value) / comparison_value) * 100
```

Comparison periods:
- **Today** → compares to yesterday
- **This week** → compares to last week
- **This month** → compares to last month

### Health Indicators

| Level | Condition | Color |
|-------|-----------|-------|
| `good` | Metric meets or exceeds target | `#10b981` (emerald) |
| `warn` | Metric is below target but not critical | `#f59e0b` (amber) |
| `bad` | Metric is critically below target | `#ef4444` (red) |

---

## Data Flow & Filtering

### Date Range Filter

The date range selector (Today / This Week / This Month / Custom) filters all data across:
- KPI values and sparklines
- Widget payloads
- Activity timeline segments
- Table queries

### Member/Team Filter

Available on all dashboard views except "My Dashboard":

| Filter Mode | Behavior |
|------------|----------|
| **All Members** | Show aggregated org/team data |
| **Team: X** | Filter all widgets to `WHERE team = X` |
| **Member: Y** | Show individual member data; hide irrelevant team-level widgets; show individual-specific widgets (timeline, screenshots, recent tasks, recent timesheets) |

### Individual Member View

When a specific member is selected:
- **Hidden widgets**: Team-level aggregations (scatter, stacked bar, members presence)
- **Shown widgets**: Timeline, screenshots, recent tasks, recent timesheets, activity breakdown
- **Updated widgets**: All stat/chart widgets filter to that member's data only

---

## Plan Gating (Lower Plan)

When `plan = "lower"`, specific widgets show a blurred overlay with an "Upgrade now" CTA.

### Locked Widget Types

| Widget Type/ID | Reason |
|----------------|--------|
| `timeline` | Activity timeline is premium |
| `screenshots` | Screenshot capture requires agent |
| `heatmap` | Login heatmap is advanced analytics |
| `peakFocus` | Peak focus analysis is premium |
| `leaderboard` | Ranking features are premium |
| `progressRing` | Focus ring analytics is premium |
| `w-milestones` | Milestone tracking is premium |
| `w-workload` | Workload balance is premium |
| `w-utilization` | Utilization gauge is premium |
| `w-budget` | Budget trend is premium |
| `w-scatter` | Scatter analysis is premium |

### Implementation

The `WidgetShell` component accepts a `locked` boolean prop. When `true`:
- Content renders normally behind a `backdrop-blur-[3px]` overlay
- A centered card appears with lock icon, "Upgrade Plan" title, description, and CTA button
- The overlay uses `bg-card/65` for semi-transparency

The plan state is toggled via the "✦ Pro Plan / ⚡ Lower Plan" button in the dashboard header.

---

## Color System

### Data Visualization Colors (Non-CTA)

| Purpose | Color | Hex |
|---------|-------|-----|
| Primary data | Sky Blue | `#0ea5e9` |
| Secondary data | Teal | `#0d9488` |
| Tertiary data | Purple | `#a259ff` |
| Neutral/Structural | Gray | `#374151` |
| Light accent | Lavender | `#c4b5fd` |

### Semantic Colors

| Meaning | Color | Hex |
|---------|-------|-----|
| Good/Positive | Emerald | `#10b981` |
| Warning | Amber | `#f59e0b` |
| Bad/Negative | Red | `#ef4444` |

### CTA-Only Color

| Purpose | Color | Hex |
|---------|-------|-----|
| Buttons, links, primary actions | Indigo | `#5d2bff` |

> **Rule:** `#5d2bff` (indigo/primary) is reserved **exclusively for CTA elements** (buttons, links, interactive controls). All chart/graph/progress elements use the data visualization palette above.

---

## File Reference

| File | Purpose |
|------|---------|
| [types.ts](file:///d:/WS_Dashboard/src/types.ts) | All TypeScript interfaces and union types |
| [archetypes.ts](file:///d:/WS_Dashboard/src/data/archetypes.ts) | Dashboard view definitions (CEO, IT, PMO, HR) |
| [myDashboard.ts](file:///d:/WS_Dashboard/src/data/myDashboard.ts) | Personal "My Dashboard" definition |
| [dummy.ts](file:///d:/WS_Dashboard/src/data/dummy.ts) | Dummy data generators and static datasets |
| [DashboardView.tsx](file:///d:/WS_Dashboard/src/components/dashboard/DashboardView.tsx) | Main dashboard renderer with header + actions |
| [BentoGrid.tsx](file:///d:/WS_Dashboard/src/components/dashboard/BentoGrid.tsx) | CSS grid layout engine for widgets |
| [WidgetRenderer.tsx](file:///d:/WS_Dashboard/src/components/dashboard/WidgetRenderer.tsx) | Widget type → component mapper |
| [WidgetShell.tsx](file:///d:/WS_Dashboard/src/components/dashboard/WidgetShell.tsx) | Widget chrome, header, edit controls, lock overlay |
| [KpiCard.tsx](file:///d:/WS_Dashboard/src/components/dashboard/KpiCard.tsx) | Layer 1 KPI card with sparkline |
| [ReportDrawer.tsx](file:///d:/WS_Dashboard/src/components/dashboard/ReportDrawer.tsx) | Layer 3 slide-out detailed report |
