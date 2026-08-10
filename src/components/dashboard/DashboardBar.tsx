import { useState } from "react";
import {
  ChevronDown,
  Lock,
  Globe,
  Plus,
  Pencil,
  Share2,
  Check,
  RefreshCw,
  Users,
  Calendar,
  Copy,
  Trash2,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";
import { PEOPLE, TEAMS } from "@/data/dummy";
import type { Dashboard } from "@/types";

/** Toolbar: dashboard switcher + filters + Edit / Share / Create actions. */
export function DashboardBar({
  dashboards,
  current,
  editing,
  onSelect,
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
  dashboards: Dashboard[];
  current: Dashboard;
  editing: boolean;
  onSelect: (id: string) => void;
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="sticky top-16 z-30 flex flex-wrap items-center gap-2 border-b border-border bg-background/90 px-6 py-2.5 backdrop-blur">
      {/* dashboard switcher */}
      <div className="relative">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          className="flex items-center gap-2 rounded border border-border bg-card px-3 py-1.5 text-sm font-semibold text-ink hover:border-muted/40"
        >
          <Icon name={current.icon} className="h-4 w-4 text-primary" />
          <span className="max-w-[220px] truncate">{current.name ?? current.role}</span>
          {current.visibility === "public" ? (
            <Globe className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden="true" />
            <div className="absolute left-0 top-full z-20 mt-1 w-72 rounded border border-border bg-card p-1 shadow-pop">
              <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                My Dashboards
              </div>
              {dashboards.map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    onSelect(d.id);
                    setMenuOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-muted/10",
                    d.id === current.id ? "text-ink" : "text-muted",
                  )}
                >
                  <Icon name={d.icon} className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="flex-1 truncate">{d.name ?? d.role}</span>
                  {d.visibility === "public" ? (
                    <Globe className="h-3 w-3 text-muted-foreground" />
                  ) : (
                    <Lock className="h-3 w-3 text-muted-foreground" />
                  )}
                  {d.id === current.id && <Check className="h-3.5 w-3.5 text-primary" />}
                </button>
              ))}
              <div className="my-1 h-px bg-border" />
              <button
                onClick={() => {
                  onCreate();
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm font-medium text-primary hover:bg-primary/10"
              >
                <Plus className="h-4 w-4" />
                Create new dashboard
              </button>
            </div>
          </>
        )}
      </div>

      {/* filter chips */}
      <span className="hidden items-center gap-1 rounded border border-border bg-card px-2.5 py-1.5 text-xs text-muted md:flex">
        <RefreshCw className="h-3.5 w-3.5" />
        Auto Refresh: On
      </span>
      {/* member / team filter dropdown */}
      {current.id !== "my-dashboard" && (
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
            <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded border border-border bg-card p-2 shadow-pop flex flex-col gap-2 max-h-96 overflow-y-auto thin-scrollbar">
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
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">
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

                {/* Members Section */}
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

      <div className="ml-auto flex items-center gap-2">
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
            <Button variant="outline" size="sm" onClick={onDuplicate}>
              <Copy className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Duplicate</span>
            </Button>
            <Button variant="outline" size="sm" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={onToggleEdit}>
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
            {current.id !== "my-dashboard" && (
              <Button size="sm" onClick={onShare}>
                <Share2 className="h-3.5 w-3.5" />
                Share
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onCreate} aria-label="Create dashboard">
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
