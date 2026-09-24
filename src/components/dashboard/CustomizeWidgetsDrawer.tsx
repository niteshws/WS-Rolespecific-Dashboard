import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, Search } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { WidgetDescriptor } from "@/types";

export const isWidgetRequired = (widget: WidgetDescriptor): boolean =>
  widget.required === true || (widget.type === "dataTable" && widget.size === "full-tall");

type WidgetVisibilityDraft = Record<string, boolean>;

type CustomizeWidgetsDrawerProps = {
  open: boolean;
  widgets: WidgetDescriptor[];
  onClose: () => void;
  onSave: (visibility: WidgetVisibilityDraft) => void;
};

export const CustomizeWidgetsDrawer = ({
  open,
  widgets,
  onClose,
  onSave,
}: CustomizeWidgetsDrawerProps) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [draft, setDraft] = useState<WidgetVisibilityDraft>({});

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

  const handleSave = (): void => {
    try {
      onSave(draft);
      onClose();
    } catch (error) {
      console.error("Failed to save widget layout:", error);
    }
  };

  const handleCancel = (): void => {
    try {
      onClose();
    } catch (error) {
      console.error("Failed to cancel widget customization:", error);
    }
  };

  return (
    <Sheet
      open={open}
      onClose={handleCancel}
      widthClass="w-full max-w-[400px]"
      contentClassName="pt-0 pb-0"
      title={
        <div className="flex items-center gap-2.5">
          <LayoutGrid className="h-[18px] w-[18px] shrink-0 text-primary" strokeWidth={2} />
          <h2 className="text-[18px] font-semibold leading-none tracking-[-0.01em] text-ink">
            Customize widgets
          </h2>
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="h-9 rounded-[10px] bg-primary px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[#4d1fe0]"
          >
            Save layout
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="h-9 rounded-[10px] border border-[#e5e7eb] bg-white px-5 text-[14px] font-semibold text-[#374151] transition-colors hover:bg-[#f9fafb]"
          >
            Cancel
          </button>
        </div>
      }
    >
      <div className="pb-3">
        <div className="space-y-3.5 pt-4">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#9ca3af]"
              strokeWidth={1.5}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search widgets..."
              className="h-10 w-full rounded-[10px] border border-[#e5e7eb] bg-white pl-10 pr-4 text-[14px] text-ink placeholder:text-[#9ca3af] focus-visible:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/15"
            />
          </div>

          <div className="flex items-center gap-2.5 text-[14px] font-semibold leading-none">
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
        </div>

        <div className="mt-4">
          {filteredWidgets.map((widget) => {
            const required: boolean = isWidgetRequired(widget);
            const visible: boolean = draft[widget.id] ?? !widget.hidden;

            return (
              <div
                key={widget.id}
                className="flex items-center justify-between gap-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={cn(
                      "truncate text-[14px] leading-none",
                      required ? "text-[#9ca3af]" : "font-normal text-ink",
                    )}
                  >
                    {widget.title}
                  </span>
                  {required ? (
                    <span className="shrink-0 rounded bg-[#f3efff] px-1.5 py-0.5 text-[11px] font-medium leading-none text-[#5d2bff]">
                      Required
                    </span>
                  ) : null}
                </div>
                <WidgetToggle
                  checked={visible}
                  disabled={required}
                  onChange={() => handleToggle(widget)}
                  label={`Toggle ${widget.title}`}
                />
              </div>
            );
          })}

          {filteredWidgets.length === 0 ? (
            <p className="py-10 text-center text-[13px] text-[#9ca3af]">No widgets match your search.</p>
          ) : null}
        </div>
      </div>
    </Sheet>
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
      "inline-flex h-5 w-9 shrink-0 items-center rounded-full p-[2px] transition-colors duration-200",
      disabled ? "cursor-not-allowed" : "cursor-pointer",
      checked
        ? disabled
          ? "bg-primary/35"
          : "bg-primary"
        : "bg-[#d1d5db]",
    )}
  >
    <span
      className={cn(
        "block h-3.5 w-3.5 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.18)] transition-transform duration-200 ease-out",
        checked ? "translate-x-4" : "translate-x-0",
      )}
    />
  </button>
);
