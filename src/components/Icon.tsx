import {
  Crown,
  ShieldCheck,
  KanbanSquare,
  HeartPulse,
  Gauge,
  Users,
  BrainCircuit,
  UserCheck,
  AppWindow,
  AlertTriangle,
  KeyRound,
  Laptop,
  Target,
  Flame,
  Ban,
  MoonStar,
  Coffee,
  Activity,
  Clock,
  FolderKanban,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  Clock,
  FolderKanban,
  Crown,
  ShieldCheck,
  KanbanSquare,
  HeartPulse,
  Gauge,
  Users,
  BrainCircuit,
  UserCheck,
  AppWindow,
  AlertTriangle,
  KeyRound,
  Laptop,
  Target,
  Flame,
  Ban,
  MoonStar,
  Coffee,
};

export function Icon({
  name,
  className,
}: {
  name?: string;
  className?: string;
}) {
  const Cmp = (name && MAP[name]) || Activity;
  return <Cmp className={className} aria-hidden="true" />;
}
