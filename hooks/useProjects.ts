import { useMemo } from "react";
import useSWR from "swr";
import { addDays, differenceInCalendarDays, isAfter, isBefore, isEqual, parseISO, startOfDay, startOfWeek } from "date-fns";
import type { ActiveTask, CompletedTask, DashboardData, TodoistColor } from "@/types";
import type { MissionProject, MissionTotals } from "@/types/mission";
import { calculateHealthScore, determineStatus } from "@/utils/projectHealth";

const DUE_SOON_DAYS = 7;
const STALE_DAYS = 14;

const fetcher = async (url: string): Promise<DashboardData> => {
  const response = await fetch(url);
  if (!response.ok) {
    const message = await response.text().catch(() => "Failed to fetch data");
    throw new Error(message || "Failed to fetch data");
  }
  return response.json() as Promise<DashboardData>;
};

type ProjectAccumulator = {
  activeCount: number;
  overdueCount: number;
  dueSoonCount: number;
  completedThisWeek: number;
  earliestDue: Date | null;
  latestDue: Date | null;
  nextDue: Date | null;
  lastActivityAt: Date | null;
};

const createAccumulator = (): ProjectAccumulator => ({
  activeCount: 0,
  overdueCount: 0,
  dueSoonCount: 0,
  completedThisWeek: 0,
  earliestDue: null,
  latestDue: null,
  nextDue: null,
  lastActivityAt: null
});

const parseDate = (value?: string | null) => {
  if (!value) return null;
  const parsed = parseISO(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getDueDate = (task: ActiveTask) => parseDate(task.due?.datetime || task.due?.date || null);

const deriveDefaultStatus = (activeCount: number, overdueCount: number, completedThisWeek: number) => {
  if (activeCount === 0) return "done";
  if (overdueCount > 0) return "blocked";
  if (completedThisWeek > 0) return "in_progress";
  return "backlog";
};

export function useProjects() {
  const { data, error, isLoading, mutate } = useSWR<DashboardData>("/api/getTasks", fetcher, {
    dedupingInterval: 1000 * 60 * 5
  });

  const { projects, totals } = useMemo(() => {
    if (!data) {
      return {
        projects: [] as MissionProject[],
        totals: {
          activeCount: 0,
          overdueCount: 0,
          dueSoonCount: 0,
          completedThisWeek: 0
        } satisfies MissionTotals
      };
    }

    const today = startOfDay(new Date());
    const dueSoonThreshold = addDays(today, DUE_SOON_DAYS);
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });

    const projectMap = new Map<string, ProjectAccumulator>();
    const getAccumulator = (projectId: string) => {
      if (!projectMap.has(projectId)) {
        projectMap.set(projectId, createAccumulator());
      }
      return projectMap.get(projectId)!;
    };

    data.activeTasks.forEach((task: ActiveTask) => {
      const accumulator = getAccumulator(task.projectId);
      accumulator.activeCount += 1;

      const dueDate = getDueDate(task);
      if (dueDate) {
        if (isBefore(dueDate, today)) {
          accumulator.overdueCount += 1;
        } else if (isBefore(dueDate, dueSoonThreshold) || isEqual(dueDate, dueSoonThreshold)) {
          accumulator.dueSoonCount += 1;
        }

        if (!accumulator.earliestDue || isBefore(dueDate, accumulator.earliestDue)) {
          accumulator.earliestDue = dueDate;
        }
        if (!accumulator.latestDue || isAfter(dueDate, accumulator.latestDue)) {
          accumulator.latestDue = dueDate;
        }
        if (isAfter(dueDate, today) && (!accumulator.nextDue || isBefore(dueDate, accumulator.nextDue))) {
          accumulator.nextDue = dueDate;
        }
      }

      const createdAt = parseDate(task.createdAt);
      if (createdAt && (!accumulator.lastActivityAt || isAfter(createdAt, accumulator.lastActivityAt))) {
        accumulator.lastActivityAt = createdAt;
      }
    });

    data.allCompletedTasks.forEach((task: CompletedTask) => {
      const completedAt = parseDate(task.completed_at);
      if (!completedAt) return;
      const accumulator = getAccumulator(task.project_id);
      if (isAfter(completedAt, weekStart) || isEqual(completedAt, weekStart)) {
        accumulator.completedThisWeek += 1;
      }
      if (!accumulator.lastActivityAt || isAfter(completedAt, accumulator.lastActivityAt)) {
        accumulator.lastActivityAt = completedAt;
      }
    });

    const totalsAccumulator: MissionTotals = {
      activeCount: 0,
      overdueCount: 0,
      dueSoonCount: 0,
      completedThisWeek: 0
    };

    const projects = data.projectData
      .map((project) => {
        const accumulator = projectMap.get(project.id) ?? createAccumulator();
        const lastActivityAt = accumulator.lastActivityAt;
        const stale =
          accumulator.activeCount > 0 &&
          (!lastActivityAt || differenceInCalendarDays(new Date(), lastActivityAt) > STALE_DAYS);

        const healthScore = calculateHealthScore({
          activeCount: accumulator.activeCount,
          overdueCount: accumulator.overdueCount,
          dueSoonCount: accumulator.dueSoonCount,
          completedThisWeek: accumulator.completedThisWeek,
          stale
        });
        const healthStatus = determineStatus({
          score: healthScore,
          activeCount: accumulator.activeCount,
          completedThisWeek: accumulator.completedThisWeek
        });

        totalsAccumulator.activeCount += accumulator.activeCount;
        totalsAccumulator.overdueCount += accumulator.overdueCount;
        totalsAccumulator.dueSoonCount += accumulator.dueSoonCount;
        totalsAccumulator.completedThisWeek += accumulator.completedThisWeek;

        const completionDenominator = accumulator.activeCount + accumulator.completedThisWeek;
        const completionRate =
          completionDenominator === 0 ? 0 : accumulator.completedThisWeek / completionDenominator;

        return {
          id: project.id,
          name: project.name,
          color: (project.color as TodoistColor) || null,
          parentId: project.parentId,
          order: project.order,
          activeCount: accumulator.activeCount,
          overdueCount: accumulator.overdueCount,
          dueSoonCount: accumulator.dueSoonCount,
          completedThisWeek: accumulator.completedThisWeek,
          completionRate,
          healthScore,
          healthStatus,
          lastActivityAt: lastActivityAt ? lastActivityAt.toISOString() : null,
          stale,
          earliestDue: accumulator.earliestDue ? accumulator.earliestDue.toISOString() : null,
          latestDue: accumulator.latestDue ? accumulator.latestDue.toISOString() : null,
          nextDue: accumulator.nextDue ? accumulator.nextDue.toISOString() : null,
          defaultStatus: deriveDefaultStatus(
            accumulator.activeCount,
            accumulator.overdueCount,
            accumulator.completedThisWeek
          )
        } satisfies MissionProject;
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name));

    return { projects, totals: totalsAccumulator };
  }, [data]);

  return {
    projects,
    totals,
    labels: data?.labels ?? [],
    sections: data?.sections ?? [],
    isLoading,
    error: error ? error.message : null,
    refresh: () => mutate()
  };
}
