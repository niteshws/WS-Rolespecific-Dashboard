import { useCallback, useMemo, useState } from "react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { ShareDialog } from "@/components/dashboard/ShareDialog";
import {
  CreateDashboardDialog,
  type NewDashboardInput,
} from "@/components/dashboard/CreateDashboardDialog";
import { FirstInsightReveal } from "@/components/dashboard/FirstInsightReveal";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { SIZE_ORDER, type GridOps } from "@/components/dashboard/BentoGrid";
import { ARCHETYPES, ARCHETYPE_MAP } from "@/data/archetypes";
import { isOnboardingComplete, resetOnboarding } from "@/lib/onboarding";
import {
  dismissTourCallout,
  isTourCalloutDismissed,
  isTourComplete,
  markTourComplete,
  clearTourState,
  type TourStep,
} from "@/lib/tour";
import { GuidedTour } from "@/components/tour/GuidedTour";
import { DemoBar } from "@/components/layout/DemoBar";
import type { Dashboard, WidgetSize } from "@/types";
import type { DemoPlan } from "@/types/plan";

const MY_DASHBOARD_ID = "my-dashboard";

/** Seed editable dashboard instances from the role templates. */
function seedDashboards(): Dashboard[] {
  return ARCHETYPES.map((a) => ({
    ...structuredClone(a),
    name: a.role,
  }));
}

import { getFilteredDashboard } from "@/lib/dateFilter";
import { MY_DASHBOARD } from "@/data/myDashboard";

let idc = 100;
const nextId = () => `d-${idc++}`;

export default function App() {
  const [dashboards, setDashboards] = useState<Dashboard[]>(seedDashboards);
  const [myDashboard, setMyDashboard] = useState<Dashboard>(() => structuredClone(MY_DASHBOARD));
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => !isOnboardingComplete());
  const [currentId, setCurrentId] = useState<string>(
    isOnboardingComplete() ? MY_DASHBOARD_ID : dashboards[0].id,
  );
  const [editing, setEditing] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const [dateRange, setDateRange] = useState("This week");
  const [customStartDate, setCustomStartDate] = useState("2026-08-01");
  const [customEndDate, setCustomEndDate] = useState("2026-08-07");

  const [filterType, setFilterType] = useState<"all" | "team" | "member">("all");
  const [filterValue, setFilterValue] = useState<string>("");
  const [showFirstInsight, setShowFirstInsight] = useState<boolean>(false);
  const [highlightWorkdayBanner, setHighlightWorkdayBanner] = useState<boolean>(false);
  const [highlightTourStrip, setHighlightTourStrip] = useState<boolean>(false);
  const [showTourStrip, setShowTourStrip] = useState<boolean>(
    () => !isTourCalloutDismissed() && !isTourComplete(),
  );
  const [tourActive, setTourActive] = useState<boolean>(false);
  const [tourStepIndex, setTourStepIndex] = useState<number>(0);
  const [navbarCreateOpen, setNavbarCreateOpen] = useState<boolean>(false);
  const [demoPlan, setDemoPlan] = useState<DemoPlan>("trial");

  const current = useMemo(() => {
    if (currentId === MY_DASHBOARD_ID) return myDashboard;
    return dashboards.find((d) => d.id === currentId) ?? dashboards[0];
  }, [dashboards, currentId, myDashboard]);

  const processedDashboard = useMemo(() => {
    return getFilteredDashboard(current, dateRange, customStartDate, customEndDate, filterType, filterValue);
  }, [current, dateRange, customStartDate, customEndDate, filterType, filterValue]);

  /** Apply an update to the currently-selected dashboard. */
  const updateCurrent = useCallback((fn: (d: Dashboard) => Dashboard): void => {
    if (current.id === MY_DASHBOARD_ID) {
      setMyDashboard((prev) => fn(structuredClone(prev)));
      return;
    }
    setDashboards((prev) => prev.map((d) => (d.id === current.id ? fn(structuredClone(d)) : d)));
  }, [current.id]);

  const handleUpdateWidgetVisibility = useCallback((visibility: Record<string, boolean>): void => {
    try {
      updateCurrent((dashboard) => {
        dashboard.widgets.forEach((widget) => {
          if (widget.id in visibility) {
            widget.hidden = !visibility[widget.id];
          }
        });
        return dashboard;
      });
    } catch (error) {
      console.error("Failed to update widget visibility:", error);
    }
  }, [updateCurrent]);

  const ops: GridOps = {
    onHide: (id) =>
      updateCurrent((d) => {
        const w = d.widgets.find((x) => x.id === id);
        if (w) w.hidden = true;
        return d;
      }),
    onRestore: (id) =>
      updateCurrent((d) => {
        const w = d.widgets.find((x) => x.id === id);
        if (w) w.hidden = false;
        return d;
      }),
    onResize: (id, dir) =>
      updateCurrent((d) => {
        const w = d.widgets.find((x) => x.id === id);
        if (w) {
          const i = SIZE_ORDER.indexOf(w.size);
          const next = SIZE_ORDER[Math.min(SIZE_ORDER.length - 1, Math.max(0, i + dir))];
          w.size = next as WidgetSize;
        }
        return d;
      }),
    onMove: (id, dir) =>
      updateCurrent((d) => {
        const i = d.widgets.findIndex((x) => x.id === id);
        const j = i + dir;
        if (i >= 0 && j >= 0 && j < d.widgets.length) {
          [d.widgets[i], d.widgets[j]] = [d.widgets[j], d.widgets[i]];
        }
        return d;
      }),
  };

  function handleCreate(input: NewDashboardInput) {
    let fresh: Dashboard;
    if (input.templateId === "custom") {
      fresh = {
        id: nextId(),
        name: input.name,
        role: "Custom",
        description: "Custom dashboard",
        icon: "Settings2",
        visibility: input.visibility,
        sharedRoles: input.sharedRoles,
        owner: "Vinove Design",
        templateId: "custom",
        insights: [],
        kpis: [],
        widgets: input.customWidgets || [],
      };
    } else {
      const tpl = ARCHETYPE_MAP[input.templateId];
      fresh = {
        ...structuredClone(tpl),
        id: nextId(),
        name: input.name,
        visibility: input.visibility,
        sharedRoles: input.sharedRoles,
        templateId: input.templateId,
      };
    }
    setDashboards((prev) => [...prev, fresh]);
    setCurrentId(fresh.id);
    setCreateOpen(false);
    setEditing(false);
  }

  function handleDuplicate() {
    const copy: Dashboard = {
      ...structuredClone(current),
      id: nextId(),
      name: `${current.name ?? current.role} (copy)`,
      visibility: "private",
    };
    setDashboards((prev) => [...prev, copy]);
    setCurrentId(copy.id);
  }

  function handleDelete() {
    if (dashboards.length <= 1) return;
    setDashboards((prev) => prev.filter((d) => d.id !== current.id));
    setCurrentId(dashboards.find((d) => d.id !== current.id)!.id);
  }

  const handleOnboardingComplete = useCallback((): void => {
    setShowOnboarding(false);
    setCurrentId(MY_DASHBOARD_ID);
    setEditing(false);
    setShowFirstInsight(true);
  }, []);

  const handleLandOnDashboard = useCallback((): void => {
    try {
      setShowFirstInsight(false);
      setHighlightWorkdayBanner(false);
      setHighlightTourStrip(true);
      window.setTimeout(() => {
        document.getElementById("tour-callout-strip")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 200);
    } catch (error) {
      console.error("Failed to highlight tour callout on dashboard load:", error);
    }
  }, []);

  const handleShowFirstInsight = useCallback((): void => {
    try {
      setHighlightWorkdayBanner(true);
      window.setTimeout(() => {
        document.getElementById("my-dashboard-banner")?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 150);
      window.setTimeout(() => setHighlightWorkdayBanner(false), 3200);
    } catch (error) {
      console.error("Failed to highlight first insight:", error);
    }
  }, []);

  const handleReturnToOnboarding = useCallback((): void => {
    try {
      resetOnboarding();
      clearTourState();
      setShowOnboarding(true);
      setEditing(false);
      setShowTourStrip(true);
      setTourActive(false);
      setTourStepIndex(0);
      setNavbarCreateOpen(false);
      setHighlightWorkdayBanner(false);
      setHighlightTourStrip(false);
    } catch (error) {
      console.error("Failed to return to onboarding:", error);
    }
  }, []);

  const handleStartTour = useCallback((): void => {
    try {
      setHighlightTourStrip(false);
      setShowTourStrip(false);
      setTourStepIndex(0);
      setTourActive(true);
      setNavbarCreateOpen(true);
    } catch (error) {
      console.error("Failed to start guided tour:", error);
    }
  }, []);

  const handleDismissTourStrip = useCallback((): void => {
    try {
      dismissTourCallout();
      setHighlightTourStrip(false);
      setShowTourStrip(false);
    } catch (error) {
      console.error("Failed to dismiss tour strip:", error);
    }
  }, []);

  const handleTourStepEnter = useCallback((step: TourStep): void => {
    try {
      if (step.id === "invite-member") {
        setNavbarCreateOpen(true);
        return;
      }
      setNavbarCreateOpen(false);
    } catch (error) {
      console.error("Failed to prepare tour step:", error);
    }
  }, []);

  const handleTourEnd = useCallback((completed: boolean): void => {
    try {
      markTourComplete();
      setTourActive(false);
      setTourStepIndex(0);
      setNavbarCreateOpen(false);
      if (completed) setShowTourStrip(false);
    } catch (error) {
      console.error("Failed to end guided tour:", error);
    }
  }, []);

  const shouldShowTourStrip: boolean =
    showTourStrip && !showFirstInsight && !tourActive && current.id === MY_DASHBOARD_ID;

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        dashboards={dashboards}
        currentId={current.id}
        onSelect={(id) => {
          setCurrentId(id);
          setEditing(false);
        }}
        onCreate={() => setCreateOpen(true)}
        onReturnToOnboarding={handleReturnToOnboarding}
      />
      <div className="flex min-w-0 flex-1 flex-col bg-[#f7f8fa]">
        <AppNavbar
          createOpen={navbarCreateOpen}
          onCreateOpenChange={setNavbarCreateOpen}
          highlightCreate={tourActive && tourStepIndex === 0}
        />
        <main className="thin-scrollbar flex-1 overflow-y-auto pb-14" aria-live="polite">
          <div key={current.id + String(editing)} className="animate-fade-in">
            <DashboardView
              dashboard={processedDashboard}
              editing={editing}
              ops={ops}
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
              onToggleEdit={() => setEditing((value) => !value)}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onShare={() => setShareOpen(true)}
              onCreate={() => setCreateOpen(true)}
              highlightWorkdayBanner={highlightWorkdayBanner}
              highlightTourStrip={highlightTourStrip}
              showTourCallout={shouldShowTourStrip}
              onStartTour={handleStartTour}
              onDismissTourCallout={handleDismissTourStrip}
              onUpdateWidgetVisibility={handleUpdateWidgetVisibility}
              plan={demoPlan}
            />
          </div>
        </main>
      </div>

      <FirstInsightReveal
        open={showFirstInsight && current.id === MY_DASHBOARD_ID}
        onClose={handleLandOnDashboard}
        onShowMe={handleShowFirstInsight}
      />

      <GuidedTour
        active={tourActive}
        stepIndex={tourStepIndex}
        onStepChange={setTourStepIndex}
        onEnd={handleTourEnd}
        onStepEnter={handleTourStepEnter}
      />

      <ShareDialog
        dashboard={current}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        onVisibilityChange={(v, roles) => updateCurrent((d) => ({ ...d, visibility: v, sharedRoles: roles }))}
      />
      <CreateDashboardDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreate={handleCreate} />

      <DemoBar plan={demoPlan} onPlanChange={setDemoPlan} />
    </div>
  );
}
