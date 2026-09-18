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
  CalendarPlus,
  CalendarDays,
  BarChart3,
  Coins,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  Clock,
  FolderKanban,
  CalendarPlus,
  CalendarDays,
  BarChart3,
  Coins,
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
