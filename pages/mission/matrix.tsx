import React, { useEffect, useMemo, useState } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { Virtuoso } from "react-virtuoso";
import { format, parseISO } from "date-fns";
import Layout from "@/components/layout/Layout";
import MissionHeader from "@/components/mission/MissionHeader";
import HealthBadge from "@/components/mission/HealthBadge";
import ProgressBar from "@/components/mission/ProgressBar";
import { useProjects } from "@/hooks/useProjects";
import type { MissionHealthStatus, MissionProjectStats } from "@/types/mission";

type SortKey = "name" | "tasks" | "done" | "overdue" | "health" | "due";

const healthFilters: Array<MissionHealthStatus | "all"> = ["all", "healthy", "watch", "critical", "done", "idle"];

const MatrixView: NextPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { projects, isLoading, error } = useProjects();
  const [sortKey, setSortKey] = useState<SortKey>("health");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [healthFilter, setHealthFilter] = useState<MissionHealthStatus | "all">("all");

  const filtered = useMemo(() => {
    if (healthFilter === "all") return projects;
    return projects.filter((project) => project.healthStatus === healthFilter);
  }, [healthFilter, projects]);

  const sorted = useMemo(() => {
    const sortedProjects = [...filtered];
    const multiplier = direction === "asc" ? 1 : -1;
    sortedProjects.sort((a, b) => {
      const getValue = (project: MissionProjectStats) => {
        switch (sortKey) {
          case "tasks":
            return project.activeCount;
          case "done":
            return project.completedThisWeek;
          case "overdue":
            return project.overdueCount;
          case "health":
            return project.healthScore;
          case "due":
            return project.nextDue ? new Date(project.nextDue).getTime() : Number.MAX_SAFE_INTEGER;
          case "name":
          default:
            return project.name.toLowerCase();
        }
      };

      const valueA = getValue(a);
      const valueB = getValue(b);

      if (typeof valueA === "string" && typeof valueB === "string") {
        return valueA.localeCompare(valueB) * multiplier;
      }
      if (typeof valueA === "number" && typeof valueB === "number") {
        return (valueA - valueB) * multiplier;
      }
      return 0;
    });

    return sortedProjects;
  }, [filtered, direction, sortKey]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setDirection(direction === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setDirection("desc");
    }
  };

  const formatDue = (project: MissionProjectStats) => {
    if (project.overdueCount > 0) return "Overdue";
    if (!project.nextDue) return "—";
    try {
      return format(parseISO(project.nextDue), "MMM d");
    } catch {
      return "—";
    }
  };

  useEffect(() => {
    if (!session && status !== "loading") {
      router.push("/sign-in");
    }
  }, [router, session, status]);

  if (!session && status !== "loading") {
    return null;
  }

  return (
    <Layout title="Mission Control | Matrix | Tally" description="Sortable project status matrix in Tally">
      <div className="min-h-screen bg-warm-black">
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          <MissionHeader
            title="Matrix"
            description="Compact status table for triaging many projects at once."
            actions={(
              <div className="flex flex-wrap items-center gap-3 text-xs text-warm-gray">
                <select
                  value={healthFilter}
                  onChange={(event) => setHealthFilter(event.target.value as MissionHealthStatus | "all")}
                  className="rounded-full border border-warm-border bg-warm-card px-3 py-1 text-xs text-white"
                >
                  {healthFilters.map((filter) => (
                    <option key={filter} value={filter}>
                      {filter === "all" ? "All Health" : filter}
                    </option>
                  ))}
                </select>
                <button
                  className="rounded-full border border-warm-border px-3 py-1 text-xs text-warm-gray"
                  disabled
                >
                  Bulk actions (soon)
                </button>
              </div>
            )}
          />

          {error && (
            <div className="mb-6 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-200">
              {error}
            </div>
          )}

          <div className="rounded-2xl border border-warm-border overflow-hidden">
            <div className="grid grid-cols-[minmax(180px,2fr)_0.8fr_0.8fr_0.8fr_1fr_1fr] gap-3 bg-warm-card px-4 py-3 text-xs uppercase tracking-[0.2em] text-warm-gray">
              <button className="text-left" onClick={() => handleSort("name")}>Project</button>
              <button className="text-left" onClick={() => handleSort("tasks")}>Tasks</button>
              <button className="text-left" onClick={() => handleSort("done")}>Done</button>
              <button className="text-left" onClick={() => handleSort("overdue")}>Overdue</button>
              <button className="text-left" onClick={() => handleSort("health")}>Health</button>
              <button className="text-left" onClick={() => handleSort("due")}>Due</button>
            </div>

            {isLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-10 rounded-xl bg-warm-border/40 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="h-[70vh]">
                <Virtuoso
                  data={sorted}
                  itemContent={(_, project) => (
                    <div className="grid grid-cols-[minmax(180px,2fr)_0.8fr_0.8fr_0.8fr_1fr_1fr] gap-3 px-4 py-3 border-b border-warm-border/60 items-center text-sm">
                      <div className="text-white font-medium">{project.name}</div>
                      <div>{project.activeCount}</div>
                      <div>
                        <div className="text-white font-semibold">{project.completedThisWeek}</div>
                        <ProgressBar value={project.completionRate} />
                      </div>
                      <div className={project.overdueCount > 0 ? "text-rose-300 font-semibold" : "text-warm-gray"}>
                        {project.overdueCount}
                      </div>
                      <HealthBadge status={project.healthStatus} score={project.healthScore} showScore />
                      <div className={project.overdueCount > 0 ? "text-rose-300 font-semibold" : "text-warm-gray"}>
                        {formatDue(project)}
                      </div>
                    </div>
                  )}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MatrixView;
