import type { ReportSpec } from "@/types";
import {
  makeActivityTable,
  makeProjectTable,
  makeInvoiceTable,
  makeTaskTable,
  makeAppUsageTable,
  makeScatter,
  makeWorkedTodayTable,
  makeTodaysActivityTable,
  makeUtilizationTable,
  makeBenchTable,
  makeTrackedLeastHoursTable,
  makeWorkloadCapacityTable,
  makeProductivityTrendTable,
  makeApplicationUsageTable,
  makeWebsiteUsageTable,
  budgetTrend,
  profitLoss,
  workedTodayTrend,
  todaysActivityTrend,
  utilizationTrend,
  benchByTeam,
  trackedLeastHours,
  productivityTrend,
  applicationsUsage,
  websitesUsage,
} from "./dummy";

/**
 * Layer-3 report registry. Any KPI or widget with a `reportKey` resolves here.
 * A report bundles: a narrative, summary stats, an optional context chart
 * (Layer-2 recap), and the dense itemized table (the actual Layer-3 payload).
 */

const activity = makeActivityTable();
const projects = makeProjectTable();
const invoices = makeInvoiceTable();
const tasks = makeTaskTable();
const appUsage = makeAppUsageTable();
const scatter = makeScatter();
const workedToday = makeWorkedTodayTable();
const todaysActivity = makeTodaysActivityTable();
const utilizationRows = makeUtilizationTable();
const benchRows = makeBenchTable();
const trackedLeastTable = makeTrackedLeastHoursTable();
const workloadCapacityTable = makeWorkloadCapacityTable();
const productivityTrendTable = makeProductivityTrendTable();
const applicationUsageTable = makeApplicationUsageTable();
const websiteUsageTable = makeWebsiteUsageTable();

const REPORTS: Record<string, ReportSpec> = {
  "worked-today": {
    key: "worked-today",
    title: "Worked Today — Detailed Report",
    subtitle: "Hours logged across the org so far today",
    severity: "good",
    narrative:
      "Org-wide worked time is 1h 20m on average so far today — 12 minutes ahead of yesterday at this hour. Engineering leads volume; Support and Finance are still ramping after late clock-ins.",
    stats: [
      { label: "Avg Worked", value: "1h 20m", delta: "+12m vs yesterday", health: "good" },
      { label: "Total Hours", value: "58h 40m", delta: "45 members", health: "good" },
      { label: "Clocked In", value: "37", delta: "8 not yet", health: "warn" },
      { label: "Top Team", value: "Engineering", delta: "22h 15m", health: "good" },
    ],
    chart: { type: "barChart", title: "Hours by time of day vs yesterday", payload: workedTodayTrend },
    table: workedToday,
  },
  "todays-activity": {
    key: "todays-activity",
    title: "Today's Activity — Detailed Report",
    subtitle: "Mouse/keyboard activity, idle, and away for today",
    severity: "warn",
    narrative:
      "Average activity is 41% today — up 6pts vs yesterday. Peak focus landed mid-morning and mid-afternoon; the lunch dip and meeting blocks are the main drag on the score.",
    stats: [
      { label: "Activity", value: "41%", delta: "+6% vs yesterday", health: "warn" },
      { label: "Idle", value: "9%", delta: "+1%", health: "warn" },
      { label: "Away", value: "14%", delta: "−2%", health: "good" },
      { label: "Active Time", value: "32h 10m", delta: "org total", health: "good" },
    ],
    chart: { type: "lineChart", title: "Activity vs idle by hour", payload: todaysActivityTrend },
    table: todaysActivity,
  },
  "working-hours": {
    key: "working-hours",
    title: "Working Hours — Detailed Report",
    subtitle: "Per-member effective vs. production time",
    severity: "good",
    narrative:
      "Effective time is tracking 8% above last week while idle time held flat. Three members on Engineering account for 41% of the idle total — worth a quick check on tooling or blockers.",
    stats: [
      { label: "Effective Time", value: "43h 29m", delta: "+8% vs yesterday", health: "good" },
      { label: "Production Time", value: "9h 49m", delta: "+4.2h", health: "good" },
      { label: "Avg Idle", value: "6%", delta: "flat", health: "warn" },
      { label: "Members Tracked", value: "45", delta: "+4", health: "good" },
    ],
    chart: { type: "scatter", title: "Capacity vs. output", payload: scatter },
    table: activity,
  },
  productivity: {
    key: "productivity",
    title: "Productivity — Detailed Report",
    subtitle: "Activity, idle, and away across every member",
    severity: "warn",
    narrative:
      "Average productivity sits at 22% with activity at 39%. The spread is wide: top quartile clears 80% while the bottom quartile is under 50%, dragged down by high meeting load.",
    stats: [
      { label: "Productivity", value: "22%", delta: "+4% vs yesterday", health: "warn" },
      { label: "Activity", value: "39%", delta: "+6%", health: "warn" },
      { label: "Idle", value: "6%", delta: "+1%", health: "warn" },
      { label: "Away", value: "0%", delta: "flat", health: "good" },
    ],
    chart: { type: "scatter", title: "Hours vs. productivity", payload: scatter },
    table: activity,
  },
  "productivity-trend": {
    key: "productivity-trend",
    title: "Productivity Trend — Detailed Report",
    subtitle: "Daily productivity, activity, and idle for this week",
    severity: "good",
    narrative:
      "Productivity peaked mid-week and dipped over the weekend. Activity tracked closely with productivity; idle rose on Sat–Sun as focus time fell.",
    stats: (() => {
      const prod = productivityTrend.series.find((s) => s.key === "Productivity")?.data ?? [];
      const act = productivityTrend.series.find((s) => s.key === "Activity")?.data ?? [];
      const idle = productivityTrend.series.find((s) => s.key === "Idle")?.data ?? [];
      const avg = (arr: number[]) => Math.round(arr.reduce((s, n) => s + n, 0) / Math.max(arr.length, 1));
      return [
        { label: "Avg Productivity", value: `${avg(prod)}%`, health: "good" as const },
        { label: "Avg Activity", value: `${avg(act)}%`, health: "good" as const },
        { label: "Avg Idle", value: `${avg(idle)}%`, health: "warn" as const },
        { label: "Peak Day", value: "Fri", delta: `${Math.max(...prod)}%`, health: "good" as const },
      ];
    })(),
    chart: { type: "lineChart", title: "Productivity vs activity vs idle", payload: productivityTrend },
    table: productivityTrendTable,
  },
  projects: {
    key: "projects",
    title: "Projects — Detailed Report",
    subtitle: "Status, budget burn, and profitability across the portfolio",
    severity: "warn",
    narrative:
      "101 projects tracked; 40 archived. Two active projects are burning budget faster than progress — VC_Angello and MATCT are the largest loss contributors this quarter.",
    stats: [
      { label: "Total Projects", value: "101", health: "good" },
      { label: "In Progress", value: "28", health: "warn" },
      { label: "At Risk", value: "9", delta: "+2", health: "bad" },
      { label: "Avg Budget Burn", value: "78%", delta: "+9%", health: "warn" },
    ],
    chart: { type: "barChart", title: "Budget vs. invoiced by quarter", payload: budgetTrend },
    table: projects,
  },
  invoices: {
    key: "invoices",
    title: "Invoices — Detailed Report",
    subtitle: "Paid, pending, and overdue receivables",
    severity: "warn",
    narrative:
      "₹0 overdue this cycle, but ₹0 pending is sitting on total invoiced INR 0. Two clients account for the bulk of the pending balance and are past 30 days.",
    stats: [
      { label: "Paid", value: "₹0", health: "good" },
      { label: "Pending", value: "₹0", delta: "0 invoices", health: "warn" },
      { label: "Overdue", value: "₹0", delta: "0 invoices", health: "good" },
      { label: "Collection Rate", value: "94%", delta: "+2%", health: "good" },
    ],
    chart: { type: "lineChart", title: "Profit & loss by quarter", payload: profitLoss },
    table: invoices,
  },
  tasks: {
    key: "tasks",
    title: "Tasks — Detailed Report",
    subtitle: "Overdue, due-soon, and triage across all projects",
    severity: "bad",
    narrative:
      "20,653 tasks tracked with 1,402 overdue — a 12% climb. Overdue work is concentrated in three projects; clearing the top 20 items would cut the overdue count by a third.",
    stats: [
      { label: "Total Tasks", value: "20,653", health: "good" },
      { label: "Overdue", value: "1,402", delta: "+12%", health: "bad" },
      { label: "Due Tomorrow", value: "57", health: "warn" },
      { label: "Yet to Start", value: "2,985", health: "warn" },
    ],
    table: tasks,
  },
  apps: {
    key: "apps",
    title: "App & URL Usage — Detailed Report",
    subtitle: "Time, users, and productivity by application",
    severity: "warn",
    narrative:
      "Productive apps make up 64% of tracked time. Nine apps fall outside policy; the largest is an unsanctioned file-sharing tool with 14 active users.",
    stats: [
      { label: "Apps Tracked", value: "312", health: "good" },
      { label: "Productive", value: "64%", delta: "+3%", health: "good" },
      { label: "Focus %", value: "72%", delta: "+2%", health: "good" },
      { label: "Shadow IT", value: "9 apps", delta: "+2", health: "bad" },
    ],
    table: appUsage,
  },
  "application-usage": {
    key: "application-usage",
    title: "Application Usage — Detailed Report",
    subtitle: "Time share across desktop and work applications",
    severity: "good",
    narrative:
      "VS Code and Slack lead application time. Productive tools dominate the top of the list; meeting and chat apps hold a smaller but consistent share.",
    stats: [
      { label: "Apps Shown", value: String(applicationUsageTable.rows.length), health: "good" },
      {
        label: "Top App",
        value: applicationsUsage[0]?.label ?? "—",
        delta: `${applicationsUsage[0]?.value ?? 0}%`,
        health: "good",
      },
      {
        label: "Productive Share",
        value: `${applicationsUsage.filter((a) => a.color === "#22c55e").reduce((s, a) => s + a.value, 0)}%`,
        health: "good",
      },
      {
        label: "Distracting Share",
        value: `${applicationsUsage.filter((a) => a.color === "#ef4444").reduce((s, a) => s + a.value, 0)}%`,
        health: "warn",
      },
    ],
    table: applicationUsageTable,
  },
  "website-usage": {
    key: "website-usage",
    title: "Website Usage — Detailed Report",
    subtitle: "Time share across websites and web apps",
    severity: "warn",
    narrative:
      "github.com and google.com lead website time. Distracting sites like youtube.com remain in the long tail and are worth a policy review.",
    stats: [
      { label: "Sites Shown", value: String(websiteUsageTable.rows.length), health: "good" },
      {
        label: "Top Site",
        value: websitesUsage[0]?.label ?? "—",
        delta: `${websitesUsage[0]?.value ?? 0}%`,
        health: "good",
      },
      {
        label: "Productive Share",
        value: `${websitesUsage.filter((a) => a.color === "#22c55e").reduce((s, a) => s + a.value, 0)}%`,
        health: "good",
      },
      {
        label: "Distracting Share",
        value: `${websitesUsage.filter((a) => a.color === "#ef4444").reduce((s, a) => s + a.value, 0)}%`,
        health: "bad",
      },
    ],
    table: websiteUsageTable,
  },
  members: {
    key: "members",
    title: "Members — Detailed Report",
    subtitle: "Presence, device, and activity per member",
    severity: "good",
    narrative:
      "37 of 45 members are online. Windows leads device usage at 21 seats. Presence is healthy with no member offline beyond the expected shift windows.",
    stats: [
      { label: "Total Members", value: "45", health: "good" },
      { label: "Online", value: "37", health: "good" },
      { label: "Offline", value: "8", health: "warn" },
      { label: "Idle Now", value: "3", health: "warn" },
    ],
    table: activity,
  },
  wellbeing: {
    key: "wellbeing",
    title: "Wellbeing — Detailed Report",
    subtitle: "Load, after-hours activity, and balance signals",
    severity: "bad",
    narrative:
      "9 members logged >50h with after-hours activity on 4+ nights. Break time improved to 52 min/day overall, but the at-risk cohort is trending the wrong way.",
    stats: [
      { label: "Wellbeing Index", value: "74", delta: "+3", health: "good" },
      { label: "After-Hours", value: "11.4h", delta: "+18%", health: "bad" },
      { label: "Avg Break", value: "52 min", delta: "+11%", health: "good" },
      { label: "Burnout Risk", value: "9", delta: "+3", health: "bad" },
    ],
    chart: { type: "scatter", title: "Load vs. wellbeing", payload: scatter },
    table: activity,
  },
  utilization: {
    key: "utilization",
    title: "Utilization Rate — Detailed Report",
    subtitle: "Billable capacity vs worked hours by member",
    severity: "warn",
    narrative:
      "Utilization is at 72% — 4pts under the 76% target. Billable work holds most of capacity, but Design and Support are dragging the average with higher non-billable load this week.",
    stats: [
      { label: "Utilization", value: "72%", delta: "−4% vs target", health: "warn" },
      { label: "Billable", value: "72%", delta: "of capacity", health: "good" },
      { label: "Non-Billable", value: "14%", health: "warn" },
      { label: "Under Target", value: "11", delta: "members", health: "bad" },
    ],
    chart: { type: "barChart", title: "Utilization mix by week", payload: utilizationTrend },
    table: utilizationRows,
  },
  bench: {
    key: "bench",
    title: "Resource Bench — Detailed Report",
    subtitle: "Available capacity and bench hours by member",
    severity: "good",
    narrative:
      "14% of capacity is on bench — 112h available this week. Engineering holds the largest pool (42h). Two members have been benched over 10 days and should be considered for upcoming pipeline work.",
    stats: [
      { label: "Bench %", value: "14%", delta: "of capacity", health: "good" },
      { label: "Bench Hours", value: "112h", delta: "this week", health: "good" },
      { label: "On Bench", value: "8", delta: "members", health: "warn" },
      { label: "Longest Idle", value: "16 days", delta: "1 member", health: "warn" },
    ],
    chart: { type: "barChart", title: "Bench hours by team", payload: benchByTeam },
    table: benchRows,
  },
  "cost-drivers": {
    key: "cost-drivers",
    title: "Cost Drivers — Detailed Report",
    subtitle: "Where project spend concentrates",
    severity: "warn",
    narrative:
      "Developers and Design account for ~63% of tracked cost. QA and server costs are climbing faster than headcount — worth a per-project drill before the next budget cycle.",
    stats: [
      { label: "Total Cost", value: "₹31.6K", delta: "+7%", health: "warn" },
      { label: "Top Driver", value: "Developers", delta: "₹11K", health: "warn" },
      { label: "Fastest Rising", value: "QA & Testing", delta: "+18%", health: "bad" },
      { label: "Tooling", value: "₹2K", health: "good" },
    ],
    chart: { type: "barChart", title: "Budget vs. invoiced by quarter", payload: budgetTrend },
    table: projects,
  },
  workload: {
    key: "workload",
    title: "Workload Balance — Detailed Report",
    subtitle: "Over/under-utilization and break health by member",
    severity: "warn",
    narrative:
      "Developer and Marketing are overutilized on 80%+ of days while taking the fewest breaks. Left unaddressed this is the leading indicator of the burnout cohort in the People view.",
    stats: [
      { label: "Overutilized", value: "68%", delta: "+5%", health: "bad" },
      { label: "Underutilized", value: "4%", health: "good" },
      { label: "Avg Breaks/Day", value: "4.1", delta: "+0.3", health: "good" },
      { label: "Avg Mins/Break", value: "4.2", health: "warn" },
    ],
    table: activity,
  },
  "tracked-least-hours": {
    key: "tracked-least-hours",
    title: "Tracked Least Hours — Detailed Report",
    subtitle: "Members with the lowest activity today",
    severity: "bad",
    narrative:
      "These members have the lowest activity scores today. High idle share suggests blocked work, long meetings, or away time — review with managers before the day ends.",
    stats: [
      {
        label: "Members",
        value: String(trackedLeastHours.length),
        health: "warn",
      },
      {
        label: "Lowest Activity",
        value: `${Math.min(...trackedLeastHours.map((i) => i.value))}%`,
        health: "bad",
      },
      {
        label: "Avg Activity",
        value: `${Math.round(trackedLeastHours.reduce((s, i) => s + i.value, 0) / trackedLeastHours.length)}%`,
        health: "bad",
      },
      {
        label: "Avg Idle",
        value: `${Math.round(trackedLeastHours.reduce((s, i) => s + (i.idle ?? 0), 0) / trackedLeastHours.length)}%`,
        health: "warn",
      },
    ],
    table: trackedLeastTable,
  },
  "workload-capacity": {
    key: "workload-capacity",
    title: "Workload Capacity — Detailed Report",
    subtitle: "Available hours, capacity, billable mix, and allocation band",
    severity: "warn",
    narrative:
      "Capacity bands show who is over-allocated vs healthy vs under-utilized. Over-allocated members are past available hours; under-utilized members still have room to take on work.",
    stats: [
      {
        label: "Members",
        value: String(workloadCapacityTable.rows.length),
        health: "good",
      },
      {
        label: "Over-allocated",
        value: String(workloadCapacityTable.rows.filter((r) => r.band === "Over-allocated").length),
        health: "bad",
      },
      {
        label: "Healthy",
        value: String(workloadCapacityTable.rows.filter((r) => r.band === "Healthy").length),
        health: "good",
      },
      {
        label: "Under-utilized",
        value: String(workloadCapacityTable.rows.filter((r) => r.band === "Under-utilized").length),
        health: "warn",
      },
    ],
    table: workloadCapacityTable,
  },
  technology: {
    key: "technology",
    title: "Technology Usage — Detailed Report",
    subtitle: "Category allocation and app-level detail",
    severity: "good",
    narrative:
      "Development and Collaborative tools split half of all tracked time. Category mix is stable week-over-week; the only notable shift is a 5.5% rise in Email allocation.",
    stats: [
      { label: "Categories", value: "28", health: "good" },
      { label: "Top Category", value: "Development", delta: "25%", health: "good" },
      { label: "Biggest Shift", value: "Email", delta: "+5.5%", health: "warn" },
      { label: "Design Tools", value: "14%", health: "good" },
    ],
    table: appUsage,
  },
  budget: {
    key: "budget",
    title: "Budget & Burn — Detailed Report",
    subtitle: "Budgeted vs. invoiced across the portfolio",
    severity: "warn",
    narrative:
      "Average budget burn is 78%, up 9pts. Q3 shows the widest gap between budgeted and invoiced — a signal to re-baseline scope on the two at-risk projects.",
    stats: [
      { label: "Avg Burn", value: "78%", delta: "+9%", health: "warn" },
      { label: "Over Budget", value: "3", delta: "+1", health: "bad" },
      { label: "Under Budget", value: "6", health: "good" },
      { label: "Forecast Var.", value: "±6%", health: "warn" },
    ],
    chart: { type: "barChart", title: "Budget vs. invoiced by quarter", payload: budgetTrend },
    table: projects,
  },
};

/** Resolve a report, falling back to the activity ledger for unknown keys. */
export function getReport(key?: string): ReportSpec {
  if (key && REPORTS[key]) return REPORTS[key];
  return REPORTS["working-hours"];
}
