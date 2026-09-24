import { useEffect, useState } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { InsightBanner } from "./InsightBanner";
import { MyDashboardBanner } from "./MyDashboardBanner";
import { KpiCard } from "./KpiCard";
import { BentoGrid, type GridOps } from "./BentoGrid";
import { ReportDrawer } from "./ReportDrawer";
import { CustomizeWidgetsDrawer, type WidgetLayoutSaveResult } from "./CustomizeWidgetsDrawer";
import { TourCalloutStrip } from "@/components/tour/TourCalloutStrip";
import type { Dashboard } from "@/types";
import type { DemoPlan } from "@/types/plan";

/**
 * The composed dashboard view. Renders the 3-layer progressive-disclosure flow:
 *   Layer 1 (KPI cards + stat groups) → click → opens
 *   Layer 3 (ReportDrawer) with the detailed itemized report + a Layer-2 recap.
 */
export function DashboardView({
  dashboard,
  editing,
  ops,
  dateRange,
  setDateRange,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  filterType,
  setFilterType,
  filterValue,
  setFilterValue,
  onToggleEdit,
  onDuplicate,
  onDelete,
  onShare,
  onCreate,
  highlightWorkdayBanner = false,
  highlightTourStrip = false,
  showTourCallout = false,
  onStartTour,
  onDismissTourCallout,
  onUpdateWidgetVisibility,
  plan = "trial",
}: {
  dashboard: Dashboard;
  editing: boolean;
  ops: GridOps;
  dateRange: string;
  setDateRange: (val: string) => void;
  customStartDate: string;
  setCustomStartDate: (val: string) => void;
  customEndDate: string;
  setCustomEndDate: (val: string) => void;
  filterType: "all" | "team" | "member";
  setFilterType: (type: "all" | "team" | "member") => void;
  filterValue: string;
  setFilterValue: (val: string) => void;
  onToggleEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onShare: () => void;
  onCreate: () => void;
  highlightWorkdayBanner?: boolean;
  highlightTourStrip?: boolean;
  showTourCallout?: boolean;
  onStartTour?: () => void;
  onDismissTourCallout?: () => void;
  onUpdateWidgetVisibility?: (
    visibility: Record<string, boolean>,
    meta?: Pick<WidgetLayoutSaveResult, "scope" | "viewName">,
  ) => void;
  plan?: DemoPlan;
}) {
  const [reportKey, setReportKey] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState<boolean>(false);

  useEffect(() => {
    setDrawerOpen(false);
    setCustomizeOpen(false);
  }, [dashboard.id]);

  const handleSaveWidgetVisibility = ({
    visibility,
    scope,
    viewName,
  }: WidgetLayoutSaveResult): void => {
    try {
      onUpdateWidgetVisibility?.(visibility, { scope, viewName });
    } catch (error) {
      console.error("Failed to save widget visibility:", error);
    }
  };

  function openReport(key?: string) {
    setReportKey(key ?? null);
    setDrawerOpen(true);
  }

  return (
    <div>
      <div className="bg-white px-6">
        {!editing && showTourCallout && onStartTour && onDismissTourCallout ? (
          <div id="tour-callout-strip" className="mx-auto max-w-[1600px] pt-4 pb-2">
            <TourCalloutStrip
              highlighted={highlightTourStrip}
              onStartTour={onStartTour}
              onDismiss={onDismissTourCallout}
            />
          </div>
        ) : null}
        <DashboardHeader
          dashboard={dashboard}
          dateRange={dateRange}
          setDateRange={setDateRange}
          customStartDate={customStartDate}
          setCustomStartDate={setCustomStartDate}
          customEndDate={customEndDate}
          setCustomEndDate={setCustomEndDate}
          filterType={filterType}
          setFilterType={setFilterType}
          filterValue={filterValue}
          setFilterValue={setFilterValue}
          editing={editing}
          onToggleEdit={onToggleEdit}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onShare={onShare}
          onCreate={onCreate}
          onCustomizeWidgets={() => setCustomizeOpen(true)}
        />
      </div>

      <div className="mx-auto max-w-[1600px] space-y-6 bg-white px-6 pb-6 pt-2">
      {editing ? (
        <div className="-mt-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary">
          Editing layout — use widget controls to resize, hide, or reorder. Finish from the menu (⋮).
        </div>
      ) : null}


      {/* Data storytelling */}
      {!editing && (
        <div id="insight-banner">
          <InsightBanner insights={dashboard.insights} onOpenReport={openReport} />
        </div>
      )}

      {dashboard.id === "my-dashboard" && (
        <div
          id="my-dashboard-banner"
          className={
            highlightWorkdayBanner
              ? "animate-pulse rounded-lg ring-2 ring-primary/30 ring-offset-2"
              : undefined
          }
        >
          <MyDashboardBanner />
        </div>
      )}

      {/* Layer 1 — The Glance */}
      <section id="dashboard-kpis" aria-label="Key metrics" className="space-y-2">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dashboard.kpis.map((kpi) => (
            <KpiCard key={kpi.id} spec={kpi} onOpenReport={openReport} />
          ))}
        </div>
      </section>

      {/* Layer 2 + 3 — Bento grid */}
      <section aria-label="Analytics widgets" className="space-y-2">
        <BentoGrid widgets={dashboard.widgets} editing={editing} ops={ops} onOpenReport={openReport} dateRange={dateRange} plan={plan} />
      </section>

      <ReportDrawer reportKey={reportKey} open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <CustomizeWidgetsDrawer
        open={customizeOpen}
        widgets={dashboard.widgets}
        onClose={() => setCustomizeOpen(false)}
        onSave={handleSaveWidgetVisibility}
      />
      </div>
    </div>
  );
}
