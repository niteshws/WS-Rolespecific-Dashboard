import type {
  Dashboard,
  WidgetDescriptor,
  KpiSpec,
  AxisChartPayload,
  DataTablePayload,
  LeaderRow,
  TopContributorsPayload,
} from "@/types";

function getScaleFactor(range: string, start?: string, end?: string): number {
  if (range === "Today") return 0.2;
  if (range === "This week") return 1.0;
  if (range === "This month") return 4.2;
  if (range === "Custom date" && start && end) {
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.max(1, Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    return diff / 7;
  }
  return 1.0;
}

function scaleStringValue(val: string, scale: number): string {
  // Try to parse hours, e.g., "43h 29m"
  const hourMinMatch = val.match(/^(\d+)h\s*(\d+)m$/);
  if (hourMinMatch) {
    const h = parseInt(hourMinMatch[1], 10);
    const m = parseInt(hourMinMatch[2], 10);
    const totalMins = (h * 60 + m) * scale;
    const newH = Math.floor(totalMins / 60);
    const newM = Math.round(totalMins % 60);
    return `${newH}h ${newM}m`;
  }

  // Try "43h" or "9.4h"
  const hourMatch = val.match(/^([\d.]+)h$/);
  if (hourMatch) {
    const h = parseFloat(hourMatch[1]) * scale;
    return `${Math.round(h * 10) / 10}h`;
  }

  // Try currency "₹35K" or "₹1.5K"
  const currencyMatch = val.match(/^₹([\d.]+)([KM])?$/);
  if (currencyMatch) {
    const num = parseFloat(currencyMatch[1]) * scale;
    const suffix = currencyMatch[2] ?? "";
    return `₹${Math.round(num * 10) / 10}${suffix}`;
  }

  // Try numbers with commas, e.g. "1,402"
  const cleanVal = val.replace(/,/g, "");
  if (!isNaN(Number(cleanVal)) && cleanVal.trim() !== "") {
    const num = Math.round(Number(cleanVal) * scale);
    return num.toLocaleString();
  }

  // Percentages "22%" should remain unchanged (since rate is constant)
  return val;
}

export function getFilteredDashboard(
  dashboard: Dashboard,
  range: string,
  start?: string,
  end?: string,
  filterType: "all" | "team" | "member" = "all",
  filterValue: string = ""
): Dashboard {
  const scale = getScaleFactor(range, start, end);
  const copy = structuredClone(dashboard);

  // Apply Team / Member Filter
  const dataTableWidget = copy.widgets.find(w => w.type === "dataTable");
  let filteredRows: any[] = [];
  if (dataTableWidget && dataTableWidget.payload) {
    const p = dataTableWidget.payload as DataTablePayload;
    if (filterType === "team") {
      filteredRows = p.rows.filter(r => String(r.team).toLowerCase() === filterValue.toLowerCase());
    } else if (filterType === "member") {
      filteredRows = p.rows.filter(r => String(r.name).toLowerCase() === filterValue.toLowerCase());
    } else {
      filteredRows = p.rows;
    }
  }

  let avgTracked = 0;
  let avgActive = 0;
  let avgProductivity = 0;
  if (filteredRows.length > 0) {
    const totalTracked = filteredRows.reduce((sum, r) => sum + Number(r.tracked || 0), 0);
    const totalActive = filteredRows.reduce((sum, r) => sum + Number(r.active || 0), 0);
    const totalProd = filteredRows.reduce((sum, r) => sum + Number(r.productivity || 0), 0);
    avgTracked = totalTracked / filteredRows.length;
    avgActive = totalActive / filteredRows.length;
    avgProductivity = Math.round(totalProd / filteredRows.length);
  }

  // 1. Scale KPIs
  copy.kpis = copy.kpis.map((kpi) => {
    // If KPI label is "Total Projects", it's date-independent
    if (kpi.label === "Total Projects") return kpi;

    let value = kpi.value;
    if (filterType !== "all" && filteredRows.length > 0) {
      if (kpi.label === "Effective Time" || kpi.label === "Effective Hours") {
        value = `${Math.round(avgActive * 10) / 10}h`;
      } else if (kpi.label === "Avg Productivity" || kpi.label === "Productivity") {
        value = `${avgProductivity}%`;
      }
    }

    return {
      ...kpi,
      value: scaleStringValue(value, scale),
      // Scale sparkline values
      sparkline: kpi.sparkline.map((v) => Math.max(5, Math.min(100, Math.round(v * (range === "Today" ? 0.8 : 1.0))))),
    };
  });

  // 2. Scale Widgets
  copy.widgets = copy.widgets.map((widget) => {
    // Skip date-independent widgets if no filter is active
    if (
      filterType === "all" &&
      (widget.title.includes("Devices") ||
        widget.title.includes("Presence") ||
        widget.title.includes("Members") ||
        widget.title.includes("Upcoming Milestones"))
    ) {
      return widget;
    }

    const payload = widget.payload;
    if (!payload) return widget;

    const newWidget = { ...widget };

    // Handle different widget types
    if (widget.type === "statGroup") {
      const p = payload as { stats: any[] };
      newWidget.payload = {
        ...p,
        stats: p.stats.map((s) => {
          if (s.label === "Margin %") return s;

          let val = s.value;
          if (filterType !== "all" && filteredRows.length > 0) {
            if (s.label === "Effective Time") {
              val = `${Math.round(avgActive * 10) / 10}h`;
            } else if (s.label === "Productivity") {
              val = `${avgProductivity}%`;
            } else if (s.label === "Activity") {
              val = `${Math.round((avgActive / (avgTracked || 1)) * 100)}%`;
            } else if (s.label === "Idle") {
              val = `${Math.round((avgTracked - avgActive) * 10) / 10}h`;
            }
          }

          return {
            ...s,
            value: scaleStringValue(val, scale),
            sub: s.sub ? scaleStringValue(s.sub, scale) : undefined,
          };
        }),
      };
    } else if (widget.type === "appBreakdown") {
      const p = payload as any[];
      newWidget.payload = p.map((row) => ({
        ...row,
        hours: Math.round(row.hours * scale * 10) / 10,
      }));
    } else if (widget.type === "barList") {
      const p = payload as { items: any[] };
      newWidget.payload = {
        ...p,
        items: p.items.map((item) => ({
          ...item,
          value: Math.round(item.value * scale * 10) / 10,
        })),
      };
    } else if (widget.type === "donut") {
      const p = payload as { slices: any[]; centerValue?: string };
      newWidget.payload = {
        ...p,
        centerValue: p.centerValue ? scaleStringValue(p.centerValue, scale) : undefined,
        slices: p.slices.map((slice) => ({
          ...slice,
          value: Math.round(slice.value * scale),
        })),
      };
    } else if (widget.type === "projectsWorked") {
      const p = payload as { statuses: any[]; insight: { suggestion: string } };
      newWidget.payload = {
        ...p,
        statuses: p.statuses.map((status) => ({
          ...status,
          value: Math.round(status.value * scale),
        })),
      };
    } else if (widget.type === "categoriesBar") {
      const p = payload as { segments: any[] };
      newWidget.payload = {
        ...p,
        segments: p.segments.map((seg) => ({
          ...seg,
          value: Math.round(seg.value * scale),
        })),
      };
    } else if (widget.type === "dataTable") {
      const p = payload as DataTablePayload;
      let rowsToProcess = p.rows;
      if (filterType === "team") {
        rowsToProcess = p.rows.filter(r => String(r.team).toLowerCase() === filterValue.toLowerCase());
      } else if (filterType === "member") {
        rowsToProcess = p.rows.filter(r => String(r.name).toLowerCase() === filterValue.toLowerCase());
      }

      newWidget.payload = {
        ...p,
        rows: rowsToProcess.map((row) => {
          const newRow = { ...row };
          Object.keys(newRow).forEach((key) => {
            const col = p.columns.find((c) => c.key === key);
            if (col && (col.render === "hours" || col.key === "Tracked" || col.key === "Active" || col.key === "Idle")) {
              newRow[key] = Math.round(Number(newRow[key]) * scale * 10) / 10;
            }
          });
          return newRow;
        }),
      };
    } else if (widget.type === "scatter") {
      const p = payload as any[];
      let pointsToProcess = p;
      if (filterType === "team") {
        pointsToProcess = p.filter(pt => String(pt.team).toLowerCase() === filterValue.toLowerCase());
      } else if (filterType === "member") {
        pointsToProcess = p.filter(pt => String(pt.name).toLowerCase() === filterValue.toLowerCase());
      }
      newWidget.payload = pointsToProcess;
    } else if (widget.type === "leaderboard") {
      const raw = payload as TopContributorsPayload | LeaderRow[];
      const rows = Array.isArray(raw) ? raw : raw.rows;
      let rowsToProcess = rows;
      if (filterType === "team") {
        rowsToProcess = rows.filter((r) => String(r.team).toLowerCase() === filterValue.toLowerCase());
      } else if (filterType === "member") {
        rowsToProcess = rows.filter((r) => String(r.name).toLowerCase() === filterValue.toLowerCase());
      }
      newWidget.payload = Array.isArray(raw)
        ? rowsToProcess
        : { ...raw, rows: rowsToProcess };
    } else if (widget.type === "lineChart" || widget.type === "barChart") {
      const p = payload as AxisChartPayload;
      let newLabels = p.xLabels;
      let multiplier = 1.0;

      // Layout changes based on daily/weekly/monthly selections
      if (range === "Today") {
        newLabels = ["09:00", "12:00", "15:00", "18:00"];
        multiplier = 0.2;
      } else if (range === "This week") {
        newLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        multiplier = 1.0;
      } else if (range === "This month") {
        newLabels = ["Week 1", "Week 2", "Week 3", "Week 4"];
        multiplier = 4.2;
      }

      newWidget.payload = {
        ...p,
        xLabels: newLabels,
        series: p.series.map((s) => {
          const baseData = Array.from({ length: newLabels.length }).map((_, idx) => {
            const originalVal = s.data[idx % s.data.length] ?? 50;
            return Math.round(originalVal * multiplier * (filterType !== "all" ? 0.4 : 1.0));
          });
          return {
            ...s,
            data: baseData,
          };
        }),
      };
    }

    return newWidget;
  });

  // If individual member is selected, filter widgets and inject personal ones
  if (filterType === "member") {
    const hiddenWidgetIds = [
      "w-members", "w-policy", "w-changes", "w-milestones", "w-leader",
      "w-leaderboard", "w-top-profit", "w-least-profit", "w-pl", "w-budget",
      "w-scatter", "w-status", "w-cost", "w-stacked", "w-balance", "w-emp",
      "w-activity", "w-invoice-stat", "w-pl-stat", "w-utilization"
    ];
    copy.widgets = copy.widgets.filter((w) => !hiddenWidgetIds.includes(w.id));

    // Inject personal widgets if not on IT dashboard
    if (dashboard.id !== "it") {
      copy.widgets.push({
        id: "w-timeline",
        type: "timeline",
        size: "half",
        title: "Activity Timeline",
        subtitle: "Daily slot utilization",
        layer: 2,
      });
      copy.widgets.push({
        id: "w-screenshots",
        type: "screenshots",
        size: "half",
        title: "Recent Screenshots",
        subtitle: "Captured desktop screenshot logs",
        layer: 2,
      });
      copy.widgets.push({
        id: "w-recent-timesheet",
        type: "dataTable",
        size: "full",
        title: "Recent Timesheets",
        subtitle: "Timesheet logs for projects and tasks",
        payload: getIndividualTimesheets(filterValue),
        layer: 2,
        reportKey: "timesheet",
      });
      copy.widgets.push({
        id: "w-recent-tasks",
        type: "recentTasks",
        size: "half-tall",
        title: "Recent Tasks",
        subtitle: "Assigned tasks status",
        layer: 2,
      });
    }
  }

  // Workload balance update for wellbeing if member is selected on HR view
  if (filterType === "member" && dashboard.id === "hr") {
    copy.widgets = copy.widgets.map((widget) => {
      if (widget.id === "w-workload") {
        const p = widget.payload as DataTablePayload;
        return {
          ...widget,
          payload: {
            columns: p.columns.map(col => col.key === "team" ? { ...col, label: "Member" } : col),
            rows: [
              { team: filterValue, over: 74, under: 6, breaks: 3.8, mins: 4.2 }
            ]
          }
        };
      }
      return widget;
    });
  }

  return copy;
}

function getIndividualTimesheets(memberName: string): DataTablePayload {
  const rows = [
    { project: "Workstatus Product Dev", task: "Implement date range filter", date: "07 Aug, 2026", start: "09:30 AM", stop: "06:30 PM", duration: "09:00:00" },
    { project: "VC_Angello", task: "Bug fixes on dashboard layout", date: "06 Aug, 2026", start: "09:15 AM", stop: "06:00 PM", duration: "08:45:00" },
    { project: "MATCT", task: "Refactor grid system responsive sizes", date: "05 Aug, 2026", start: "10:00 AM", stop: "05:30 PM", duration: "07:30:00" },
    { project: "Workstatus Product Dev", task: "Aesthetic styling updates", date: "04 Aug, 2026", start: "09:45 AM", stop: "06:15 PM", duration: "08:30:00" },
    { project: "VC_LiveCart", task: "Integration testing with dev team", date: "03 Aug, 2026", start: "09:00 AM", stop: "06:00 PM", duration: "09:00:00" },
  ];
  return {
    columns: [
      { key: "project", label: "Project", pinned: true, width: 180 },
      { key: "task", label: "Task", width: 180 },
      { key: "date", label: "Date", width: 100 },
      { key: "start", label: "Start Time", width: 90 },
      { key: "stop", label: "End Time", width: 90 },
      { key: "duration", label: "Duration", align: "right", width: 90 }
    ],
    rows
  };
}
