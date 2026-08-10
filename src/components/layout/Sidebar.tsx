import { useState } from "react";
import {
  LayoutDashboard,
  Clock,
  FolderKanban,
  Users2,
  Settings,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Plus,
  Lock,
  Globe,
  FileBarChart,
  CalendarClock,
  Bell,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/Icon";
import type { Dashboard } from "@/types";

/**
 * Primary side navigation. The top-level "Intelligence" parent nests every
 * saved dashboard plus reporting links, per the new information architecture.
 */
export function Sidebar({
  dashboards,
  currentId,
  onSelect,
  onCreate,
}: {
  dashboards: Dashboard[];
  currentId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
}) {
  const [intelOpen, setIntelOpen] = useState(true);

  return (
    <aside
      className="flex h-full w-64 shrink-0 flex-col border-r border-white/10 bg-ink text-white/80"
      aria-label="Primary navigation"
    >
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
          <Clock className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-white">workstatus</div>
          <div className="text-[10px] text-white/40">Work Intelligence</div>
        </div>
      </div>

      <nav className="thin-scrollbar flex-1 space-y-1 overflow-y-auto p-3">
        <TopItem 
          icon={LayoutDashboard} 
          label="My dashboard" 
          active={currentId === "my-dashboard"}
          onClick={() => onSelect("my-dashboard")}
        />

        {/* Intelligence parent */}
        <div>
          <button
            onClick={() => setIntelOpen((o) => !o)}
            aria-expanded={intelOpen}
            className="flex w-full items-center gap-2 rounded bg-primary/15 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/25"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="flex-1 text-left">Intelligence</span>
            <span className="rounded bg-primary/30 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
              New
            </span>
            {intelOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>

          {intelOpen && (
            <div className="mt-1 space-y-0.5 pl-3">
              <div className="flex items-center justify-between px-3 pb-1 pt-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30">
                  Dashboards
                </span>
                <button
                  onClick={onCreate}
                  aria-label="Create new dashboard"
                  className="rounded p-0.5 text-white/40 hover:bg-white/10 hover:text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              {dashboards.map((d) => {
                const active = currentId === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => onSelect(d.id)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex w-full items-center gap-2 rounded border-l-2 py-1.5 pl-3 pr-2 text-[13px] transition-colors",
                      active
                        ? "border-primary bg-white/[0.06] font-medium text-white"
                        : "border-transparent text-white/60 hover:bg-white/[0.04] hover:text-white",
                    )}
                  >
                    <Icon name={d.icon} className="h-3.5 w-3.5 shrink-0" />
                    <span className="flex-1 truncate text-left">{d.name ?? d.role}</span>
                    {d.visibility === "public" ? (
                      <Globe className="h-3 w-3 shrink-0 text-white/40" />
                    ) : (
                      <Lock className="h-3 w-3 shrink-0 text-white/40" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="pt-2">
          <TopItem icon={Clock} label="Time Tracking" />
          <TopItem icon={FolderKanban} label="Projects" />
          <TopItem icon={Users2} label="Team" />
          <TopItem icon={Settings} label="Settings" />
        </div>
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-2 rounded bg-white/[0.04] p-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/20 text-xs font-semibold text-white">
            VN
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-xs font-medium text-white">Vinove Design</div>
            <div className="truncate text-[10px] text-white/40">design@vinove.com</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function TopItem({ 
  icon: Icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: LucideIcon; 
  label: string; 
  active?: boolean; 
  onClick?: () => void; 
}) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded px-3 py-2 text-sm transition-colors border-l-2",
        active 
          ? "border-primary bg-white/[0.06] font-medium text-white" 
          : "border-transparent text-white/60 hover:bg-white/[0.05] hover:text-white"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </button>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-white/30">
      {children}
    </div>
  );
}

function SubLink({ icon: Icon, label, badge }: { icon: LucideIcon; label: string; badge?: string }) {
  return (
    <button className="flex w-full items-center gap-2 rounded border-l-2 border-transparent py-1.5 pl-3 pr-2 text-[13px] text-white/60 transition-colors hover:bg-white/[0.04] hover:text-white">
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="flex-1 truncate text-left">{label}</span>
      {badge && (
        <span className="rounded bg-health-bad/80 px-1.5 py-0.5 text-[9px] font-semibold text-white">{badge}</span>
      )}
    </button>
  );
}
