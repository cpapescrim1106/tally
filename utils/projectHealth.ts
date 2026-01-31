import type { MissionHealthStatus } from "@/types/mission";

export interface ProjectHealthInput {
  activeCount: number;
  overdueCount: number;
  dueSoonCount: number;
  completedThisWeek: number;
  stale: boolean;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function calculateHealthScore({
  activeCount,
  overdueCount,
  dueSoonCount,
  completedThisWeek,
  stale
}: ProjectHealthInput): number {
  if (activeCount === 0) {
    return 100;
  }

  const overdueRate = overdueCount / activeCount;
  const dueSoonRate = dueSoonCount / activeCount;

  let score = 100;
  score -= overdueRate * 100;
  score -= dueSoonRate * 20;
  if (completedThisWeek === 0) score -= 5;
  if (stale) score -= 15;

  return clamp(score, 0, 100);
}

export function determineStatus({
  score,
  activeCount,
  completedThisWeek
}: {
  score: number;
  activeCount: number;
  completedThisWeek: number;
}): MissionHealthStatus {
  if (activeCount === 0) {
    return completedThisWeek > 0 ? "done" : "idle";
  }

  if (score < 45) return "critical";
  if (score < 75) return "watch";
  return "healthy";
}
