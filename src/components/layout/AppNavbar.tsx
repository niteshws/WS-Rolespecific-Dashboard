import { useState, type ReactNode } from "react";
import {
  Bell,
  ChevronDown,
  CircleHelp,
  Clock,
  ListChecks,
  Plus,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AppNavbarProps = {
  trialDaysLeft?: number;
  createOpen?: boolean;
  onCreateOpenChange?: (open: boolean) => void;
  highlightCreate?: boolean;
};

type CreateMenuItem = {
  id: string;
  label: string;
  icon: LucideIcon;
};

const CREATE_MENU_ITEMS: CreateMenuItem[] = [
  { id: "task", label: "Task", icon: ListChecks },
  { id: "manual-time", label: "Manual Time", icon: Clock },
  { id: "new-member", label: "New Member", icon: UserPlus },
];

export const AppNavbar = ({
  trialDaysLeft = 7,
  createOpen: createOpenProp,
  onCreateOpenChange,
  highlightCreate = false,
}: AppNavbarProps) => {
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [createOpenInternal, setCreateOpenInternal] = useState<boolean>(false);
  const createOpen: boolean = createOpenProp ?? createOpenInternal;

  const setCreateOpen = (open: boolean): void => {
    if (onCreateOpenChange) {
      onCreateOpenChange(open);
      return;
    }
    setCreateOpenInternal(open);
  };

  const closeAllMenus = (): void => {
    setProfileOpen(false);
    setCreateOpen(false);
  };

  const handleCreateItemClick = (id: string): void => {
    try {
      console.info(`Create action selected: ${id}`);
      setCreateOpen(false);
    } catch (error) {
      console.error("Failed to handle create menu action:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 flex h-12 shrink-0 items-center justify-end border-b border-[#e5e7eb] bg-white px-6">
      <div className="flex shrink-0 items-center gap-2.5">
        <p className="hidden text-[12px] font-normal leading-none text-[#e11d48] sm:block">
          Trial expires in {trialDaysLeft} Days
        </p>

        <button
          type="button"
          className="h-7 rounded-full bg-gradient-to-r from-[#ec4899] to-[#f97316] px-4 text-[13px] font-semibold leading-none text-white transition-opacity hover:opacity-95"
        >
          Upgrade
        </button>

        <span className="hidden h-5 w-px bg-[#e5e7eb] sm:block" aria-hidden="true" />

        <div className="flex items-center gap-0.5">
          <NavbarIconButton label="Notifications">
            <Bell className="h-4 w-4" strokeWidth={1.75} />
          </NavbarIconButton>
          <NavbarIconButton label="Help">
            <CircleHelp className="h-4 w-4" strokeWidth={1.75} />
          </NavbarIconButton>

          <div className="relative" id="navbar-create-btn">
            <NavbarIconButton
              label="Create"
              onClick={() => {
                setCreateOpen(!createOpen);
                setProfileOpen(false);
              }}
              className={highlightCreate ? "ring-2 ring-[#8b6cff] ring-offset-2" : undefined}
            >
              <Plus className="h-4 w-4" strokeWidth={1.75} />
            </NavbarIconButton>

            {createOpen ? (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40"
                  aria-label="Close create menu"
                  onClick={() => setCreateOpen(false)}
                />
                <div
                  role="menu"
                  className="absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-lg border border-[#e5e7eb] bg-white py-1 shadow-[0_8px_24px_rgba(17,3,2,0.12)]"
                >
                  {CREATE_MENU_ITEMS.map((item) => (
                    <CreateMenuItemRow
                      key={item.id}
                      icon={item.icon}
                      label={item.label}
                      onClick={() => handleCreateItemClick(item.id)}
                    />
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>

        <span className="hidden h-5 w-px bg-[#e5e7eb] sm:block" aria-hidden="true" />

        <div className="relative">
          <button
            type="button"
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            onClick={() => {
              setProfileOpen((open) => !open);
              setCreateOpen(false);
            }}
            className="flex items-center gap-1 rounded-md py-0.5 pl-0.5 pr-1 transition-colors hover:bg-[#f9fafb]"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[#f3f4f6] text-[12px] font-semibold text-[#e11d48]">
              S
            </span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-[#9ca3af] transition-transform",
                profileOpen && "rotate-180",
              )}
            />
          </button>

          {profileOpen ? (
            <>
              <button
                type="button"
                className="fixed inset-0 z-40"
                aria-label="Close profile menu"
                onClick={closeAllMenus}
              />
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-[#e5e7eb] bg-white py-1 shadow-[0_8px_30px_rgba(17,3,2,0.12)]"
              >
                <div className="border-b border-[#e5e7eb] px-3 py-2.5">
                  <p className="text-[12px] font-semibold text-ink">sept</p>
                  <p className="text-[10px] text-muted-foreground">Admin</p>
                </div>
                <ProfileMenuItem label="Account settings" onClick={closeAllMenus} />
                <ProfileMenuItem label="Billing" onClick={closeAllMenus} />
                <ProfileMenuItem label="Sign out" onClick={closeAllMenus} />
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
};

const NavbarIconButton = ({
  label,
  onClick,
  children,
  className,
}: {
  label: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    className={cn(
      "grid h-8 w-8 place-items-center rounded-full text-[#374151] transition-colors hover:bg-[#f3f4f6]",
      className,
    )}
  >
    {children}
  </button>
);

const CreateMenuItemRow = ({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    role="menuitem"
    onClick={onClick}
    className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] font-normal text-[#111827] transition-colors hover:bg-[#f9fafb]"
  >
    <Icon className="h-4 w-4 shrink-0 text-[#374151]" strokeWidth={1.75} />
    {label}
  </button>
);

const ProfileMenuItem = ({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    role="menuitem"
    onClick={onClick}
    className="flex w-full px-3 py-1.5 text-left text-[12px] text-ink transition-colors hover:bg-[#f9fafb]"
  >
    {label}
  </button>
);
