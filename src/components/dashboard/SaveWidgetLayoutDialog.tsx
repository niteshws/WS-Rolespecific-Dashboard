import { useEffect, useState } from "react";
import { User, Users } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type WidgetLayoutSaveScope = "personal" | "everyone";

export type WidgetLayoutSavePayload = {
  scope: WidgetLayoutSaveScope;
  viewName?: string;
};

type SaveOption = {
  scope: WidgetLayoutSaveScope;
  icon: typeof User;
  title: string;
  description: string;
};

const SAVE_OPTIONS: SaveOption[] = [
  {
    scope: "personal",
    icon: User,
    title: "Just for me",
    description: "Only you will see this layout",
  },
  {
    scope: "everyone",
    icon: Users,
    title: "For everyone",
    description: "Create a shared view for the org",
  },
];

type SaveWidgetLayoutDialogProps = {
  open: boolean;
  onClose: () => void;
  onSave: (payload: WidgetLayoutSavePayload) => void;
};

export const SaveWidgetLayoutDialog = ({
  open,
  onClose,
  onSave,
}: SaveWidgetLayoutDialogProps) => {
  const [scope, setScope] = useState<WidgetLayoutSaveScope>("personal");
  const [viewName, setViewName] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    setScope("personal");
    setViewName("");
  }, [open]);

  const canSave: boolean =
    scope === "personal" || viewName.trim().length > 0;

  const handleSave = (): void => {
    if (!canSave) return;
    try {
      onSave({
        scope,
        viewName: scope === "everyone" ? viewName.trim() : undefined,
      });
    } catch (error) {
      console.error("Failed to save widget layout:", error);
    }
  };

  const handleClose = (): void => {
    try {
      onClose();
    } catch (error) {
      console.error("Failed to close save widget layout dialog:", error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      className="max-w-[440px] rounded-xl border-[#e5e7eb] shadow-[0_20px_50px_rgba(15,10,46,0.14)]"
      contentClassName="px-6 py-5"
      title={
        <h2 className="text-[17px] font-semibold leading-tight tracking-[-0.01em] text-ink">
          Save widget layout
        </h2>
      }
    >
      <p className="text-[13px] leading-snug text-[#6b7280]">
        Do you want to save for you or for everyone?
      </p>

      <div className="mt-4 space-y-2.5">
        {SAVE_OPTIONS.map((option) => {
          const active: boolean = scope === option.scope;
          const Icon = option.icon;

          return (
            <button
              key={option.scope}
              type="button"
              onClick={() => setScope(option.scope)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-colors",
                active
                  ? "border-primary bg-[#f8f6ff]"
                  : "border-[#e5e7eb] bg-white hover:bg-[#fafbff]",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                  active ? "bg-primary text-white" : "bg-[#f3f4f6] text-[#9ca3af]",
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold text-ink">{option.title}</span>
                <span className="mt-0.5 block text-[12px] leading-snug text-[#6b7280]">
                  {option.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {scope === "everyone" ? (
        <div className="mt-4">
          <label htmlFor="widget-layout-view-name" className="block text-[13px] font-medium text-ink">
            View name
          </label>
          <input
            id="widget-layout-view-name"
            type="text"
            value={viewName}
            onChange={(event) => setViewName(event.target.value)}
            placeholder="e.g. Executive overview"
            className="mt-1.5 h-10 w-full rounded-lg border border-primary bg-white px-3 text-[13px] text-ink placeholder:text-[#9ca3af] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/15"
          />
          <p className="mt-1.5 text-[12px] leading-snug text-[#6b7280]">
            This name will appear in saved dashboard views.
          </p>
        </div>
      ) : null}

      <div className="mt-6 flex items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="h-9 rounded-lg bg-primary px-4 text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(93,43,255,0.2)] transition-colors hover:bg-[#4d1fe0] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save
        </button>
        <button
          type="button"
          onClick={handleClose}
          className="h-9 rounded-lg border border-[#e5e7eb] bg-white px-4 text-[13px] font-semibold text-[#374151] transition-colors hover:bg-[#f9fafb]"
        >
          Cancel
        </button>
      </div>
    </Dialog>
  );
};
