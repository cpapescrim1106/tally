import React, { useEffect, useMemo, useState } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { format, parseISO } from "date-fns";
import Layout from "@/components/layout/Layout";
import MissionHeader from "@/components/mission/MissionHeader";
import HealthBadge from "@/components/mission/HealthBadge";
import { useProjects } from "@/hooks/useProjects";
import type { MissionKanbanStatus, MissionProject } from "@/types/mission";

const STORAGE_KEY = "tally_mission_kanban_status";

const columns: { key: MissionKanbanStatus; title: string; description: string }[] = [
  { key: "backlog", title: "Backlog", description: "No recent momentum yet" },
  { key: "in_progress", title: "In Progress", description: "Active or overdue tasks" },
  { key: "done", title: "Done", description: "No active tasks" }
];

const formatDate = (value: string | null) => {
  if (!value) return "No activity";
  try {
    return format(parseISO(value), "MMM d");
  } catch {
    return "No activity";
  }
};

const normalizeStatus = (value: unknown): MissionKanbanStatus | null => {
  if (value === "backlog" || value === "in_progress" || value === "done") {
    return value;
  }
  if (value === "blocked") {
    return "in_progress";
  }
  return null;
};

const KanbanView: NextPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { projects, isLoading, error } = useProjects();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Record<string, MissionKanbanStatus>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Record<string, unknown>;
        const next: Record<string, MissionKanbanStatus> = {};
        Object.entries(parsed).forEach(([projectId, value]) => {
          const normalized = normalizeStatus(value);
          if (normalized) {
            next[projectId] = normalized;
          }
        });
        setOverrides(next);
      } catch {
        setOverrides({});
      }
    }
  }, []);

  const setOverride = (projectId: string, status: MissionKanbanStatus) => {
    setOverrides((prev) => {
      const next = { ...prev, [projectId]: status };
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  };

  const resetOverride = (projectId: string) => {
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[projectId];
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  };

  const grouped = useMemo(() => {
    const initial: Record<MissionKanbanStatus, MissionProject[]> = {
      backlog: [],
      in_progress: [],
      done: []
    };

    projects.forEach((project) => {
      const status = overrides[project.id] ?? project.defaultStatus;
      initial[status].push(project);
    });

    return initial;
  }, [projects, overrides]);

  useEffect(() => {
    if (!session && status !== "loading") {
      router.push("/sign-in");
    }
  }, [router, session, status]);

  if (!session && status !== "loading") {
    return null;
  }

  return (
    <Layout title="Mission Control | Kanban | Tally" description="Kanban mission control view in Tally">
      <div className="min-h-screen bg-warm-black">
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          <MissionHeader
            title="Kanban Board"
            description="Drag projects to update their mission status. Auto-status is based on task signals."
          />

          {error && (
            <div className="mb-6 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-200">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="grid gap-4 lg:grid-cols-3">
              {columns.map((column) => (
                <div key={column.key} className="h-96 rounded-2xl border border-warm-border bg-warm-card animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              {columns.map((column) => (
                <div
                  key={column.key}
                  className="rounded-2xl border border-warm-border bg-warm-card/80 p-4"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    const projectId = event.dataTransfer.getData("text/plain");
                    if (projectId) {
                      setOverride(projectId, column.key);
                    }
                  }}
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{column.title}</h3>
                      <p className="text-xs text-warm-gray">{column.description}</p>
                    </div>
                    <span className="rounded-full border border-warm-border px-2.5 py-1 text-xs text-warm-gray">
                      {grouped[column.key].length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {grouped[column.key].map((project) => {
                      const isExpanded = expandedId === project.id;
                      const hasOverride = overrides[project.id] !== undefined;
                      return (
                        <div
                          key={project.id}
                          draggable
                          onDragStart={(event) => {
                            event.dataTransfer.setData("text/plain", project.id);
                          }}
                          onClick={() => setExpandedId(isExpanded ? null : project.id)}
                          className="rounded-xl border border-warm-border bg-warm-card px-3 py-3 cursor-pointer hover:border-warm-peach/50 transition"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="text-sm font-semibold text-white">{project.name}</h4>
                              <p className="text-xs text-warm-gray">
                                {project.activeCount} tasks · {project.overdueCount} overdue
                              </p>
                            </div>
                            <HealthBadge status={project.healthStatus} />
                          </div>

                          {isExpanded && (
                            <div className="mt-3 space-y-2 text-xs text-warm-gray">
                              <div className="flex justify-between">
                                <span>Due soon</span>
                                <span>{project.dueSoonCount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Completed this week</span>
                                <span>{project.completedThisWeek}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Last activity</span>
                                <span>{formatDate(project.lastActivityAt)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Status</span>
                                <span>{hasOverride ? "Manual" : "Auto"}</span>
                              </div>
                              {hasOverride && (
                                <button
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    resetOverride(project.id);
                                  }}
                                  className="mt-2 rounded-full border border-warm-border px-3 py-1 text-xs text-warm-gray hover:text-white hover:border-warm-peach/60"
                                >
                                  Reset to auto
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default KanbanView;
