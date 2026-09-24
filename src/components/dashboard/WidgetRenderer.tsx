import { WidgetShell, type EditControls } from "./WidgetShell";
import { useState } from "react";
import { DataTable } from "./DataTable";
import { StatGroup } from "@/components/charts/StatGroup";
import { ScatterChart } from "@/components/charts/ScatterChart";
import { Heatmap } from "@/components/charts/Heatmap";
import { StackedBar } from "@/components/charts/StackedBar";
import { Donut } from "@/components/charts/Donut";
import { MembersWidget } from "@/components/charts/MembersWidget";
import { Leaderboard } from "@/components/charts/Leaderboard";
import { AppBreakdown } from "@/components/charts/AppBreakdown";
import { BarList } from "@/components/charts/BarList";
import { AxisChart } from "@/components/charts/AxisChart";
import { CategoriesBar } from "@/components/charts/CategoriesBar";
import { MiniTable } from "@/components/charts/MiniTable";
import { Gauge } from "@/components/charts/Gauge";
import { ProgressRing } from "@/components/charts/ProgressRing";
import { RangeBar } from "@/components/charts/RangeBar";
import { ProgressBars } from "@/components/charts/ProgressBars";
import { SegmentBar } from "@/components/charts/SegmentBar";
import { TimelineWidget } from "@/components/charts/TimelineWidget";
import { ScreenshotsWidget } from "@/components/charts/ScreenshotsWidget";
import { RecentTasksWidget } from "@/components/charts/RecentTasksWidget";
import { LeaveBalanceWidget } from "@/components/charts/LeaveBalanceWidget";
import { PersonalAllocationWidget } from "@/components/charts/PersonalAllocationWidget";
import { MyActionItemsWidget } from "@/components/charts/MyActionItemsWidget";
import { MyAllocationWidget } from "@/components/charts/MyAllocationWidget";
import { PeakFocusWidget } from "@/components/charts/PeakFocusWidget";
import { LowActivityMembersWidget } from "@/components/charts/LowActivityMembersWidget";
import { WorkloadCapacityWidget } from "@/components/charts/WorkloadCapacityWidget";
import { MemberActivityBarsWidget } from "@/components/charts/MemberActivityBarsWidget";
import { ProjectsWorkedWidget } from "@/components/charts/ProjectsWorkedWidget";
import {
  TaskTimelineSummaryWidget,
  TaskTimelineYearBadge,
} from "@/components/charts/TaskTimelineSummaryWidget";
import {
  BudgetTrendWidget,
  BudgetTrendPeriodBadge,
} from "@/components/charts/BudgetTrendWidget";
import { ProjectBudgetHealthWidget } from "@/components/charts/ProjectBudgetHealthWidget";
import { UpcomingLeavesWidget } from "@/components/charts/UpcomingLeavesWidget";
import { getWidgetHelp } from "@/data/helpText";
import type { DemoPlan } from "@/types/plan";
import type {
  WidgetDescriptor,
  StatGroupPayload,
  ScatterPoint,
  HeatCell,
  StackedDatum,
  DonutPayload,
  MembersPayload,
  LeaderRow,
  AppRow,
  BarListPayload,
  AxisChartPayload,
  CategoriesPayload,
  DataTablePayload,
  GaugePayload,
  ProgressRingPayload,
  RangeBarPayload,
  ProgressBarsPayload,
  SegmentBarPayload,
  LowActivityMembersPayload,
  WorkloadCapacityPayload,
  MemberActivityBarsPayload,
  ProjectsWorkedPayload,
  TaskTimelineSummaryPayload,
  TopContributorsPayload,
  BudgetTrendPayload,
  BudgetTrendPeriod,
  ProjectBudgetHealthPayload,
  UpcomingLeavesPayload,
} from "@/types";

/**
 * Maps a data-driven WidgetDescriptor onto a concrete component. Adding a new
 * widget type is a single case here plus a schema entry — grid and shell stay
 * untouched.
 */
export function WidgetRenderer({
  widget,
  highlight,
  editing,
  edit,
  onOpenReport,
  dateRange,
  plan,
}: {
  widget: WidgetDescriptor;
  highlight?: boolean;
  editing?: boolean;
  edit?: EditControls;
  onOpenReport?: (reportKey?: string) => void;
  dateRange?: string;
  plan?: DemoPlan;
}) {
  const hideActions = widget.title === "Workforce Ledger" || widget.title === "Project Delivery Ledger";
  const openReport = widget.reportKey && onOpenReport && !hideActions ? () => onOpenReport(widget.reportKey) : undefined;
  const budgetPayload =
    widget.type === "budgetTrend" ? (widget.payload as BudgetTrendPayload) : null;
  const [budgetPeriod, setBudgetPeriod] = useState<BudgetTrendPeriod>(
    budgetPayload?.defaultPeriod ?? "Quarterly",
  );

  function body() {
    switch (widget.type) {
      case "statGroup":
        return <StatGroup payload={widget.payload as StatGroupPayload} />;
      case "scatter":
        return <ScatterChart points={widget.payload as ScatterPoint[]} />;
      case "heatmap":
        return <Heatmap cells={widget.payload as HeatCell[]} />;
      case "stackedBar":
        return <StackedBar data={widget.payload as StackedDatum[]} />;
      case "donut":
        return <Donut payload={widget.payload as DonutPayload} />;
      case "members":
        return <MembersWidget payload={widget.payload as MembersPayload} />;
      case "leaderboard":
        return (
          <Leaderboard
            payload={widget.payload as TopContributorsPayload | LeaderRow[]}
          />
        );
      case "appBreakdown":
        return <AppBreakdown rows={widget.payload as AppRow[]} />;
      case "barList":
        return <BarList payload={widget.payload as BarListPayload} />;
      case "lineChart":
      case "barChart":
        return <AxisChart payload={widget.payload as AxisChartPayload} />;
      case "categoriesBar":
        return <CategoriesBar payload={widget.payload as CategoriesPayload} />;
      case "gauge":
        return <Gauge payload={widget.payload as GaugePayload} />;
      case "progressRing":
        return <ProgressRing payload={widget.payload as ProgressRingPayload} />;
      case "rangeBar":
        return <RangeBar payload={widget.payload as RangeBarPayload} />;
      case "progressBars":
        return <ProgressBars payload={widget.payload as ProgressBarsPayload} />;
      case "segmentBar":
        return <SegmentBar payload={widget.payload as SegmentBarPayload} />;
      case "miniTable":
        return <MiniTable payload={widget.payload as DataTablePayload} />;
      case "dataTable":
        return (
          <DataTable 
            payload={widget.payload as DataTablePayload} 
            title={widget.title}
            subtitle={widget.subtitle}
            info={widget.info ?? getWidgetHelp(widget.id, widget.title)}
            onOpenReport={openReport}
            showExport={!hideActions}
            isEditing={editing}
            contentAlign="left"
          />
        );
      case "timeline":
        return <TimelineWidget dateRange={dateRange} />;
      case "screenshots":
        return <ScreenshotsWidget />;
      case "recentTasks":
        return <RecentTasksWidget />;
      case "leaveBalance":
        return <LeaveBalanceWidget />;
      case "personalAllocation":
        return <PersonalAllocationWidget type={widget.id?.includes("web") ? "websites" : "apps"} />;
      case "actionItems":
        return <MyActionItemsWidget />;
      case "myAllocation":
        return <MyAllocationWidget />;
      case "peakFocus":
        return <PeakFocusWidget />;
      case "lowActivityMembers":
        return <LowActivityMembersWidget payload={widget.payload as LowActivityMembersPayload} />;
      case "workloadCapacity":
        return <WorkloadCapacityWidget payload={widget.payload as WorkloadCapacityPayload} />;
      case "memberActivityBars":
        return <MemberActivityBarsWidget payload={widget.payload as MemberActivityBarsPayload} />;
      case "projectsWorked":
        return <ProjectsWorkedWidget payload={widget.payload as ProjectsWorkedPayload} />;
      case "taskTimelineSummary":
        return <TaskTimelineSummaryWidget payload={widget.payload as TaskTimelineSummaryPayload} />;
      case "budgetTrend":
        return (
          <BudgetTrendWidget
            payload={widget.payload as BudgetTrendPayload}
            period={budgetPeriod}
          />
        );
      case "projectBudgetHealth":
        return (
          <ProjectBudgetHealthWidget
            payload={widget.payload as ProjectBudgetHealthPayload}
            onViewAffected={openReport}
          />
        );
      case "upcomingLeaves":
        return <UpcomingLeavesWidget payload={widget.payload as UpcomingLeavesPayload} />;
      default:
        return null;
    }
  }

  const isTable = widget.type === "dataTable";
  const isMemberTable = widget.type === "lowActivityMembers";
  const isCompactUsage =
    widget.id === "w-applications" ||
    widget.id === "w-websites" ||
    widget.id === "w-classification" ||
    widget.id === "w-tracked-least" ||
    widget.id === "w-time-log-approval" ||
    widget.id === "w-workload-capacity" ||
    widget.id === "w-top-profit" ||
    widget.id === "w-cost";
  const isProjectsWorked = widget.type === "projectsWorked";
  const isScatter = widget.type === "scatter";
  const isTaskTimeline = widget.type === "taskTimelineSummary";
  const isBudgetTrend = widget.type === "budgetTrend";
  const isProjectBudgetHealth = widget.type === "projectBudgetHealth";
  const isUpcomingLeaves = widget.type === "upcomingLeaves";
  const taskTimelinePayload = isTaskTimeline
    ? (widget.payload as TaskTimelineSummaryPayload)
    : null;
  const isTopContributors = widget.type === "leaderboard" && !Array.isArray(widget.payload);
  const topContributorsPayload = isTopContributors
    ? (widget.payload as TopContributorsPayload)
    : null;
  const headerReport = openReport;
  const isLocked = plan === "proof" && (
    widget.type === "timeline" ||
    widget.type === "screenshots" ||
    widget.type === "heatmap" ||
    widget.type === "peakFocus" ||
    widget.type === "leaderboard" ||
    widget.type === "progressRing" ||
    widget.id === "w-milestones" ||
    widget.id === "w-workload" ||
    widget.id === "w-projects-worked" ||
    widget.id === "w-budget" ||
    widget.id === "w-scatter"
  );

  return (
    <WidgetShell
      title={widget.title}
      subtitle={widget.subtitle}
      info={widget.info ?? getWidgetHelp(widget.id, widget.title)}
      icon={widget.icon}
      highlight={highlight}
      editing={editing}
      edit={edit}
      onOpenReport={headerReport}
      actionLabel={
        topContributorsPayload ? "View all" : widget.actionLabel
      }
      badgeBelowAction={false}
      badgeBeforeAction={isTaskTimeline || isBudgetTrend}
      badge={
        taskTimelinePayload ? (
          <TaskTimelineYearBadge label={taskTimelinePayload.yearLabel} />
        ) : isBudgetTrend && budgetPayload ? (
          <BudgetTrendPeriodBadge period={budgetPeriod} onChange={setBudgetPeriod} />
        ) : undefined
      }
      bodyClassName={
        isTable || isMemberTable
          ? "p-0"
          : isScatter
            ? "px-3 py-2"
            : isProjectsWorked || isTopContributors || isUpcomingLeaves
              ? "px-5 py-4"
              : isTaskTimeline || isProjectBudgetHealth
                ? "px-5 py-4"
                : isCompactUsage
                  ? "px-5 py-3"
                  : undefined
      }
      hideHeader={isTable && !editing}
      locked={isLocked}
    >
      {body()}
    </WidgetShell>
  );
}
