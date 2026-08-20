/**
 * Core type system for the Work Intelligence dashboard.
 *
 * The dashboard is fully data-driven: a Dashboard (derived from a role
 * archetype) resolves to a list of widget descriptors. <WidgetRenderer /> maps
 * each descriptor `type` onto a concrete component and <BentoGrid /> places it
 * by `size`. Every KPI and widget can point at a Layer-3 `reportKey`, which the
 * <ReportDrawer /> resolves into a detailed, itemized report.
 */

export type HealthLevel = "good" | "warn" | "bad";

/** 12-column bento sizes. Each maps to a column span + a fixed row height. */
export type WidgetSize =
  | "quarter" // 3 / 12
  | "third" // 4 / 12
  | "third-short" // 4 / 12, short band
  | "half-short" // 6 / 12, short band (stat clusters)
  | "half" // 6 / 12
  | "half-tall" // 6 / 12, taller
  | "two-third" // 8 / 12
  | "full" // 12 / 12
  | "full-tall" // 12 / 12, taller
  | "full-short"; // 12 / 12, shorter

export type WidgetType =
  | "statGroup"
  | "scatter"
  | "heatmap"
  | "stackedBar"
  | "donut"
  | "members"
  | "leaderboard"
  | "appBreakdown"
  | "barList"
  | "lineChart"
  | "barChart"
  | "categoriesBar"
  | "miniTable"
  | "gauge"
  | "progressRing"
  | "rangeBar"
  | "progressBars"
  | "segmentBar"
  | "dataTable"
  | "timeline"
  | "screenshots"
  | "recentTasks"
  | "leaveBalance"
  | "personalAllocation"
  | "actionItems"
  | "myAllocation"
  | "peakFocus";

/** Layer 1 (Macro) — a single glanceable KPI. */
export interface KpiSpec {
  id: string;
  label: string;
  value: string;
  unit?: string;
  delta: number; // signed percentage
  deltaLabel: string;
  deltaPolarity: "up-good" | "up-bad" | "neutral";
  health: HealthLevel;
  sparkline: number[];
  /** Layer-3 report this KPI drills into. */
  reportKey?: string;
  icon?: string;
}

/** A natural-language insight surfaced in the banner rail. */
export interface Insight {
  id: string;
  severity: HealthLevel;
  title: string;
  body: string;
  metricRef?: string;
  action?: string;
  reportKey?: string;
}

/** Generic descriptor the renderer resolves into a component. */
export interface WidgetDescriptor {
  id: string;
  type: WidgetType;
  size: WidgetSize;
  title: string;
  subtitle?: string;
  payload?: unknown;
  layer: 1 | 2 | 3;
  /** Layer-3 report this widget drills into via its header action. */
  reportKey?: string;
  /** Runtime edit state (set while editing a dashboard). */
  hidden?: boolean;
}

/** A saved dashboard the user can view, edit, and share. */
export interface Dashboard {
  id: string;
  name?: string;
  role: string;
  label?: string;
  description: string;
  icon: string;
  visibility: "private" | "public" | "shared";
  sharedRoles?: string[];
  owner: string;
  templateId: string;
  insights: Insight[];
  kpis: KpiSpec[];
  widgets: WidgetDescriptor[];
}

/** A template dashboard payload (same shape as a saved Dashboard). */
export type Archetype = Dashboard & { id: string; label: string };

/* ----------------------------- Widget payloads ---------------------------- */

export interface StatItem {
  label: string;
  value: string;
  sub?: string;
  delta?: string;
  health?: HealthLevel;
  accent?: string;
}
export interface StatGroupPayload {
  stats: StatItem[];
  columns?: number;
}

export interface ScatterPoint {
  id: string;
  name: string;
  x: number;
  y: number;
  size: number;
  health: HealthLevel;
  team: string;
}

export interface HeatCell {
  day: string;
  hour: number;
  value: number;
}

export interface StackedDatum {
  label: string;
  segments: { key: string; value: number; color: string }[];
}

export interface DonutSlice {
  key: string;
  value: number;
  color: string;
}
export interface DonutPayload {
  slices: DonutSlice[];
  centerValue?: string;
  centerLabel?: string;
}

export interface MembersPayload {
  total: number;
  online: number;
  offline: number;
  devices: { name: string; count: number }[];
}

export interface LeaderRow {
  id: string;
  name: string;
  team: string;
  metric: number;
  unit: string;
  health: HealthLevel;
}

export interface AppRow {
  app: string;
  category: "Productive" | "Neutral" | "Distracting";
  hours: number;
  color: string;
}

export interface BarListItem {
  label: string;
  value: number;
  color?: string;
  sub?: string;
  /** Optional trailing bubble (e.g. attention shifts / activity count). */
  bubble?: number;
}
export interface BarListPayload {
  items: BarListItem[];
  unit?: string;
  diverging?: boolean;
  /** Render a sized trailing bubble per item. */
  bubbles?: boolean;
  bubbleLegend?: string;
}

export interface GaugePayload {
  value: number; // 0..max
  max: number;
  centerValue: string;
  centerLabel?: string;
  caption?: string;
  target?: string;
}

export interface ProgressRingPayload {
  percent: number;
  stats: { label: string; value: string }[];
}

export interface RangeRow {
  label: string;
  start: number; // hour 0..24
  end: number;
  color?: string;
}
export interface RangeBarPayload {
  rows: RangeRow[];
  axisStart?: number; // default 0
  axisEnd?: number; // default 24
}

export interface ProgressBarRow {
  label: string;
  percent: number;
  value: string;
  color?: string;
}
export interface ProgressBarsPayload {
  rows: ProgressBarRow[];
}

export interface SegmentBarPayload {
  headline?: { value: string; label: string };
  segments: { key: string; value: number; color: string }[];
  showAxis?: boolean;
}

export interface Series {
  key: string;
  color: string;
  data: number[];
  kind?: "bar" | "line";
  dashed?: boolean;
}
export interface AxisChartPayload {
  xLabels: string[];
  series: Series[];
  unit?: string;
}

export interface CategoriesPayload {
  segments: { key: string; value: number; color: string }[];
  moreCount?: number;
}

export interface TableColumn {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  pinned?: boolean;
  render?: "text" | "health" | "hours" | "delta" | "avatar" | "bar" | "money" | "status";
  width?: number;
}

export interface TableRow {
  [key: string]: string | number;
}

export interface DataTablePayload {
  columns: TableColumn[];
  rows: TableRow[];
}

/* ------------------------------- Reports (L3) ----------------------------- */

export interface ReportStat {
  label: string;
  value: string;
  delta?: string;
  health?: HealthLevel;
}

export interface ReportSpec {
  key: string;
  title: string;
  subtitle?: string;
  narrative: string;
  severity?: HealthLevel;
  stats: ReportStat[];
  chart?: { type: WidgetType; title: string; payload: unknown };
  table: DataTablePayload;
}
