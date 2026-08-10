import { useState } from "react";
import { Lock, Globe } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";
import { ARCHETYPES } from "@/data/archetypes";

export interface NewDashboardInput {
  name: string;
  templateId: string;
  visibility: "private" | "public";
}

/** Create a new dashboard from a role template. */
export function CreateDashboardDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (input: NewDashboardInput) => void;
}) {
  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState(ARCHETYPES[0].id);
  const [visibility, setVisibility] = useState<"private" | "public">("private");

  function submit() {
    const tpl = ARCHETYPES.find((a) => a.id === templateId)!;
    onCreate({ name: name.trim() || `${tpl.label} Dashboard`, templateId, visibility });
    setName("");
    setTemplateId(ARCHETYPES[0].id);
    setVisibility("private");
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Create new dashboard"
      subtitle="Start from a role template — you can customize it after."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={submit}>
            Create dashboard
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[11px] font-medium text-muted">Dashboard name</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Q3 Leadership Review"
            className="h-9 w-full rounded border border-border bg-background px-3 text-sm text-ink placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-medium text-muted">Start from template</label>
          <div className="grid grid-cols-2 gap-2">
            {ARCHETYPES.map((a) => (
              <button
                key={a.id}
                onClick={() => setTemplateId(a.id)}
                className={cn(
                  "flex items-center gap-2 rounded border p-2.5 text-left transition-colors",
                  templateId === a.id ? "border-primary bg-primary/[0.05]" : "border-border hover:bg-muted/5",
                )}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded bg-primary/10 text-primary">
                  <Icon name={a.icon} className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium text-ink">{a.label}</span>
                  <span className="block truncate text-[10px] text-muted-foreground">
                    {a.widgets.length} widgets
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-medium text-muted">Visibility</label>
          <div className="grid grid-cols-2 gap-2">
            {([
              { key: "private", icon: Lock, label: "Private" },
              { key: "public", icon: Globe, label: "Public" },
            ] as const).map((o) => {
              const IconCmp = o.icon;
              return (
                <button
                  key={o.key}
                  onClick={() => setVisibility(o.key)}
                  className={cn(
                    "flex items-center gap-2 rounded border p-2.5 text-sm transition-colors",
                    visibility === o.key ? "border-primary bg-primary/[0.05] text-ink" : "border-border text-muted hover:bg-muted/5",
                  )}
                >
                  <IconCmp className="h-4 w-4" />
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
