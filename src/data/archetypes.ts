import {
  makeSparkline,
  makeScatter,
  makeHeatmap,
  makeLeaderboard,
  makeAppBreakdown,
  makeActivityTable,
  makeProjectTable,
  makeMilestones,
  makeCategoryChanges,
  makeWorkloadBalance,
  projectsWorked,
  taskStatus,
  membersData,
  topProfitable,
  leastProfitable,
  topCostDrivers,
  profitLoss,
  budgetTrend,
  categories,
  categoryAllocation,
  appsAffectingFocus,
  utilizationGauge,
  workTimeClassification,
  dailyFocus,
  employeeWorking,
  avgActivityDay,
  activityByMode,
  startEndByLocation,
  clientMargin,
  pipelineForecast,
} from "./dummy";
import type { Archetype as _A } from "@/types";
export type { Archetype } from "@/types";

/**
 * Archetype = a template dashboard payload. Each carries only the widgets that
 * are relevant to that role's decisions — operational detail lives where the
 * owner of that decision works (apps → IT, attendance/wellbeing → People, etc).
 * The grid never knows about roles; it renders whatever descriptors it's handed.
 */

const scatter = makeScatter();
const heatmap = makeHeatmap();
const activityTable = makeActivityTable();
const projectTable = makeProjectTable();
const milestones = makeMilestones();
const categoryChanges = makeCategoryChanges();
const workloadBalance = makeWorkloadBalance();

const timeAllocation = [
  { label: "Engineering", deep: 24, meetings: 11, comms: 6, admin: 3 },
  { label: "Design", deep: 22, meetings: 7, comms: 8, admin: 4 },
  { label: "Product", deep: 14, meetings: 16, comms: 9, admin: 5 },
  { label: "Sales", deep: 10, meetings: 9, comms: 18, admin: 6 },
  { label: "Support", deep: 12, meetings: 5, comms: 21, admin: 4 },
].map((r) => ({
  label: r.label,
  segments: [
    { key: "Deep Work", value: r.deep, color: "#0ea5e9" },
    { key: "Meetings", value: r.meetings, color: "#8b5cf6" },
    { key: "Comms", value: r.comms, color: "#c4b5fd" },
    { key: "Admin", value: r.admin, color: "#374151" },
  ],
}));

export const ARCHETYPES: _A[] = [
  /* ------------------------------- Executive ---------------------------- */
  {
    id: "ceo",
    label: "Executive",
    role: "Executive Overview",
    description: "Company-wide health, capacity, and cost of time.",
    icon: "Crown",
    visibility: "public",
    owner: "Vinove Design",
    templateId: "ceo",
    insights: [
      {
        id: "ceo-i1",
        severity: "warn",
        title: "Meeting load is climbing",
        body: "Engineering has spent 40% more time in meetings this sprint. Suggest reviewing recurring syncs to protect maker time.",
        metricRef: "Meeting Hours",
        action: "Open working-hours report",
        reportKey: "working-hours",
      },
      {
        id: "ceo-i2",
        severity: "bad",
        title: "1,402 tasks are overdue",
        body: "Overdue tasks rose 12% week-over-week, concentrated in three projects. Clearing the top 20 items would cut the backlog by a third.",
        metricRef: "Task Status",
        action: "Open tasks report",
        reportKey: "tasks",
      },
    ],
    kpis: [
      { id: "k-effective", label: "Effective Time", value: "43h 29m", delta: 8, deltaLabel: "+8% vs yesterday", deltaPolarity: "up-good", health: "good", sparkline: makeSparkline(14, 70, 6), reportKey: "working-hours", icon: "Clock" },
      { id: "k-productivity", label: "Avg Productivity", value: "22%", delta: 4, deltaLabel: "+4% vs yesterday", deltaPolarity: "up-good", health: "warn", sparkline: makeSparkline(14, 40, 8), reportKey: "productivity", icon: "Gauge" },
      { id: "k-projects", label: "Total Projects", value: "101", delta: 3, deltaLabel: "+3 this week", deltaPolarity: "up-good", health: "good", sparkline: makeSparkline(14, 60, 4), reportKey: "projects", icon: "FolderKanban" },
      { id: "k-overdue", label: "Overdue Tasks", value: "1,402", delta: 12, deltaLabel: "+12% vs last week", deltaPolarity: "up-bad", health: "bad", sparkline: makeSparkline(14, 45, 9), reportKey: "tasks", icon: "AlertTriangle" },
    ],
    widgets: [
      { id: "w-working", type: "statGroup", size: "half-short", layer: 1, title: "Avg Working Hrs", reportKey: "working-hours", payload: { columns: 2, stats: [ { label: "Effective Time", value: "43h 29m", sub: "355.58 Yesterday", delta: "+8%", health: "good", accent: "#0ea5e9" }, { label: "Production Time", value: "9h 49m", sub: "83.26 Yesterday", delta: "+4%", health: "good", accent: "#10b981" } ] } },
      { id: "w-prod", type: "statGroup", size: "half-short", layer: 1, title: "Avg Productivity", reportKey: "productivity", payload: { columns: 4, stats: [ { label: "Productivity", value: "22%", delta: "+4%", health: "warn" }, { label: "Activity", value: "39%", delta: "+6%", health: "warn" }, { label: "Idle", value: "6%", delta: "+1%", health: "warn" }, { label: "Away", value: "0%", delta: "flat", health: "good" } ] } },
      { id: "w-pl-stat", type: "statGroup", size: "half-short", layer: 1, title: "Projects Profit & Loss", reportKey: "projects", payload: { columns: 3, stats: [ { label: "Profit / Loss", value: "₹37K", sub: "Profit", health: "good" }, { label: "Hrs Usage", value: "350", sub: "Budgeted 650" }, { label: "Margin %", value: "47.5%", health: "good" } ] } },
      { id: "w-invoice-stat", type: "statGroup", size: "half-short", layer: 1, title: "Invoice Status", reportKey: "invoices", payload: { columns: 3, stats: [ { label: "Paid", value: "₹35K", sub: "123 invoices", health: "good" }, { label: "Pending", value: "₹1.5K", sub: "Invoiced ₹57K", health: "warn" }, { label: "Overdue", value: "₹20K", sub: "of ₹57K", health: "bad" } ] } },
      { id: "w-utilization", type: "gauge", size: "half", layer: 2, title: "Utilization", reportKey: "utilization", payload: utilizationGauge },
      { id: "w-classification", type: "segmentBar", size: "half", layer: 2, title: "Work Time Classification", reportKey: "productivity", payload: workTimeClassification },
      { id: "w-projects-worked", type: "donut", size: "half", layer: 2, title: "Projects Worked", reportKey: "projects", payload: { slices: projectsWorked, centerValue: "101", centerLabel: "Total Projects" } },
      { id: "w-task-status", type: "donut", size: "half", layer: 2, title: "Task Status", reportKey: "tasks", payload: { slices: taskStatus, centerValue: "20,653", centerLabel: "Total Tasks" } },
      { id: "w-top-profit", type: "barList", size: "half", layer: 2, title: "Top Profitable Projects", subtitle: "Project profit (₹M)", reportKey: "projects", payload: { items: topProfitable, unit: "₹M" } },
      { id: "w-least-profit", type: "barList", size: "half", layer: 2, title: "Least Profitable Projects", subtitle: "Project loss (₹M)", reportKey: "projects", payload: { items: leastProfitable, unit: "₹M", diverging: true } },
      { id: "w-pl", type: "lineChart", size: "half", layer: 2, title: "Profit & Loss", subtitle: "Quarterly", reportKey: "invoices", payload: profitLoss },
      { id: "w-budget", type: "barChart", size: "half", layer: 2, title: "Budget Trend", subtitle: "Quarterly", reportKey: "budget", payload: budgetTrend },
      { id: "w-milestones", type: "miniTable", size: "half", layer: 2, title: "Upcoming Milestones", reportKey: "projects", payload: milestones },
      { id: "w-members", type: "members", size: "half", layer: 2, title: "Members", reportKey: "members", payload: membersData },
      { id: "w-table", type: "dataTable", size: "full-tall", layer: 3, title: "Workforce Ledger", subtitle: "Itemized activity across every tracked member", reportKey: "working-hours", payload: activityTable },
    ],
  },

  /* ------------------------------- Executive-2 ---------------------------- */
  {
    id: "executive-2",
    label: "Executive 2",
    role: "CEO Overview",
    description: "Company-wide headline metrics, utilization, and pipeline forecast.",
    icon: "Crown",
    visibility: "public",
    owner: "Vinove Design",
    templateId: "executive-2",
    insights: [
      {
        id: "ceo2-i1",
        severity: "warn",
        title: "Utilization under target",
        body: "Utilization dropped to 72% this week, lowering margins. We have spare capacity to accelerate the pipeline.",
        metricRef: "Utilization Rate",
        action: "View capacity report",
        reportKey: "utilization",
      }
    ],
    kpis: [
      { id: "k-revenue", label: "Revenue YTD", value: "₹42M", delta: 12, deltaLabel: "+12% vs last year", deltaPolarity: "up-good", health: "good", sparkline: makeSparkline(14, 80, 5), reportKey: "revenue", icon: "IndianRupee" },
      { id: "k-profit", label: "Profitability", value: "24.5%", delta: 2.1, deltaLabel: "+2.1% vs target", deltaPolarity: "up-good", health: "good", sparkline: makeSparkline(14, 24, 2), reportKey: "profit", icon: "TrendingUp" },
      { id: "k-utilization", label: "Utilization Rate", value: "72%", delta: -4, deltaLabel: "-4% vs target", deltaPolarity: "up-bad", health: "warn", sparkline: makeSparkline(14, 72, 4), reportKey: "utilization", icon: "Gauge" },
      { id: "k-bench", label: "Resource Bench", value: "14%", delta: -2, deltaLabel: "Available capacity", deltaPolarity: "up-bad", health: "good", sparkline: makeSparkline(14, 14, 3), reportKey: "bench", icon: "Users" },
    ],
    widgets: [
      { id: "w-capacity-demand", type: "gauge", size: "half-short", layer: 1, title: "Capacity vs Demand", reportKey: "capacity", payload: { value: 7.2, max: 10, centerValue: "72%", centerLabel: "Demand Met", caption: "Available capacity", target: "Target 85%" } },
      { id: "w-pipeline", type: "gauge", size: "half-short", layer: 1, title: "Pipeline Forecast", reportKey: "pipeline", payload: pipelineForecast },
      
      { id: "w-utilization-pie", type: "donut", size: "half", layer: 2, title: "Utilization Split", reportKey: "utilization", payload: { slices: [{ key: "Billable", value: 72, color: "#10b981" }, { key: "Non-Billable", value: 14, color: "#f59e0b" }, { key: "Bench", value: 14, color: "#374151" }], centerValue: "100%", centerLabel: "Total Capacity" } },
      { id: "w-client-margin", type: "barList", size: "half", layer: 2, title: "Project Margin by Client", reportKey: "margin", payload: { items: clientMargin, unit: "%" } },
      
      { id: "w-prod-trend", type: "lineChart", size: "half", layer: 3, title: "Productivity Trend", subtitle: "Monthly", reportKey: "productivity", payload: profitLoss },
      { id: "w-budget", type: "barChart", size: "half", layer: 3, title: "Budget Trend", subtitle: "Quarterly", reportKey: "budget", payload: budgetTrend },
      
      { id: "w-members", type: "members", size: "half", layer: 3, title: "Team Members (103)", reportKey: "members", payload: membersData },
      { id: "w-projects-worked", type: "donut", size: "half", layer: 3, title: "Projects Worked (1,402)", reportKey: "projects", payload: { slices: projectsWorked, centerValue: "1,402", centerLabel: "Total Projects" } },
      { id: "w-table", type: "dataTable", size: "full-tall", layer: 3, title: "Detailed Workforce Ledger", subtitle: "Itemized activity across every tracked member", reportKey: "working-hours", payload: activityTable },
    ],
  },

  /* -------------------------------- IT ---------------------------------- */
  {
    id: "it",
    label: "IT / SecOps",
    role: "IT & Security",
    description: "App usage, shadow IT, and device compliance.",
    icon: "ShieldCheck",
    visibility: "private",
    owner: "Vinove Design",
    templateId: "it",
    insights: [
      { id: "it-i1", severity: "bad", title: "Unsanctioned app detected", body: "14 members logged 62h on unapproved file-sharing tools this week. Suggest reviewing access policy and DLP rules.", metricRef: "Shadow IT", action: "Open apps report", reportKey: "apps" },
      { id: "it-i2", severity: "warn", title: "Idle license spend", body: "23 Figma seats and 11 Jira seats saw zero activity in 30 days — roughly ₹1.9K/mo in reclaimable spend.", metricRef: "License Waste", action: "Open technology report", reportKey: "technology" },
    ],
    kpis: [
      { id: "k-apps", label: "Apps Tracked", value: "312", delta: 5, deltaLabel: "+14 vs last week", deltaPolarity: "neutral", health: "good", sparkline: makeSparkline(14, 55, 5), reportKey: "technology", icon: "AppWindow" },
      { id: "k-shadow", label: "Shadow IT", value: "9 apps", delta: 28, deltaLabel: "+2 vs last week", deltaPolarity: "up-bad", health: "bad", sparkline: makeSparkline(14, 30, 10), reportKey: "apps", icon: "AlertTriangle" },
      { id: "k-licenses", label: "Idle Licenses", value: "34", delta: -8, deltaLabel: "-3 vs last week", deltaPolarity: "up-good", health: "warn", sparkline: makeSparkline(14, 45, 7), reportKey: "apps", icon: "KeyRound" },
      { id: "k-compliance", label: "Device Compliance", value: "96%", delta: 1, deltaLabel: "+1% vs last week", deltaPolarity: "up-good", health: "good", sparkline: makeSparkline(14, 92, 3), reportKey: "members", icon: "Laptop" },
    ],
    widgets: [
      { id: "w-cat-alloc", type: "donut", size: "half", layer: 2, title: "Category Allocation", subtitle: "Technology usage by category", reportKey: "technology", payload: { slices: categoryAllocation, centerValue: "28", centerLabel: "Categories" } },
      { id: "w-focus", type: "barList", size: "half", layer: 2, title: "Apps & URLs Affecting Focus", subtitle: "Allocation % · sized by attention shifts", reportKey: "apps", payload: { items: appsAffectingFocus, unit: "Allocation%", bubbles: true, bubbleLegend: "Attention shifts" } },
      { id: "w-apps-prod", type: "appBreakdown", size: "third", layer: 2, title: "Productive Apps/URLs", reportKey: "apps", payload: makeAppBreakdown("Productive") },
      { id: "w-apps-neutral", type: "appBreakdown", size: "third", layer: 2, title: "Neutral Apps/URLs", reportKey: "apps", payload: makeAppBreakdown("Neutral") },
      { id: "w-apps-unprod", type: "appBreakdown", size: "third", layer: 2, title: "Unproductive Apps/URLs", reportKey: "apps", payload: makeAppBreakdown("Distracting") },
      { id: "w-categories", type: "categoriesBar", size: "full-short", layer: 2, title: "Categories", subtitle: "Apps & URLs", reportKey: "apps", payload: categories },
      { id: "w-policy", type: "donut", size: "half", layer: 2, title: "Policy Split", reportKey: "apps", payload: { slices: [ { key: "Productive", value: 64, color: "#0ea5e9" }, { key: "Neutral", value: 27, color: "#8b5cf6" }, { key: "Distracting", value: 9, color: "#374151" } ], centerValue: "312", centerLabel: "Apps" } },
      { id: "w-members", type: "members", size: "half", layer: 2, title: "Devices & Presence", reportKey: "members", payload: membersData },
      { id: "w-heatmap", type: "heatmap", size: "half", layer: 2, title: "Login Activity", subtitle: "Access intensity by day and hour", reportKey: "members", payload: heatmap },
      { id: "w-changes", type: "miniTable", size: "half", layer: 2, title: "Changes in Category Usage", reportKey: "technology", payload: categoryChanges },
      { id: "w-table", type: "dataTable", size: "full-tall", layer: 3, title: "Usage & License Ledger", subtitle: "Per-member application and device detail", reportKey: "apps", payload: activityTable },
    ],
  },

  /* -------------------------------- PMO --------------------------------- */
  {
    id: "pmo",
    label: "PMO",
    role: "Project Management Office",
    description: "Delivery health, budget burn, and blockers.",
    icon: "KanbanSquare",
    visibility: "private",
    owner: "Vinove Design",
    templateId: "pmo",
    insights: [
      { id: "pmo-i1", severity: "bad", title: "2 projects trending late", body: "VC_Angello and MATCT are burning budget faster than progress. Suggest a scope review this week.", metricRef: "At-Risk Projects", action: "Open projects report", reportKey: "projects" },
      { id: "pmo-i2", severity: "warn", title: "Cost drivers rising", body: "QA & testing cost is up 18% this quarter — outpacing headcount. Review the per-project cost breakdown.", metricRef: "Cost Drivers", action: "Open cost drivers report", reportKey: "cost-drivers" },
    ],
    kpis: [
      { id: "k-ontrack", label: "On-Track Projects", value: "7 / 10", delta: -10, deltaLabel: "-1 vs last week", deltaPolarity: "up-good", health: "warn", sparkline: makeSparkline(14, 72, 6), reportKey: "projects", icon: "Target" },
      { id: "k-burn", label: "Avg Budget Burn", value: "78%", delta: 9, deltaLabel: "+9% vs last week", deltaPolarity: "up-bad", health: "warn", sparkline: makeSparkline(14, 66, 6), reportKey: "budget", icon: "Flame" },
      { id: "k-velocity", label: "Sprint Velocity", value: "213 pts", delta: 7, deltaLabel: "+14 pts vs last sprint", deltaPolarity: "up-good", health: "good", sparkline: makeSparkline(14, 60, 8), reportKey: "projects", icon: "Gauge" },
      { id: "k-blockers", label: "Open Blockers", value: "18", delta: 20, deltaLabel: "+3 vs last week", deltaPolarity: "up-bad", health: "bad", sparkline: makeSparkline(14, 40, 9), reportKey: "tasks", icon: "Ban" },
    ],
    widgets: [
      { id: "w-status", type: "donut", size: "half", layer: 2, title: "Delivery Status", reportKey: "projects", payload: { slices: [ { key: "On Track", value: 70, color: "#10b981" }, { key: "At Risk", value: 20, color: "#f59e0b" }, { key: "Delayed", value: 10, color: "#ef4444" } ], centerValue: "10", centerLabel: "Projects" } },
      { id: "w-budget", type: "barChart", size: "half", layer: 2, title: "Budget Trend", subtitle: "Quarterly", reportKey: "budget", payload: budgetTrend },
      { id: "w-top-profit", type: "barList", size: "half", layer: 2, title: "Top Profitable Projects", reportKey: "projects", payload: { items: topProfitable, unit: "₹M" } },
      { id: "w-cost", type: "barList", size: "half", layer: 2, title: "Top Cost Drivers", subtitle: "Spend by function (₹K)", reportKey: "cost-drivers", payload: { items: topCostDrivers, unit: "₹K" } },
      { id: "w-scatter", type: "scatter", size: "half", layer: 2, title: "Velocity vs. Capacity", subtitle: "Hours tracked against throughput", reportKey: "projects", payload: scatter },
      { id: "w-stacked", type: "stackedBar", size: "half", layer: 2, title: "Effort Allocation by Team", reportKey: "projects", payload: timeAllocation },
      { id: "w-milestones", type: "miniTable", size: "half", layer: 2, title: "Upcoming Milestones", reportKey: "projects", payload: milestones },
      { id: "w-leader", type: "leaderboard", size: "half", layer: 2, title: "Top Contributors", reportKey: "projects", payload: makeLeaderboard("pts") },
      { id: "w-table", type: "dataTable", size: "full-tall", layer: 3, title: "Project Delivery Ledger", subtitle: "Status, burn, and blockers across the portfolio", reportKey: "projects", payload: projectTable },
    ],
  },

  /* --------------------------------- HR --------------------------------- */
  {
    id: "hr",
    label: "People / HR",
    role: "People & Wellbeing",
    description: "Wellbeing, burnout risk, and work-life balance.",
    icon: "HeartPulse",
    visibility: "private",
    owner: "Vinove Design",
    templateId: "hr",
    insights: [
      { id: "hr-i1", severity: "bad", title: "Burnout risk rising", body: "9 members logged >50h with after-hours activity 4+ nights this week. Suggest a wellbeing check-in with their managers.", metricRef: "Burnout Risk", action: "Open wellbeing report", reportKey: "wellbeing" },
      { id: "hr-i2", severity: "warn", title: "Developer team overutilized", body: "Developers are overutilized on 89% of days with the fewest breaks. Review the workload balance before it turns into attrition.", metricRef: "Workload", action: "Open workload report", reportKey: "workload" },
    ],
    kpis: [
      { id: "k-wellbeing", label: "Wellbeing Index", value: "74", delta: 3, deltaLabel: "+3 pts vs last week", deltaPolarity: "up-good", health: "good", sparkline: makeSparkline(14, 70, 4), reportKey: "wellbeing", icon: "HeartPulse" },
      { id: "k-overtime", label: "After-Hours Work", value: "11.4h", delta: 18, deltaLabel: "+18% vs last week", deltaPolarity: "up-bad", health: "bad", sparkline: makeSparkline(14, 40, 8), reportKey: "wellbeing", icon: "MoonStar" },
      { id: "k-breaks", label: "Avg Break Time", value: "52 min", delta: 11, deltaLabel: "+11% vs last week", deltaPolarity: "up-good", health: "good", sparkline: makeSparkline(14, 48, 5), reportKey: "workload", icon: "Coffee" },
      { id: "k-risk", label: "Burnout Risk", value: "9 people", delta: 50, deltaLabel: "+3 vs last week", deltaPolarity: "up-bad", health: "bad", sparkline: makeSparkline(14, 35, 9), reportKey: "wellbeing", icon: "AlertTriangle" },
    ],
    widgets: [
      { id: "w-emp", type: "statGroup", size: "half-short", layer: 1, title: "Employee Working", reportKey: "working-hours", payload: employeeWorking },
      { id: "w-activity", type: "statGroup", size: "half-short", layer: 1, title: "Avg Activity / Day", reportKey: "productivity", payload: avgActivityDay },
      { id: "w-balance", type: "donut", size: "half", layer: 2, title: "Balance Split", reportKey: "wellbeing", payload: { slices: [ { key: "Healthy", value: 68, color: "#10b981" }, { key: "Watch", value: 24, color: "#f59e0b" }, { key: "At Risk", value: 8, color: "#ef4444" } ], centerValue: "45", centerLabel: "Members" } },
      { id: "w-focus", type: "progressRing", size: "half", layer: 2, title: "Daily Focus", reportKey: "wellbeing", payload: dailyFocus },
      { id: "w-scatter", type: "scatter", size: "half", layer: 2, title: "Load vs. Wellbeing", subtitle: "Hours worked against wellbeing score", reportKey: "wellbeing", payload: scatter },
      { id: "w-heatmap", type: "heatmap", size: "half", layer: 2, title: "When People Work", subtitle: "Watch the after-hours tail", reportKey: "wellbeing", payload: heatmap },
      { id: "w-mode", type: "progressBars", size: "half", layer: 2, title: "Avg Activity by Working Mode", reportKey: "workload", payload: activityByMode },
      { id: "w-startend", type: "rangeBar", size: "half", layer: 2, title: "Avg Start & End of Day by Location", reportKey: "workload", payload: startEndByLocation },
      { id: "w-workload", type: "miniTable", size: "half", layer: 2, title: "Workload Balance", reportKey: "workload", payload: workloadBalance },
      { id: "w-members", type: "members", size: "half", layer: 2, title: "Presence & Devices", reportKey: "members", payload: membersData },
      { id: "w-table", type: "dataTable", size: "full-tall", layer: 3, title: "Wellbeing Ledger", subtitle: "Hours, after-hours, and balance signals per member", reportKey: "wellbeing", payload: activityTable },
    ],
  },
];

export const ARCHETYPE_MAP = Object.fromEntries(ARCHETYPES.map((a) => [a.id, a])) as Record<string, _A>;
