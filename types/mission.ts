import { TodoistColor } from "./index";

export type MissionHealthStatus = "healthy" | "watch" | "critical" | "done" | "idle";

export type MissionKanbanStatus = "backlog" | "in_progress" | "blocked" | "done";

export type MissionView = "kanban" | "timeline" | "tiles" | "matrix";

export interface MissionProjectStats {
  id: string;
  name: string;
  color: TodoistColor | null;
  parentId: string | null;
  order: number;
  activeCount: number;
  overdueCount: number;
  dueSoonCount: number;
  completedThisWeek: number;
  completionRate: number;
  healthScore: number;
  healthStatus: MissionHealthStatus;
  lastActivityAt: string | null;
  stale: boolean;
  earliestDue: string | null;
  latestDue: string | null;
  nextDue: string | null;
  defaultStatus: MissionKanbanStatus;
}

export interface MissionTotals {
  activeCount: number;
  overdueCount: number;
  dueSoonCount: number;
  completedThisWeek: number;
}
