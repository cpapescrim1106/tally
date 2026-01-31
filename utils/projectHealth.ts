import { MissionHealthStatus } from "@/types/mission";

interface ProjectHealthInput {
  activeCount: number;
  overdueCount: number;
  dueSoonCount: number;
  completedThisWeek: number;
  stale: boolean;
}

interface ProjectHealthResult {
  score: number;
  status: MissionHealthStatus;
  label: string;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function calculateProjectHealth({
  activeCount,
  overdueCount,
  dueSoonCount,
  completedThisWeek,
  stale
}: ProjectHealthInput): ProjectHealthResult {
  if (activeCount === 0) {
    return { score: 100, status: "done", label: "Done" };
  }

  const overdueRate = overdueCount / activeCount;
  const dueSoonRate = dueSoonCount / activeCount;

  let score = 100;
  score -= overdueRate * 100;
  score -= dueSoonRate * 20;
  if (completedThisWeek === 0) score -= 5;
  if (stale) score -= 15;

  score = clamp(score, 0, 100);

  let status: MissionHealthStatus = "healthy";
  if (score < 45) status = "critical";
  else if (score < 75) status = "watch";

  const labelMap: Record<MissionHealthStatus, string> = {
    healthy: "Healthy",
    watch: "Watch",
    critical: "Critical",
    done: "Done",
    idle: "Idle"
  };

  return { score, status, label: labelMap[status] };
}
