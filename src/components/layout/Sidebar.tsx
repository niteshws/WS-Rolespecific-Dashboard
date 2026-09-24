import { useState, useEffect } from "react";
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
  Sun,
  Moon,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/Icon";
import type { Dashboard } from "@/types";

/**
 * Primary side navigation matching the dark indigo theme.
 */
export function Sidebar({
  dashboards,
  currentId,
  onSelect,
  onCreate,
  onReturnToOnboarding,
}: {
  dashboards: Dashboard[];
  currentId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onReturnToOnboarding?: () => void;
}) {
  const [intelOpen, setIntelOpen] = useState(true);

  return (
    <aside
      className="flex h-full w-64 shrink-0 flex-col border-r border-white/5 bg-[#0a0519] text-white transition-colors duration-300"
      aria-label="Primary navigation"
    >
      <div className="flex h-16 items-center gap-2 px-5 mt-2">
        <div className="flex items-center gap-2 font-bold tracking-tight text-[22px] text-white">
          <Clock className="w-6 h-6" />
          <div className="leading-none">
            <span>workstatus</span>
          </div>
        </div>
      </div>

      <nav className="thin-scrollbar flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <TopItem
          icon={LayoutDashboard}
          label="Dashboard"
          active={currentId === "my-dashboard"}
          onClick={() => onSelect("my-dashboard")}
        />

        {/* Intelligence parent */}
        <div id="sidebar-intelligence" className="pt-2">
          <div className="flex items-center justify-between px-3 pb-2 pt-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#7c8bba]">
              INTELLIGENCE
            </span>
          </div>

          <div className="space-y-0.5">
            {dashboards.map((d) => {
              const active = currentId === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => onSelect(d.id)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg py-2.5 pl-3 pr-2 text-[13px] transition-colors group",
                    active
                      ? "bg-[#1f193c] font-medium text-white"
                      : "text-[#b4accb] hover:bg-white/5 hover:text-white",
                  )}
                >
                  <Icon name={d.icon} className="h-4 w-4 shrink-0" />
                  <span className="flex-1 truncate text-left">{d.name ?? d.role}</span>
                  {d.visibility === "public" ? (
                    <ChevronRight className="h-4 w-4 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <Lock className="h-3 w-3 shrink-0 opacity-50" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-2">
          <div className="flex items-center justify-between px-3 pb-2 pt-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#7c8bba]">
              WORKSPACE
            </span>
          </div>
          <TopItem icon={FolderKanban} label="Projects" />
          <TopItem icon={Users2} label="People" hasArrow />
          <TopItem icon={Settings} label="Settings" hasArrow />
        </div>
      </nav>

      {onReturnToOnboarding ? (
        <div className="border-t border-white/10 p-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={onReturnToOnboarding}
            className="flex w-full items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-[#b4accb] transition-colors hover:bg-white/10 hover:text-white"
          >
            <RotateCcw className="h-4 w-4 shrink-0" />
            <span>Return to setup</span>
          </button>
        </div>
      ) : null}
    </aside>
  );
}

function TopItem({
  icon: Icon,
  label,
  active,
  onClick,
  hasArrow
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick?: () => void;
  hasArrow?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-colors group",
        active
          ? "bg-[#1f193c] font-medium text-white"
          : "text-[#b4accb] hover:bg-white/5 hover:text-white"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1 text-left">{label}</span>
      {hasArrow && <ChevronRight className="h-4 w-4 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />}
    </button>
  );
}
