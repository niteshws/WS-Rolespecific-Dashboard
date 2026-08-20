import { useState } from "react";
import { Lock, Globe, Link2, Check, Copy, Users } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Dashboard } from "@/types";
import { AVAILABLE_ROLES } from "./CreateDashboardDialog";

/**
 * Share a dashboard: toggle Private/Public/Shared visibility and copy a share link.
 * All state is local to the prototype — no data leaves the browser.
 */
export function ShareDialog({
  dashboard,
  open,
  onClose,
  onVisibilityChange,
}: {
  dashboard: Dashboard;
  open: boolean;
  onClose: () => void;
  onVisibilityChange: (v: "private" | "shared", sharedRoles?: string[]) => void;
}) {
  const [copied, setCopied] = useState(false);
  const link = `https://app.workstatus.io/intelligence/d/${dashboard.id}`;

  function copy() {
    navigator.clipboard?.writeText(link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function toggleRole(r: string) {
    const currentRoles = dashboard.sharedRoles || [];
    const newRoles = currentRoles.includes(r)
      ? currentRoles.filter((x) => x !== r)
      : [...currentRoles, r];
    onVisibilityChange("shared", newRoles);
  }

  const options = [
    {
      key: "private" as const,
      icon: Lock,
      title: "Private",
      desc: "Only you and people you invite can view this dashboard.",
    },
    {
      key: "shared" as const,
      icon: Users,
      title: "Shared",
      desc: "Share with specific roles in your organization.",
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Share “${dashboard.name ?? dashboard.role}”`}
      subtitle="Choose who can access this dashboard."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Done
          </Button>
        </>
      }
    >
      <div className="space-y-2">
        {options.map((o) => {
          const active = dashboard.visibility === o.key;
          const IconCmp = o.icon;
          return (
            <button
              key={o.key}
              onClick={() => onVisibilityChange(o.key, o.key === "shared" ? (dashboard.sharedRoles || []) : undefined)}
              className={cn(
                "flex w-full items-start gap-3 rounded border p-3 text-left transition-colors",
                active ? "border-primary bg-primary/[0.05]" : "border-border hover:bg-muted/5",
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded",
                  active ? "bg-primary text-white" : "bg-muted/10 text-muted",
                )}
              >
                <IconCmp className="h-4 w-4" />
              </span>
              <span className="flex-1">
                <span className="flex items-center gap-2 text-sm font-medium text-ink">
                  {o.title}
                  {active && <Check className="h-3.5 w-3.5 text-primary" />}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{o.desc}</span>
              </span>
            </button>
          );
        })}
      </div>

      {dashboard.visibility === "shared" && (
        <div className="mt-4 border-t border-border pt-4">
          <label className="mb-2 block text-[11px] font-medium text-muted">Select roles to share with</label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_ROLES.map((role) => (
              <label
                key={role}
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                  (dashboard.sharedRoles || []).includes(role)
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-background text-ink hover:bg-muted/5"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  toggleRole(role);
                }}
              >
                {role}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* copy link */}
      <div className="mt-4 border-t border-border pt-4">
        <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-muted">
          <Link2 className="h-3.5 w-3.5" />
          Share link
        </label>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={link}
            aria-label="Share link"
            className="h-9 flex-1 rounded border border-border bg-background px-3 text-xs text-muted focus-visible:outline-none"
          />
          <Button size="sm" onClick={copy} className="shrink-0">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>

      {/* people with access (mock) */}
      <div className="mt-4 border-t border-border pt-3">
        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-muted">
          <Users className="h-3.5 w-3.5" />
          People with access
        </div>
        <div className="flex items-center gap-2">
          {["Vinove Design", "Harsh Singh", "Priya Negi"].map((n) => (
            <Avatar key={n} name={n} size={26} />
          ))}
          <span className="text-xs text-muted-foreground">
            {dashboard.visibility === "public" ? "· Workspace (view)" : 
             dashboard.visibility === "shared" ? `· ${(dashboard.sharedRoles || []).length} roles` : "· 3 people"}
          </span>
        </div>
      </div>
    </Dialog>
  );
}
