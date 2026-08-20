import { useState, useMemo } from "react";
import { Lock, Globe, Users, Check, Search, GripHorizontal } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";
import { ARCHETYPES } from "@/data/archetypes";
import type { WidgetDescriptor } from "@/types";
import { WidgetRenderer } from "./WidgetRenderer";

export interface NewDashboardInput {
  name: string;
  templateId: string;
  visibility: "private" | "shared";
  sharedRoles?: string[];
  customWidgets?: WidgetDescriptor[];
}

export const AVAILABLE_ROLES = [
  "Owner",
  "Manager",
  "Delivery Head",
  "TL",
  "Dept Head",
  "Project Manager",
];

export function CreateDashboardDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (input: NewDashboardInput) => void;
}) {
  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState(ARCHETYPES[0].id);
  const [visibility, setVisibility] = useState<"private" | "shared">("private");
  const [sharedRoles, setSharedRoles] = useState<string[]>([]);
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([]);
  
  // Custom mode state
  const [activeCategoryId, setActiveCategoryId] = useState(ARCHETYPES[0].id);
  const [searchQuery, setSearchQuery] = useState("");

  function toggleRole(r: string) {
    setSharedRoles((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r],
    );
  }

  function toggleWidget(id: string) {
    setSelectedWidgets((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function submit() {
    let finalName = name.trim();
    if (!finalName) {
      if (templateId === "custom") {
        finalName = "Custom Dashboard";
      } else {
        const tpl = ARCHETYPES.find((a) => a.id === templateId)!;
        finalName = `${tpl.label} Dashboard`;
      }
    }

    let customWidgets: WidgetDescriptor[] = [];
    if (templateId === "custom") {
      for (const tpl of ARCHETYPES) {
        for (const w of tpl.widgets) {
          if (selectedWidgets.includes(w.id) && !customWidgets.find((x) => x.id === w.id)) {
            customWidgets.push({ ...structuredClone(w), id: `cw-${w.id}-${Date.now()}` });
          }
        }
      }
    }

    onCreate({
      name: finalName,
      templateId,
      visibility,
      sharedRoles: visibility === "shared" ? sharedRoles : undefined,
      customWidgets: templateId === "custom" ? customWidgets : undefined,
    });

    setName("");
    setTemplateId(ARCHETYPES[0].id);
    setVisibility("private");
    setSharedRoles([]);
    setSelectedWidgets([]);
    setSearchQuery("");
  }

  const isCustom = templateId === "custom";

  if (isCustom) {
    const activeArchetype = ARCHETYPES.find(a => a.id === activeCategoryId) || ARCHETYPES[0];
    const displayedWidgets = activeArchetype.widgets.filter(w => 
      w.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <Dialog
        open={open}
        onClose={onClose}
        className="max-w-[1100px] h-[85vh] overflow-hidden flex flex-col"
        contentClassName="p-0 flex-1 flex flex-col min-h-0"
        title="Create Custom Dashboard"
        footer={
          <div className="w-full flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground ml-4">
              {selectedWidgets.length} Selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setTemplateId(ARCHETYPES[0].id)}>
                Back
              </Button>
              <Button size="sm" onClick={submit} disabled={selectedWidgets.length === 0}>
                Add Widgets
              </Button>
            </div>
          </div>
        }
      >
        <div className="flex flex-1 h-full min-h-0 bg-muted/10">
          {/* Sidebar */}
          <div className="w-[260px] bg-background border-r border-border flex flex-col overflow-y-auto thin-scrollbar">
            <div className="p-4 space-y-4 border-b border-border">
              <h3 className="font-semibold text-sm flex items-center gap-2 text-ink">
                <GripHorizontal className="h-4 w-4" />
                Add Widgets
              </h3>
              <div>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dashboard Name"
                  className="h-8 w-full rounded border border-border bg-background px-2 text-xs text-ink placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none"
                />
              </div>
              <div>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as any)}
                  className="h-8 w-full rounded border border-border bg-background px-2 text-xs text-ink focus-visible:border-primary focus-visible:outline-none"
                >
                  <option value="private">Private</option>
                  <option value="shared">Shared (Roles)</option>
                </select>
              </div>
              {visibility === "shared" && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {AVAILABLE_ROLES.map((role) => (
                    <label
                      key={role}
                      className={cn(
                        "flex cursor-pointer items-center rounded border px-2 py-0.5 text-[10px] transition-colors",
                        sharedRoles.includes(role)
                          ? "border-primary bg-primary text-white"
                          : "border-border bg-background text-ink hover:bg-muted/5"
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleRole(role);
                      }}
                    >
                      {role}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="p-2 space-y-1">
              <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Categories
              </div>
              {ARCHETYPES.map(a => (
                <button
                  key={a.id}
                  onClick={() => setActiveCategoryId(a.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded px-2.5 py-2 text-xs transition-colors",
                    activeCategoryId === a.id ? "bg-primary/10 text-primary font-medium" : "text-ink hover:bg-muted/10"
                  )}
                >
                  <Icon name={a.icon} className="h-4 w-4" />
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Grid Area */}
          <div className="flex-1 flex flex-col bg-background/50 h-full min-h-0">
            {/* Topbar */}
            <div className="h-14 border-b border-border bg-background flex items-center justify-between px-6 shrink-0">
              <div className="flex items-center gap-2 text-sm font-medium text-ink">
                <Icon name={activeArchetype.icon} className="h-4 w-4 text-primary" />
                {activeArchetype.label}
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search widgets..."
                  className="h-8 w-64 rounded-full border border-border bg-muted/10 pl-8 pr-3 text-xs text-ink placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none"
                />
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1 p-6 overflow-y-auto thin-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedWidgets.map(w => {
                  const isSelected = selectedWidgets.includes(w.id);
                  return (
                    <div
                      key={w.id}
                      onClick={() => toggleWidget(w.id)}
                      className={cn(
                        "flex flex-col cursor-pointer rounded-xl border transition-all overflow-hidden bg-card relative group hover:shadow-md",
                        isSelected ? "border-primary shadow-sm" : "border-border hover:border-primary/40"
                      )}
                    >
                      {/* Top Preview */}
                      <div className="h-36 bg-gradient-to-br from-primary/5 to-primary/10 relative overflow-hidden flex items-center justify-center border-b border-border/50">
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
                          <div className="w-[160%] h-[160%] origin-center scale-[0.6] flex items-center justify-center opacity-90 transition-transform group-hover:scale-[0.62]">
                            <div className="w-full max-w-[450px]">
                              {/* Using the real renderer, scaled down */}
                              <WidgetRenderer widget={w} />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Bottom Info */}
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="text-[13px] font-semibold text-ink line-clamp-1">{w.title}</h3>
                        <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">
                          {w.subtitle || `Detailed insights and metrics for ${w.title.toLowerCase()}.`}
                        </p>
                      </div>

                      {/* Checkmark */}
                      {isSelected && (
                        <div className="absolute bottom-4 right-4 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white shadow">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {displayedWidgets.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <Search className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-sm">No widgets found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Dialog>
    );
  }

  // STANDARD TEMPLATE SELECTOR VIEW
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Create new dashboard"
      subtitle="Start from a role template or build a custom one."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={submit}>
            Create dashboard
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[11px] font-medium text-muted">Dashboard name</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Q3 Leadership Review"
            className="h-9 w-full rounded border border-border bg-background px-3 text-sm text-ink placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-medium text-muted">Start from template</label>
          <div className="grid grid-cols-2 gap-2">
            {ARCHETYPES.map((a) => (
              <button
                key={a.id}
                onClick={() => setTemplateId(a.id)}
                className={cn(
                  "flex items-center gap-2 rounded border p-2.5 text-left transition-colors",
                  templateId === a.id ? "border-primary bg-primary/[0.05]" : "border-border hover:bg-muted/5",
                )}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                  <Icon name={a.icon} className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium text-ink">{a.label}</span>
                  <span className="block truncate text-[10px] text-muted-foreground">
                    {a.widgets.length} widgets
                  </span>
                </span>
              </button>
            ))}
            <button
              onClick={() => {
                setTemplateId("custom");
                setActiveCategoryId(ARCHETYPES[0].id);
              }}
              className={cn(
                "flex items-center gap-2 rounded border p-2.5 text-left transition-colors",
                templateId === "custom" ? "border-primary bg-primary/[0.05]" : "border-border hover:bg-muted/5",
              )}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                <Icon name="Settings2" className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-medium text-ink">Custom Dashboard</span>
                <span className="block truncate text-[10px] text-muted-foreground">
                  Select widgets
                </span>
              </span>
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-medium text-muted">Visibility</label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { key: "private", icon: Lock, label: "Private" },
              { key: "shared", icon: Users, label: "Shared" },
            ] as const).map((o) => {
              const IconCmp = o.icon;
              return (
                <button
                  key={o.key}
                  onClick={() => setVisibility(o.key)}
                  className={cn(
                    "flex items-center gap-1.5 justify-center rounded border p-2 text-sm transition-colors",
                    visibility === o.key ? "border-primary bg-primary/[0.05] text-ink" : "border-border text-muted hover:bg-muted/5",
                  )}
                >
                  <IconCmp className="h-4 w-4 shrink-0" />
                  <span className="text-xs">{o.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {visibility === "shared" && (
          <div className="border-t border-border pt-4 mt-4">
            <label className="mb-1.5 block text-[11px] font-medium text-muted">Share with roles</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_ROLES.map((role) => (
                <label
                  key={role}
                  className={cn(
                    "flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                    sharedRoles.includes(role)
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-background text-ink hover:bg-muted/5"
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleRole(role);
                  }}
                >
                  {role}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
