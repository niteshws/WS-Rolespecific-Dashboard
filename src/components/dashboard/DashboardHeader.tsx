import { useMemo, useState } from "react";
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  LayoutGrid,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Share2,
  Trash2,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DEPARTMENTS, PEOPLE, TEAMS } from "@/data/dummy";
import type { Dashboard } from "@/types";

type FilterTab = "members" | "teams" | "departments";

const DATE_OPTIONS = [
  { label: "Today", value: "Today" },
  { label: "Weekly", value: "This week" },
  { label: "Monthly", value: "This month" },
  { label: "Date range", value: "Custom date" },
] as const;

const formatDisplayDate = (range: string, start: string, end: string): string => {
  const fmt = (iso: string): string =>
    new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  if (range === "Custom date") {
    return `Date: ${fmt(start)} – ${fmt(end)}`;
  }

  return `Date: ${fmt(new Date().toISOString().slice(0, 10))}`;
};

type DashboardHeaderProps = {
  dashboard: Dashboard;
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
  editing: boolean;
  onToggleEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onShare: () => void;
  onCreate: () => void;
  onCustomizeWidgets: () => void;
};

export const DashboardHeader = ({
  dashboard,
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
  editing,
  onToggleEdit,
  onDuplicate,
  onDelete,
  onShare,
  onCreate,
  onCustomizeWidgets,
}: DashboardHeaderProps) => {
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [dateOpen, setDateOpen] = useState<boolean>(false);
  const [moreOpen, setMoreOpen] = useState<boolean>(false);
  const [filterTab, setFilterTab] = useState<FilterTab>("members");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const memberLabel: string = useMemo(() => {
    if (filterType === "all") return "All Members";
    return filterValue;
  }, [filterType, filterValue]);

  const filteredMembers = useMemo(
    () => PEOPLE.filter((person) => person.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery],
  );

  const filteredTeams = useMemo(
    () => TEAMS.filter((team) => team.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery],
  );

  const filteredDepartments = useMemo(
    () => DEPARTMENTS.filter((dept) => dept.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery],
  );

  const closeMenus = (): void => {
    setFilterOpen(false);
    setDateOpen(false);
    setMoreOpen(false);
  };

  const isMemberChecked = (name: string): boolean =>
    filterType === "all" || (filterType === "member" && filterValue === name);

  return (
    <div className="mx-auto max-w-[1600px]">
      <div className="flex min-h-[72px] flex-wrap items-center justify-between gap-4 py-4">
        {/* Left — title block */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f3efff] text-primary">
            <LayoutGrid className="h-4 w-4" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h1 className="text-[18px] font-semibold leading-[1.25] tracking-tight text-ink">
              {dashboard.name ?? dashboard.role}
            </h1>
            <p className="mt-0.5 max-w-xl text-[13px] leading-[1.4] text-[#6b7280]">
              {dashboard.description}
            </p>
          </div>
        </div>

        {/* Right — filter controls */}
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {dashboard.id !== "my-dashboard" ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setFilterOpen((open) => !open);
                  setDateOpen(false);
                  setMoreOpen(false);
                }}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-white px-2.5 text-[13px] font-medium leading-none text-ink transition-colors hover:border-[#d1d5db]"
              >
                <Users className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
                <span>{memberLabel}</span>
                {filterOpen ? (
                  <ChevronUp className="h-3.5 w-3.5 text-[#9ca3af]" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-[#9ca3af]" />
                )}
              </button>

              {filterOpen ? (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-40"
                    aria-label="Close member filter"
                    onClick={() => setFilterOpen(false)}
                  />
                  <div className="absolute left-0 top-full z-50 mt-2 w-[300px] overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-[0_8px_30px_rgba(17,3,2,0.12)]">
                    <div className="flex border-b border-[#e5e7eb]">
                      {(
                        [
                          { id: "members", label: "Members" },
                          { id: "teams", label: "Teams" },
                          { id: "departments", label: "Departments" },
                        ] as const
                      ).map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            setFilterTab(tab.id);
                            setSearchQuery("");
                          }}
                          className={cn(
                            "flex-1 px-3 py-2.5 text-sm font-medium transition-colors",
                            filterTab === tab.id
                              ? "border-b-2 border-primary text-primary"
                              : "text-muted-foreground hover:text-ink",
                          )}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div className="p-3">
                      <div className="relative mb-3">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(event) => setSearchQuery(event.target.value)}
                          placeholder={
                            filterTab === "members"
                              ? "Search member"
                              : filterTab === "teams"
                                ? "Search team"
                                : "Search department"
                          }
                          className="h-9 w-full rounded-lg border border-[#e5e7eb] bg-white pl-9 pr-3 text-sm text-ink placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none"
                        />
                      </div>

                      <div className="max-h-56 space-y-0.5 overflow-y-auto thin-scrollbar">
                        {filterTab === "members" ? (
                          <>
                            {(searchQuery === "" ||
                              "select all".includes(searchQuery.toLowerCase())) && (
                              <FilterCheckboxRow
                                label="Select All"
                                checked={filterType === "all"}
                                onToggle={() => {
                                  setFilterType("all");
                                  setFilterValue("");
                                  closeMenus();
                                  setSearchQuery("");
                                }}
                              />
                            )}
                            {filteredMembers.map((person) => (
                              <FilterCheckboxRow
                                key={person.name}
                                label={person.name}
                                checked={isMemberChecked(person.name)}
                                onToggle={() => {
                                  setFilterType("member");
                                  setFilterValue(person.name);
                                  closeMenus();
                                  setSearchQuery("");
                                }}
                              />
                            ))}
                          </>
                        ) : null}

                        {filterTab === "teams"
                          ? filteredTeams.map((team) => (
                              <FilterCheckboxRow
                                key={team}
                                label={team}
                                checked={filterType === "team" && filterValue === team}
                                onToggle={() => {
                                  setFilterType("team");
                                  setFilterValue(team);
                                  closeMenus();
                                  setSearchQuery("");
                                }}
                              />
                            ))
                          : null}

                        {filterTab === "departments"
                          ? filteredDepartments.map((department) => (
                              <FilterCheckboxRow
                                key={department}
                                label={department}
                                checked={filterType === "team" && filterValue === department}
                                onToggle={() => {
                                  setFilterType("team");
                                  setFilterValue(department);
                                  closeMenus();
                                  setSearchQuery("");
                                }}
                              />
                            ))
                          : null}
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          ) : null}

          <div className="relative">
            <button
              id="dashboard-date-filter"
              type="button"
              onClick={() => {
                setDateOpen((open) => !open);
                setFilterOpen(false);
                setMoreOpen(false);
              }}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-white px-2.5 text-[13px] font-medium leading-none text-ink transition-colors hover:border-[#d1d5db]"
            >
              <Calendar className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
              <span>{formatDisplayDate(dateRange, customStartDate, customEndDate)}</span>
              {dateOpen ? (
                <ChevronUp className="h-3.5 w-3.5 text-[#9ca3af]" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-[#9ca3af]" />
              )}
            </button>

            {dateOpen ? (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40"
                  aria-label="Close date filter"
                  onClick={() => setDateOpen(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-[#e5e7eb] bg-white py-1 shadow-[0_8px_30px_rgba(17,3,2,0.12)]">
                  {DATE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setDateRange(option.value);
                        setDateOpen(false);
                      }}
                      className={cn(
                        "flex w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#f3efff]",
                        dateRange === option.value
                          ? "bg-[#f3efff] font-medium text-primary"
                          : "text-ink",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            ) : null}
          </div>

          <div className="relative">
            <button
              type="button"
              aria-label="More options"
              onClick={() => {
                setMoreOpen((open) => !open);
                setFilterOpen(false);
                setDateOpen(false);
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white text-[#6b7280] transition-colors hover:border-[#d1d5db] hover:text-primary"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {moreOpen ? (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40"
                  aria-label="Close menu"
                  onClick={() => setMoreOpen(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-[#e5e7eb] bg-white py-1 shadow-[0_8px_30px_rgba(17,3,2,0.12)]">
                  {editing ? (
                    <MenuAction
                      icon={Check}
                      label="Done editing"
                      onClick={() => {
                        onToggleEdit();
                        setMoreOpen(false);
                      }}
                    />
                  ) : (
                    <>
                      <MenuAction
                        icon={Pencil}
                        label="Edit layout"
                        onClick={() => {
                          onToggleEdit();
                          setMoreOpen(false);
                        }}
                      />
                      <MenuAction
                        icon={LayoutGrid}
                        label="Customize widgets"
                        onClick={() => {
                          onCustomizeWidgets();
                          setMoreOpen(false);
                        }}
                      />
                      {dashboard.id !== "my-dashboard" ? (
                        <MenuAction
                          icon={Share2}
                          label="Share"
                          onClick={() => {
                            onShare();
                            setMoreOpen(false);
                          }}
                        />
                      ) : null}
                      <MenuAction
                        icon={Copy}
                        label="Duplicate"
                        onClick={() => {
                          onDuplicate();
                          setMoreOpen(false);
                        }}
                      />
                      <MenuAction
                        icon={Trash2}
                        label="Delete"
                        onClick={() => {
                          onDelete();
                          setMoreOpen(false);
                        }}
                      />
                      <MenuAction
                        icon={Plus}
                        label="Create dashboard"
                        onClick={() => {
                          onCreate();
                          setMoreOpen(false);
                        }}
                      />
                    </>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {dateRange === "Custom date" ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            From
            <input
              type="date"
              value={customStartDate}
              onChange={(event) => setCustomStartDate(event.target.value)}
              className="h-8 rounded-lg border border-[#e5e7eb] px-2 text-sm text-ink"
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            To
            <input
              type="date"
              value={customEndDate}
              onChange={(event) => setCustomEndDate(event.target.value)}
              className="h-8 rounded-lg border border-[#e5e7eb] px-2 text-sm text-ink"
            />
          </label>
        </div>
      ) : null}
    </div>
  );
};

const FilterCheckboxRow = ({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) => (
  <button
    type="button"
    onClick={onToggle}
    className="flex w-full items-center gap-2.5 rounded-md px-1 py-2 text-left text-sm text-ink transition-colors hover:bg-[#f9fafb]"
  >
    <span
      className={cn(
        "grid h-4 w-4 shrink-0 place-items-center rounded border transition-colors",
        checked ? "border-primary bg-primary text-white" : "border-[#d1d5db] bg-white",
      )}
    >
      {checked ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : null}
    </span>
    <span className="truncate">{label}</span>
  </button>
);

const MenuAction = ({
  icon: IconComponent,
  label,
  onClick,
}: {
  icon: typeof Pencil;
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-ink transition-colors hover:bg-[#f9fafb]"
  >
    <IconComponent className="h-4 w-4 shrink-0 text-muted-foreground" />
    {label}
  </button>
);
