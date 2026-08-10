import { useEffect, useState } from "react";
import {
  Lock,
  Globe,
  Plus,
  Copy,
  Trash2,
  Pencil,
  Share2,
  Check,
  RefreshCw,
  Users,
  ChevronDown,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PEOPLE, TEAMS } from "@/data/dummy";
import { cn } from "@/lib/utils";
import { InsightBanner } from "./InsightBanner";
import { MyDashboardBanner } from "./MyDashboardBanner";
import { KpiCard } from "./KpiCard";
import { BentoGrid, type GridOps } from "./BentoGrid";
import { ReportDrawer } from "./ReportDrawer";
import { Icon } from "@/components/Icon";
import type { Dashboard } from "@/types";

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
  onCreate,
  onDuplicate,
  onDelete,
  onToggleEdit,
  onShare,
  filterType,
  setFilterType,
  filterValue,
  setFilterValue,
}: {
  dashboard: Dashboard;
  editing: boolean;
  ops: GridOps;
  dateRange?: string;
  onCreate: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleEdit: () => void;
  onShare: () => void;
  filterType: "all" | "team" | "member";
  setFilterType: (type: "all" | "team" | "member") => void;
  filterValue: string;
  setFilterValue: (val: string) => void;
}) {
  const [reportKey, setReportKey] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [plan, setPlan] = useState<"pro" | "lower">("pro");

  useEffect(() => {
    setDrawerOpen(false);
  }, [dashboard.id]);

  function openReport(key?: string) {
    setReportKey(key ?? null);
    setDrawerOpen(true);
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-6">
      {/* view header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10 text-primary">
            <Icon name={dashboard.icon} className="h-5 w-5" />
          </div>
          <div>
            <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-ink">
              {dashboard.name ?? dashboard.role}
              <span className="flex items-center gap-1 rounded bg-muted/10 px-1.5 py-0.5 text-[10px] font-medium text-muted">
                {dashboard.visibility === "public" ? (
                  <>
                    <Globe className="h-3 w-3" /> Public
                  </>
                ) : (
                  <>
                    <Lock className="h-3 w-3" /> Private
                  </>
                )}
              </span>
            </h1>
            <p className="text-sm text-muted-foreground">{dashboard.description}</p>
          </div>
        </div>

        {/* Header Actions (merged from DashboardBar) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* refresh status */}
          <span className="hidden items-center gap-1 rounded border border-border bg-card px-2.5 py-1.5 text-xs text-muted md:flex">
            <RefreshCw className="h-3.5 w-3.5" />
            Auto Refresh: On
          </span>

          {/* Plan toggle (demo) */}
          <button
            onClick={() => setPlan((p) => (p === "pro" ? "lower" : "pro"))}
            className={cn(
              "hidden items-center gap-1 rounded border px-2.5 py-1.5 text-xs font-medium md:flex transition-colors",
              plan === "lower"
                ? "border-amber-400/60 bg-amber-50 text-amber-700"
                : "border-border bg-card text-muted"
            )}
          >
            {plan === "lower" ? "⚡ Lower Plan" : "✦ Pro Plan"}
          </button>

          {/* member / team filter dropdown */}
          {dashboard.id !== "my-dashboard" && (
            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-1 rounded border border-border bg-card px-2.5 py-1.5 text-xs text-muted font-medium hover:border-muted/40"
              >
                <Users className="h-3.5 w-3.5 text-primary" />
                <span>
                  {filterType === "all"
                    ? "All Members"
                    : filterType === "team"
                    ? `Team: ${filterValue}`
                    : `Member: ${filterValue}`}
                </span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </button>

              {filterOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} aria-hidden="true" />
                  <div className="absolute right-0 top-full z-50 mt-1 w-64 rounded border border-border bg-card p-2 shadow-pop flex flex-col gap-2 max-h-96 overflow-y-auto thin-scrollbar">
                    {/* Search Box */}
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search member or team..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 w-full rounded border border-border bg-background pl-7 pr-2 text-xs text-ink placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none"
                      />
                    </div>

                    {/* Options */}
                    <div className="flex flex-col gap-0.5">
                      {/* All Members option */}
                      {("all members".includes(searchQuery.toLowerCase()) || searchQuery === "") && (
                        <button
                          onClick={() => {
                            setFilterType("all");
                            setFilterValue("");
                            setFilterOpen(false);
                            setSearchQuery("");
                          }}
                          className={cn(
                            "flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs hover:bg-muted/10",
                            filterType === "all" ? "text-primary font-semibold" : "text-ink"
                          )}
                        >
                          <span>All Members</span>
                          {filterType === "all" && <Check className="h-3.5 w-3.5 text-primary" />}
                        </button>
                      )}

                      {/* Teams Section */}
                      {TEAMS.filter((t) => t.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 && (
                        <>
                          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Teams
                          </div>
                          {TEAMS.filter((t) => t.toLowerCase().includes(searchQuery.toLowerCase())).map((t) => (
                            <button
                              key={t}
                              onClick={() => {
                                setFilterType("team");
                                setFilterValue(t);
                                setFilterOpen(false);
                                setSearchQuery("");
                              }}
                              className={cn(
                                "flex w-full items-center justify-between rounded px-2.5 py-1 text-left text-xs hover:bg-muted/10 pl-4",
                                filterType === "team" && filterValue === t ? "text-primary font-semibold" : "text-ink"
                              )}
                            >
                              <span>{t}</span>
                              {filterType === "team" && filterValue === t && <Check className="h-3.5 w-3.5 text-primary" />}
                            </button>
                          ))}
                        </>
                      )}

                      {/* Individuals Section */}
                      {PEOPLE.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 && (
                        <>
                          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">
                            Individuals
                          </div>
                          {PEOPLE.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map((p) => (
                            <button
                              key={p.name}
                              onClick={() => {
                                setFilterType("member");
                                setFilterValue(p.name);
                                setFilterOpen(false);
                                setSearchQuery("");
                              }}
                              className={cn(
                                "flex w-full items-center justify-between rounded px-2.5 py-1 text-left text-xs hover:bg-muted/10 pl-4",
                                filterType === "member" && filterValue === p.name ? "text-primary font-semibold" : "text-ink"
                              )}
                            >
                              <div className="flex flex-col text-left">
                                <span className="font-medium">{p.name}</span>
                                <span className="text-[10px] text-muted-foreground">{p.role} · {p.team}</span>
                              </div>
                              {filterType === "member" && filterValue === p.name && <Check className="h-3.5 w-3.5 text-primary" />}
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {editing ? (
            <>
              <span className="hidden text-[11px] text-muted-foreground sm:inline">
                Editing layout — changes save to this dashboard
              </span>
              <Button size="sm" onClick={onToggleEdit}>
                <Check className="h-3.5 w-3.5" />
                Done
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" className="h-8 px-2.5 border-border hover:bg-muted/10" onClick={onDuplicate}>
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="hidden sm:inline ml-1 text-xs">Duplicate</span>
              </Button>
              <Button variant="outline" size="sm" className="h-8 px-2.5 border-border hover:bg-muted/10" onClick={onDelete}>
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
              <Button variant="outline" size="sm" className="h-8 px-2.5 border-border hover:bg-muted/10" onClick={onToggleEdit}>
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="hidden sm:inline ml-1 text-xs">Edit</span>
              </Button>
              {dashboard.id !== "my-dashboard" && (
                <Button size="sm" className="h-8 px-3 text-xs bg-primary hover:bg-primary/95 text-white" onClick={onShare}>
                  <Share2 className="h-3.5 w-3.5 mr-1" />
                  Share
                </Button>
              )}
              <Button variant="outline" size="sm" className="h-8 px-2.5 border-border hover:bg-muted/10" onClick={onCreate} aria-label="Create dashboard">
                <Plus className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Data storytelling */}
      {!editing && (
        <InsightBanner insights={dashboard.insights} onOpenReport={openReport} />
      )}

      {dashboard.id === "my-dashboard" && <MyDashboardBanner />}

      {/* Layer 1 — The Glance */}
      <section aria-label="Key metrics" className="space-y-2">
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
    </div>
  );
}
