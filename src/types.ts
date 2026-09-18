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
  | "peakFocus"
  | "usagePie"
  | "lowActivityMembers"
  | "workloadCapacity"
  | "memberActivityBars"
  | "projectsWorked"
  | "taskTimelineSummary"
  | "budgetTrend"
  | "projectBudgetHealth"
  | "upcomingLeaves";

/** Layer 1 (Macro) — a single glanceable KPI. */
export interface KpiSpec {
  id: string;
  label: string;
  value: string;
  unit?: string;
  delta: number; // signed percentage
  deltaLabel: string;
  deltaPolarity: "up-good" | "up-bad" | "neutral";
  /** Optional non-delta secondary metric (e.g. bench hours under a %). */
  secondaryValue?: string;
  secondaryLabel?: string;
  health: HealthLevel;
  sparkline: number[];
  /** Layer-3 report this KPI drills into. */
  reportKey?: string;
  icon?: string;
  state?: "active" | "coming-soon";
  /** Plain-language help shown in the info tooltip. */
  info?: string;
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
  /** Optional help text shown in an info-icon tooltip next to the title. */
  info?: string;
  payload?: unknown;
  layer: 1 | 2 | 3;
  /** Layer-3 report this widget drills into via its header action. */
  reportKey?: string;
  /** Optional custom label for the header report action. */
  actionLabel?: string;
  /** Optional Lucide icon name shown beside the title. */
  icon?: string;
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

/** Applications / Websites usage donut with durations. */
export interface UsagePieSlice {
  key: string;
  value: number;
  color: string;
  duration: string;
}

export interface UsagePiePayload {
  slices: UsagePieSlice[];
  totalUsage: string;
  filterLabel?: string;
  viewAllLabel?: string;
}

export interface MembersPayload {
  total: number;
  online: number;
  offline: number;
  onLeave: number;
  devices: { name: string; count: number }[];
}

export interface LeaderRow {
  id: string;
  name: string;
  team: string;
  /** Decimal hours used for bar width / ranking. */
  metric: number;
  unit: string;
  health: HealthLevel;
  /** Display label e.g. "15h 0m". Falls back to metric + unit. */
  hoursLabel?: string;
  /** Share of total contribution (0–100). */
  percent?: number;
}

export interface TopContributorsPayload {
  periodLabel: string;
  rows: LeaderRow[];
  insight: string;
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
  /** When set, bar hover shows Activity % and Idle %. */
  idle?: number;
  /** Optional tracked time shown in the Activity/Idle tooltip (e.g. "1h 12m"). */
  time?: string;
}
export interface BarListPayload {
  items: BarListItem[];
  unit?: string;
  diverging?: boolean;
  /** Render a sized trailing bubble per item. */
  bubbles?: boolean;
  bubbleLegend?: string;
  /** Optional footer insight (e.g. Top / Least Profitable). */
  insight?: string;
}

export interface GaugePayload {
  value: number; // 0..max
  max: number;
  centerValue: string;
  centerLabel?: string;
  caption?: string;
  target?: string;
  /** Large metric shown left of the gauge (e.g. "2:06"). */
  headlineValue?: string;
  headlineLabel?: string;
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
  /** Where to show 0/50/100 markers. Default: under each row. */
  scale?: "each" | "shared" | "none";
}

/** Projects Worked — status bars with a side insight panel. */
export interface ProjectsWorkedStatus {
  key: string;
  value: number;
  color: string;
}
export interface ProjectsWorkedPayload {
  statuses: ProjectsWorkedStatus[];
  insight: {
    suggestion: string;
  };
}

/** Task Timeline Summary — created vs completed tasks over months. */
export interface TaskTimelinePoint {
  month: string;
  fullLabel: string;
  created: number;
  completed: number;
}

export interface TaskTimelineSummaryPayload {
  yearLabel: string;
  points: TaskTimelinePoint[];
  totals: {
    created: number;
    createdYoY: number;
    createdPriorYear: number;
    createdAvgPerMonth: number;
    createdHigh: { month: string; value: number };
    createdLow: { month: string; value: number };
    completed: number;
    completedYoY: number;
    completedPriorYear: number;
    completedAvgPerMonth: number;
    completedHigh: { month: string; value: number };
    completedLow: { month: string; value: number };
    completionRate: number;
    completionRateYoY: number;
    completionRatePriorYear: number;
  };
  insights: {
    title: string;
    message: string;
    highlights?: string[];
    icon: "lightbulb" | "target";
  }[];
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
  /** Optional per-point colors (e.g. status bars with unique colors). */
  pointColors?: string[];
}
export interface AxisChartPayload {
  xLabels: string[];
  series: Series[];
  unit?: string;
}

export type BudgetTrendPeriod = "Weekly" | "Monthly" | "Quarterly" | "Yearly";

export interface BudgetTrendPayload {
  defaultPeriod: BudgetTrendPeriod;
  periods: Record<BudgetTrendPeriod, AxisChartPayload>;
}

/** Project Budget Health — donut + utilization + status bands. */
export interface ProjectBudgetHealthBand {
  key: string;
  percentLabel: string;
  projects: number;
  color: string;
  bg: string;
}

export interface ProjectBudgetHealthPayload {
  slices: { key: string; value: number; color: string }[];
  healthPercent: number;
  healthLabel: string;
  healthStatus: string;
  utilization: {
    spentShort: string;
    budgetShort: string;
    percent: number;
    detail: string;
  };
  bands: ProjectBudgetHealthBand[];
  insight: {
    title: string;
    body: string;
  };
}

export type LeaveType = "PTO" | "Sick" | "Casual" | "WFH";

export interface UpcomingLeaveRow {
  id: string;
  name: string;
  department: string;
  leaveType: LeaveType;
  /** Short return label shown in the widget (e.g. "Back Mon", "Today"). */
  returnLabel: string;
  /** Full return date for the detailed report. */
  returnDate: string;
  startDate: string;
  days: number;
}

export interface UpcomingLeavesPayload {
  totalOnLeave: number;
  rows: UpcomingLeaveRow[];
  /** Optional footer insight (matches Top Contributors / Milestones). */
  insight?: string;
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
  render?: "text" | "health" | "hours" | "delta" | "avatar" | "avatarOnly" | "avatarStack" | "bar" | "fractionBar" | "money" | "status" | "timeStatus" | "bandPct" | "dueDate" | "hoverTooltip" | "chipStack";
  width?: number;
}

export interface TableRow {
  [key: string]: string | number;
}

export interface DataTablePayload {
  columns: TableColumn[];
  rows: TableRow[];
  /** Optional footer insight (e.g. Upcoming Milestones). */
  insight?: string;
}

export interface LowActivityMemberRow {
  name: string;
  department: string;
  project: string;
  activity: number;
  idle: string;
}

export interface LowActivityMembersPayload {
  rows: LowActivityMemberRow[];
}

export type WorkloadBand = "Over-allocated" | "Healthy" | "Under-utilized";

export interface WorkloadCapacityRow {
  name: string;
  available: string;
  capacityPct: number;
  billablePct: number;
  band: WorkloadBand;
}

export interface WorkloadCapacityPayload {
  rows: WorkloadCapacityRow[];
}

export interface MemberActivityBarRow {
  name: string;
  /** Primary metric shown on the right and as bar width (0–100). */
  activity: number;
  /** Shown in the bar hover tooltip (0–100). */
  idle: number;
}

export interface MemberActivityBarsPayload {
  rows: MemberActivityBarRow[];
}

/* ------------------------------- Reports (L3) ----------------------------- */

export interface ReportStat {
  label: string;
  value: string;
  delta?: string;
  health?: HealthLevel;
  color?: string;
  /** Plain-language help shown in the info tooltip. */
  info?: string;
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
