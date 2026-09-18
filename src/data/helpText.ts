/**
 * Plain-language help copy for KPI cards, widgets, and report drawer stats.
 * Kept in one place so product text stays consistent across dashboards.
 */

const KPI_HELP: Record<string, string> = {
  "k-utilization":
    "Share of available hours spent on billable or productive work. Below target means spare capacity; above target can signal overload.",
  "k-todays-activity":
    "How active the team is today based on keyboard and mouse use. Low scores may mean meetings, breaks, or away time.",
  "k-attendance":
    "How many people are present and clocked in today compared to your total team size.",
  "k-worked-today":
    "Total hours logged across the organization so far today, compared with yesterday at the same time.",
  "k-apps":
    "Number of applications and websites tracked on team devices this period.",
  "k-shadow":
    "Apps used by your team that are not on the approved software list. Worth a security review.",
  "k-licenses":
    "Paid software seats with little or no recent use. These may be safe to reclaim.",
  "k-compliance":
    "Share of devices that meet your security and policy requirements.",
  "k-ontrack":
    "Projects delivering on schedule and within budget, out of all active projects.",
  "k-bench":
    "Team capacity not assigned to client or project work. Useful spare hours for new work.",
  "k-velocity":
    "Story points or tasks completed per sprint. Shows how much the team is shipping.",
  "k-overdue":
    "Tasks past their due date across all projects. Rising numbers need triage.",
  "k-wellbeing":
    "Overall team wellbeing score from hours, breaks, and after-hours patterns.",
  "k-overtime":
    "Time logged outside normal working hours. Sustained high values are a burnout signal.",
  "k-breaks":
    "Average break time per person per day. Regular breaks support focus and wellbeing.",
  "k-risk":
    "People showing signs of burnout risk from long hours and late-night activity.",
  "k-hours": "Hours you have logged today compared with your usual daily target.",
  "k-activity":
    "Your activity level today based on keyboard and mouse use, compared with team average.",
  "k-focus": "Uninterrupted deep-work time today. Shows when you focus best.",
  "k-tasks": "Tasks due today, including any that are already overdue.",
};

const WIDGET_HELP: Record<string, string> = {
  "w-productivity-trend":
    "Daily trend of productivity, activity, and idle time for the selected period.",
  "w-projects-worked":
    "How many projects sit in each status — not started, in progress, completed, and so on.",
  "w-members":
    "Team size plus who is online, offline, or away right now.",
  "w-upcoming-leaves":
    "Who is on leave now or coming back soon, so you can plan coverage.",
  "w-workload-capacity":
    "Each person's logged hours compared with their available capacity for the period.",
  "w-classification":
    "How tracked time splits between deep work, meetings, communication, and admin tasks.",
  "w-tracked-least":
    "People with the lowest activity today — useful for spotting blockers or disengagement.",
  "w-time-log-approval":
    "Submitted time logs waiting for manager approval before payroll or billing.",
  "w-applications":
    "Which desktop apps consume the most tracked time across the team.",
  "w-websites":
    "Which websites consume the most tracked time across the team.",
  "w-table":
    "Detailed row-by-row breakdown. Sort, filter, or export for deeper analysis.",
  "w-cat-alloc": "How software usage splits across categories like development, design, and email.",
  "w-focus":
    "Apps and sites that most often pull attention away from focused work.",
  "w-apps-prod": "Approved tools classified as productive for your organization.",
  "w-apps-neutral": "Tools that are neither clearly productive nor distracting.",
  "w-apps-unprod": "Sites and apps flagged as distracting or off-policy.",
  "w-categories": "Time spent by app and URL category across the organization.",
  "w-policy":
    "Share of tracked time in productive, neutral, and distracting app categories.",
  "w-heatmap":
    "When people log in and work, by day and hour. Darker cells mean more activity.",
  "w-changes":
    "Categories whose usage moved the most compared with the previous period.",
  "w-budget-health":
    "Which projects are on budget, at risk of overspend, or already over budget.",
  "w-task-timeline":
    "Monthly count of tasks created versus completed — shows delivery pace.",
  "w-stacked": "Open tasks grouped by status: to do, in progress, in review, and done.",
  "w-milestones":
    "Upcoming delivery milestones with task progress and hours invested.",
  "w-budget":
    "Budget allocated, amount billed, and burn rate over the selected period.",
  "w-top-profit": "Projects earning the highest profit and margin this period.",
  "w-cost": "Projects earning the lowest profit — candidates for scope or staffing review.",
  "w-scatter":
    "Each dot is one person: hours logged (horizontal) vs productivity (vertical). Bubble size reflects tasks completed.",
  "w-leader": "People who logged the most hours this period, ranked with share of total.",
  "w-emp": "Headcount currently working, on break, or away today.",
  "w-activity": "Average activity level per person for the selected day or period.",
  "w-balance":
    "Share of the team in healthy, watch, or at-risk wellbeing bands.",
  "w-mode": "Activity level broken down by remote, hybrid, and in-office work modes.",
  "w-startend":
    "Typical clock-in and clock-out times by work location.",
  "w-workload":
    "Teams or members who are over- or under-utilized, plus break habits.",
  "w-my-allocation": "How your hours this week split across assigned projects.",
  "w-timeline": "Hours of the day when you tend to be most focused.",
  "w-leave-balance": "Paid time off you have left and what you have used this year.",
  "w-screenshots": "Recent desktop captures from your tracked sessions.",
  "w-recent-tasks": "Tasks recently assigned to you and their current status.",
  "w-total-tasks-donut": "Your tasks grouped by status: not started, active, done, and closed.",
  "w-focus-apps-urls":
    "Apps and sites that most often interrupt your focus, sized by attention shifts.",
  "w-recent-timesheet": "Your latest time entries with project, task, and duration.",
};

/** Fallback when a widget has no id match — keyed by normalized title. */
const WIDGET_TITLE_HELP: Record<string, string> = {
  "project status":
    "How many projects sit in each status — not started, in progress, completed, and so on.",
  "daily focus": "Average daily focus score — uninterrupted time on meaningful work.",
  "load vs. wellbeing":
    "Each person's hours worked plotted against their wellbeing score.",
  "when people work":
    "When people log time, by day and hour. Watch for heavy after-hours patterns.",
  "presence & devices": "Who is online and which devices they are using.",
  "devices & presence": "Who is online and which devices they are using.",
  "workforce ledger":
    "Per-person hours, productivity, and activity for the selected period.",
  "project delivery ledger":
    "Project status, budget burn, and blockers across the portfolio.",
  "wellbeing ledger":
    "Hours, after-hours work, and balance signals for every team member.",
  "usage & license ledger":
    "Per-person app usage, device, and license detail.",
};

const REPORT_STAT_HELP: Record<string, string> = {
  "Avg Burn": "Average share of budget already spent across tracked projects.",
  "Over Budget": "Projects that have spent more than their allocated budget.",
  "Under Budget": "Projects spending below plan — may have room to reallocate.",
  "Forecast Var.":
    "Expected gap between forecast spend and budget. Wider variance needs a scope check.",
  "Listed Profit": "Total profit from projects shown in this report.",
  "Best Margin": "Highest profit margin among listed projects.",
  "Avg Margin": "Average profit margin across all listed projects.",
  "Top Project": "Project contributing the most profit in this list.",
  "Present": "People who have checked in and are working today.",
  Attendance: "Share of the team present today compared with total headcount.",
  "Not In Yet": "People expected today who have not clocked in yet.",
  Absent: "People marked absent or with no check-in today.",
  "Avg Worked": "Average hours logged per person so far today.",
  "Total Hours": "Combined hours logged by the whole organization today.",
  "Clocked In": "People currently checked in and tracking time.",
  "Top Team": "Department with the most hours logged today.",
  Activity: "Average keyboard and mouse activity level for the period.",
  Idle: "Time with little or no input activity — may mean meetings or breaks.",
  Away: "Time away from the desk or with tracking paused.",
  "Active Time": "Total hours with meaningful activity recorded.",
  Utilization: "Billable or productive hours as a share of available capacity.",
  Billable: "Hours that can be charged to a client or project.",
  "Non-Billable": "Internal or overhead hours not billed to clients.",
  "Under Target": "People below the utilization target for this period.",
  "Bench %": "Share of total capacity not assigned to billable work.",
  "Bench Hours": "Unassigned hours available for new projects this week.",
  "On Bench": "People with significant unassigned capacity right now.",
  "Longest Idle": "Longest stretch a benched member has waited for work.",
  "Avg Tasks": "Average tasks completed per person in this period.",
  "At Risk":
    "People with low output despite high hours — may need workload rebalancing.",
  Members: "Total people included in this report.",
  "Avg Hours": "Average hours logged per person in this period.",
  "Avg Productivity": "Average productive-time score across listed members.",
  "Budget Health": "Overall share of projects spending within plan.",
  "At Risk_projects": "Projects above 85% budget burn with delivery still open.",
  "Total Projects": "All projects tracked in this portfolio view.",
  "In Progress": "Projects actively being worked on right now.",
  Completed: "Projects marked finished in this period.",
  "Not Started": "Projects created but not yet kicked off.",
  "Pending Hours": "Submitted time logs still waiting for approval.",
  Approved: "Time logs already approved this period.",
  Rejected: "Time logs sent back for correction.",
};

export const getKpiHelp = (id: string, label?: string): string | undefined =>
  KPI_HELP[id] ??
  (label
    ? `Summary view of ${label.toLowerCase()}. Click the card for a detailed breakdown.`
    : undefined);

export const getWidgetHelp = (id: string, title?: string): string | undefined => {
  if (WIDGET_HELP[id]) return WIDGET_HELP[id];
  if (title) {
    const key = title.trim().toLowerCase();
    if (WIDGET_TITLE_HELP[key]) return WIDGET_TITLE_HELP[key];
  }
  return title
    ? `Shows ${title.toLowerCase()} for the selected date range. Use View report for full detail.`
    : undefined;
};

export const getReportStatHelp = (
  label: string,
  reportKey?: string,
): string | undefined => {
  if (label === "At Risk" && reportKey === "budget-health") {
    return REPORT_STAT_HELP["At Risk_projects"];
  }
  return REPORT_STAT_HELP[label];
};
