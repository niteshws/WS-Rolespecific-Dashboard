import { useState } from "react";
import { Search, Bell, Calendar, ChevronRight, Filter, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";
import type { Dashboard } from "@/types";

/** Top app bar: breadcrumb into the active Intelligence view + date range dropdown + filters. */
export function Topbar({ 
  dashboard,
  dateRange,
  setDateRange,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
}: { 
  dashboard: Dashboard;
  dateRange: string;
  setDateRange: (val: string) => void;
  customStartDate: string;
  setCustomStartDate: (val: string) => void;
  customEndDate: string;
  setCustomEndDate: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-border bg-card/80 px-6 backdrop-blur">
      {/* breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
        <span className="font-medium text-primary">Intelligence</span>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="flex items-center gap-1.5 font-semibold text-ink">
          <Icon name={dashboard.icon} className="h-3.5 w-3.5 text-muted" />
          {dashboard.name ?? dashboard.role}
        </span>
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search metrics, people, apps…"
            aria-label="Search"
            className="h-9 w-64 rounded border border-border bg-background pl-8 pr-3 text-sm text-ink placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none"
          />
        </div>

        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-health-bad" />
        </Button>
      </div>
    </header>
  );
}
