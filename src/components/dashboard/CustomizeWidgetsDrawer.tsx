import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, Search } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { InfoTip } from "@/components/ui/InfoTip";
import { cn } from "@/lib/utils";
import type { WidgetDescriptor } from "@/types";
import {
  SaveWidgetLayoutDialog,
  type WidgetLayoutSavePayload,
} from "@/components/dashboard/SaveWidgetLayoutDialog";

export const isWidgetRequired = (widget: WidgetDescriptor): boolean =>
  widget.required === true || (widget.type === "dataTable" && widget.size === "full-tall");

type WidgetVisibilityDraft = Record<string, boolean>;

export type WidgetLayoutSaveResult = WidgetLayoutSavePayload & {
  visibility: WidgetVisibilityDraft;
};

type CustomizeWidgetsDrawerProps = {
  open: boolean;
  widgets: WidgetDescriptor[];
  onClose: () => void;
  onSave: (result: WidgetLayoutSaveResult) => void;
};

export const CustomizeWidgetsDrawer = ({
  open,
  widgets,
  onClose,
  onSave,
}: CustomizeWidgetsDrawerProps) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [draft, setDraft] = useState<WidgetVisibilityDraft>({});
  const [saveDialogOpen, setSaveDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!open) return;
    const initial: WidgetVisibilityDraft = {};
    widgets.forEach((widget) => {
      initial[widget.id] = !widget.hidden;
    });
    setDraft(initial);
    setSearchQuery("");
  }, [open, widgets]);

  const filteredWidgets = useMemo(() => {
    const query: string = searchQuery.trim().toLowerCase();
    if (!query) return widgets;
    return widgets.filter((widget) => widget.title.toLowerCase().includes(query));
  }, [searchQuery, widgets]);

  const visibleCount: number = useMemo(
    () => widgets.filter((widget) => draft[widget.id] ?? !widget.hidden).length,
    [draft, widgets],
  );

  const handleToggle = (widget: WidgetDescriptor): void => {
    if (isWidgetRequired(widget)) return;
    try {
      setDraft((prev) => ({
        ...prev,
        [widget.id]: !prev[widget.id],
      }));
    } catch (error) {
      console.error("Failed to toggle widget visibility:", error);
    }
  };

  const handleShowAll = (): void => {
    try {
      setDraft((prev) => {
        const next: WidgetVisibilityDraft = { ...prev };
        widgets.forEach((widget) => {
          next[widget.id] = true;
        });
        return next;
      });
    } catch (error) {
      console.error("Failed to show all widgets:", error);
    }
  };

  const handleHideAll = (): void => {
    try {
      setDraft((prev) => {
        const next: WidgetVisibilityDraft = { ...prev };
        widgets.forEach((widget) => {
          next[widget.id] = isWidgetRequired(widget) ? true : false;
        });
        return next;
      });
    } catch (error) {
      console.error("Failed to hide all widgets:", error);
    }
  };

  const handleOpenSaveDialog = (): void => {
    try {
      setSaveDialogOpen(true);
    } catch (error) {
      console.error("Failed to open save widget layout dialog:", error);
    }
  };

  const handleConfirmSave = (payload: WidgetLayoutSavePayload): void => {
    try {
      onSave({ ...payload, visibility: draft });
      setSaveDialogOpen(false);
      onClose();
    } catch (error) {
      console.error("Failed to save widget layout:", error);
    }
  };

  const handleCloseSaveDialog = (): void => {
    try {
      setSaveDialogOpen(false);
    } catch (error) {
      console.error("Failed to close save widget layout dialog:", error);
    }
  };

  const handleCancel = (): void => {
    try {
      if (saveDialogOpen) {
        setSaveDialogOpen(false);
        return;
      }
      onClose();
    } catch (error) {
      console.error("Failed to cancel widget customization:", error);
    }
  };

  return (
    <>
    <Sheet
      open={open}
      onClose={handleCancel}
      scrollBody={false}
      widthClass="w-full max-w-[420px]"
      headerClassName="px-6 py-5"
      contentClassName="flex flex-col px-0 py-0"
      footerClassName="px-6 py-4"
      title={
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f3efff] text-primary">
            <LayoutGrid className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-1.5">
              <h2 className="text-[17px] font-semibold leading-tight tracking-[-0.01em] text-ink">
                Customize widgets
              </h2>
              <InfoTip
                content="Choose which widgets appear on this dashboard."
                className="text-[#9ca3af] hover:text-[#6b7280]"
              />
            </div>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleCancel}
            className="h-9 rounded-lg border border-[#e5e7eb] bg-white px-4 text-[13px] font-semibold text-[#374151] transition-colors hover:bg-[#f9fafb]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleOpenSaveDialog}
            className="h-9 rounded-lg bg-primary px-4 text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(93,43,255,0.2)] transition-colors hover:bg-[#4d1fe0]"
          >
            Save layout
          </button>
        </div>
      }
    >
      <div className="z-10 shrink-0 border-b border-[#e5e7eb] bg-white px-6 py-4">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]"
            strokeWidth={1.75}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search widgets..."
            className="h-10 w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] pl-9 pr-3 text-[13px] text-ink placeholder:text-[#9ca3af] focus-visible:border-primary focus-visible:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/15"
          />
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[13px] font-medium">
            <button
              type="button"
              onClick={handleShowAll}
              className="text-primary transition-colors hover:text-[#4d1fe0]"
            >
              Show all
            </button>
            <span className="text-[#d1d5db]" aria-hidden="true">
              |
            </span>
            <button
              type="button"
              onClick={handleHideAll}
              className="text-primary transition-colors hover:text-[#4d1fe0]"
            >
              Hide all
            </button>
          </div>
          <span className="shrink-0 text-[12px] tabular text-[#6b7280]">
            {visibleCount} of {widgets.length} visible
          </span>
        </div>
      </div>

      <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto px-6 py-4">
        {filteredWidgets.length === 0 ? (
          <p className="py-12 text-center text-[13px] text-[#9ca3af]">No widgets match your search.</p>
        ) : (
          <ul className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
            {filteredWidgets.map((widget, index) => {
              const required: boolean = isWidgetRequired(widget);
              const visible: boolean = draft[widget.id] ?? !widget.hidden;

              return (
                <li
                  key={widget.id}
                  className={cn(index > 0 && "border-t border-[#eef0f4]")}
                >
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3.5 py-3",
                      required ? "bg-[#fafafa]" : "hover:bg-[#fafbff]",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggle(widget)}
                      disabled={required}
                      className={cn(
                        "min-w-0 flex-1 text-left",
                        required ? "cursor-default" : "cursor-pointer",
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          className={cn(
                            "truncate text-[13px] font-medium leading-snug",
                            required ? "text-[#6b7280]" : "text-ink",
                          )}
                        >
                          {widget.title}
                        </span>
                        {required ? (
                          <span className="shrink-0 rounded-full bg-[#f3efff] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-[#5d2bff]">
                            Required
                          </span>
                        ) : null}
                      </span>
                    </button>
                    <WidgetToggle
                      checked={visible}
                      disabled={required}
                      onChange={() => handleToggle(widget)}
                      label={`Toggle ${widget.title}`}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

    </Sheet>

    <SaveWidgetLayoutDialog
      open={saveDialogOpen}
      onClose={handleCloseSaveDialog}
      onSave={handleConfirmSave}
    />
  </>
  );
};

const WidgetToggle = ({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  label: string;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={onChange}
    className={cn(
      "relative inline-flex h-[22px] w-[38px] shrink-0 items-center rounded-full transition-colors duration-200",
      disabled ? "cursor-not-allowed" : "cursor-pointer",
      checked
        ? disabled
          ? "bg-primary/30"
          : "bg-primary"
        : "bg-[#d1d5db]",
    )}
  >
    <span
      className={cn(
        "absolute left-[2px] block h-[18px] w-[18px] rounded-full bg-white shadow-[0_1px_3px_rgba(15,10,46,0.18)] transition-transform duration-200 ease-out",
        checked ? "translate-x-4" : "translate-x-0",
      )}
    />
  </button>
);
