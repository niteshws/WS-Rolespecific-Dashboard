import { useMemo, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { ShareDialog } from "@/components/dashboard/ShareDialog";
import {
  CreateDashboardDialog,
  type NewDashboardInput,
} from "@/components/dashboard/CreateDashboardDialog";
import { SIZE_ORDER, type GridOps } from "@/components/dashboard/BentoGrid";
import { ARCHETYPES, ARCHETYPE_MAP } from "@/data/archetypes";
import type { Dashboard, WidgetSize } from "@/types";

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
  const [currentId, setCurrentId] = useState<string>(dashboards[0].id);
  const [editing, setEditing] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const [dateRange, setDateRange] = useState("This week");
  const [customStartDate, setCustomStartDate] = useState("2026-08-01");
  const [customEndDate, setCustomEndDate] = useState("2026-08-07");

  const [filterType, setFilterType] = useState<"all" | "team" | "member">("all");
  const [filterValue, setFilterValue] = useState<string>("");

  const current = useMemo(() => {
    if (currentId === "my-dashboard") return MY_DASHBOARD;
    return dashboards.find((d) => d.id === currentId) ?? dashboards[0];
  }, [dashboards, currentId]);

  const processedDashboard = useMemo(() => {
    return getFilteredDashboard(current, dateRange, customStartDate, customEndDate, filterType, filterValue);
  }, [current, dateRange, customStartDate, customEndDate, filterType, filterValue]);

  /** Apply an update to the currently-selected dashboard. */
  function updateCurrent(fn: (d: Dashboard) => Dashboard) {
    setDashboards((prev) => prev.map((d) => (d.id === current.id ? fn(structuredClone(d)) : d)));
  }

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
    const tpl = ARCHETYPE_MAP[input.templateId];
    const fresh: Dashboard = {
      ...structuredClone(tpl),
      id: nextId(),
      name: input.name,
      visibility: input.visibility,
      templateId: input.templateId,
    };
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
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar 
          dashboard={processedDashboard}
          dateRange={dateRange}
          setDateRange={setDateRange}
          customStartDate={customStartDate}
          setCustomStartDate={setCustomStartDate}
          customEndDate={customEndDate}
          setCustomEndDate={setCustomEndDate}
        />
        <main className="thin-scrollbar flex-1 overflow-y-auto" aria-live="polite">
          <div key={current.id + String(editing)} className="animate-fade-in">
            <DashboardView 
              dashboard={processedDashboard} 
              editing={editing} 
              ops={ops} 
              dateRange={dateRange}
              onCreate={() => setCreateOpen(true)}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onToggleEdit={() => setEditing((e) => !e)}
              onShare={() => setShareOpen(true)}
              filterType={filterType}
              setFilterType={setFilterType}
              filterValue={filterValue}
              setFilterValue={setFilterValue}
            />
          </div>
        </main>
      </div>

      <ShareDialog
        dashboard={current}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        onVisibilityChange={(v) => updateCurrent((d) => ({ ...d, visibility: v }))}
      />
      <CreateDashboardDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreate={handleCreate} />
    </div>
  );
}
